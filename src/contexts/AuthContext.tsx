import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, ProfilePayload } from '@/services/api';
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
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  signUp: (email: string, password: string, profile: ProfilePayload) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    dbUser: null,
    isLoading: true,
  });

  // 起動時にセッション復元
  useEffect(() => {
    getCurrentSession().then(async (user) => {
      if (user) {
        try {
          const { user: dbUser } = await authApi.me(user.idToken);
          setState({ user, dbUser, isLoading: false });
        } catch {
          setState({ user: null, dbUser: null, isLoading: false });
        }
      } else {
        setState({ user: null, dbUser: null, isLoading: false });
      }
    });
  }, []);

  const signUp = async (email: string, password: string, profile: ProfilePayload) => {
    await cognitoSignUp(email, password);
    // プロフィールデータを一時保存（確認後のsignInで使用）
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
    setState({ user, dbUser, isLoading: false });
  };

  const signOut = () => {
    cognitoSignOut();
    setState({ user: null, dbUser: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, confirmSignUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// signUpとsignInをまたぐプロフィールデータの一時保持
const pendingProfile = { current: null as { email: string; password: string; profile: ProfilePayload } | null };

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
