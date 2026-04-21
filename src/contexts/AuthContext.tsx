import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authApi, profileApi, ProfilePayload, ProfileUpdatePayload } from '@/services/api';
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
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
    getCurrentSession().then(async (user) => {
      if (user) {
        try {
          const [{ user: dbUser }, { profile }] = await Promise.all([
            authApi.me(user.idToken),
            profileApi.getMe(user.idToken),
          ]);
          setState({ user, dbUser, profile, isLoading: false });
        } catch {
          setState({ user: null, dbUser: null, profile: null, isLoading: false });
        }
      } else {
        setState({ user: null, dbUser: null, profile: null, isLoading: false });
      }
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
    setState({ user, dbUser, profile, isLoading: false });
  };

  const signOut = () => {
    cognitoSignOut();
    setState({ user: null, dbUser: null, profile: null, isLoading: false });
  };

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    const currentUser = state.user;
    if (!currentUser) throw new Error('未ログインです');
    const { profile } = await profileApi.updateMe(currentUser.idToken, payload);
    setState(prev => ({ ...prev, profile }));
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, signUp, confirmSignUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
