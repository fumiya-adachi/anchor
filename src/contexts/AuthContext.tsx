import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { authApi, profileApi, ProfilePayload, ProfileUpdatePayload } from '@/services/api';
import { firebaseAuth } from '@/services/firebaseClient';
import {
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirmSignUp,
  getCurrentSession,
  AuthUser,
} from '@/services/cognito';

type AuthState = {
  user: AuthUser | null;
  dbUser: any | null;
  profile: any | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  signUp: (email: string, password: string, profile: ProfilePayload) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const signInToFirebase = async (idToken: string) => {
  try {
    const { firebaseToken } = await authApi.getFirebaseToken(idToken);
    await signInWithCustomToken(firebaseAuth, firebaseToken);
  } catch (err) {
    console.error('[Auth] Firebase サインインエラー:', err);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    dbUser: null,
    profile: null,
    isLoading: true,
  });
  const pendingProfile = useRef<{ email: string; password: string; profile: ProfilePayload } | null>(null);

  // 起動時にセッション復元
  useEffect(() => {
    getCurrentSession()
      .then(async (user) => {
        if (user) {
          try {
            const [{ user: dbUser }, { profile }] = await Promise.all([
              authApi.me(user.idToken),
              profileApi.getMe(user.idToken),
            ]);
            await signInToFirebase(user.idToken);
            setState({ user, dbUser, profile, isLoading: false });
          } catch {
            setState({ user: null, dbUser: null, profile: null, isLoading: false });
          }
        } else {
          setState({ user: null, dbUser: null, profile: null, isLoading: false });
        }
      })
      .catch(() => {
        setState({ user: null, dbUser: null, profile: null, isLoading: false });
      });
  }, []);

  const signUp = async (email: string, password: string, profile: ProfilePayload) => {
    await cognitoSignUp(email, password);
    pendingProfile.current = { email, password, profile };
  };

  const confirmSignUp = async (email: string, code: string) => {
    await cognitoConfirmSignUp(email, code);
  };

  const signIn = async (email: string, password: string) => {
    const user = await cognitoSignIn(email, password);
    const pending = pendingProfile.current;
    let dbUser: any;
    if (pending && pending.email === email) {
      const res = await authApi.signup(user.idToken, pending.profile);
      dbUser = (res as any).user;
      pendingProfile.current = null;
    } else {
      const res = await authApi.signin(user.idToken);
      dbUser = res.user;
    }
    const { profile } = await profileApi.getMe(user.idToken);
    await signInToFirebase(user.idToken);
    setState({ user, dbUser, profile, isLoading: false });
  };

  const signOut = () => {
    cognitoSignOut();
    firebaseAuth.signOut().catch(() => {});
    setState({ user: null, dbUser: null, profile: null, isLoading: false });
  };

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    const currentUser = state.user;
    if (!currentUser) throw new Error('未ログインです');
    const { profile } = await profileApi.updateMe(currentUser.idToken, payload);
    setState(prev => ({ ...prev, profile }));
  }, [state.user]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    const stored = state.user?.idToken;
    if (!stored) return null;

    // JWT の exp クレームを確認し、まだ有効なら即返す（ネットワーク不要）
    try {
      const payload = JSON.parse(atob(stored.split('.')[1]));
      if (payload.exp * 1000 > Date.now() + 60_000) return stored;
    } catch {
      return stored;
    }

    // 期限切れ（または60秒以内に切れる）→ Cognito でリフレッシュ試行（3秒タイムアウト）
    const fresh = await getCurrentSession();
    if (!fresh) return null;
    if (fresh.idToken !== stored) {
      setState(prev => prev.user ? { ...prev, user: { ...prev.user!, idToken: fresh.idToken } } : prev);
    }
    return fresh.idToken;
  }, [state.user?.idToken]);

  return (
    <AuthContext.Provider value={{ ...state, signUp, confirmSignUp, signIn, signOut, updateProfile, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
