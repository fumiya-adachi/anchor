import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// --- Mocks ---

const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockSignUp = jest.fn();
const mockConfirmSignUp = jest.fn();
const mockGetCurrentSession = jest.fn();

jest.mock('@/services/cognito', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  signUp: (...args: any[]) => mockSignUp(...args),
  confirmSignUp: (...args: any[]) => mockConfirmSignUp(...args),
  getCurrentSession: () => mockGetCurrentSession(),
}));

const mockAuthApi = {
  signup: jest.fn(),
  signin: jest.fn(),
  me: jest.fn(),
};

jest.mock('@/services/api', () => ({
  authApi: {
    signup: (...args: any[]) => mockAuthApi.signup(...args),
    signin: (...args: any[]) => mockAuthApi.signin(...args),
    me: (...args: any[]) => mockAuthApi.me(...args),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── 起動時セッション復元 ────────────────────────────────────────

describe('セッション復元', () => {
  test('有効なセッションがあればログイン状態になる', async () => {
    const mockUser = { cognitoId: 'abc', email: 'test@example.com', idToken: 'token' };
    mockGetCurrentSession.mockResolvedValue(mockUser);
    mockAuthApi.me.mockResolvedValue({ user: { id: 1, email: 'test@example.com' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.dbUser).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  test('セッションなしならログアウト状態になる', async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test('/me が失敗してもログアウト状態になる', async () => {
    mockGetCurrentSession.mockResolvedValue({ cognitoId: 'abc', email: 'test@example.com', idToken: 'token' });
    mockAuthApi.me.mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

// ─── signIn ─────────────────────────────────────────────────────

describe('signIn', () => {
  test('正常系: Cognito認証 → /signin → stateが更新される', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    const mockUser = { cognitoId: 'abc', email: 'test@example.com', idToken: 'token' };
    mockSignIn.mockResolvedValue(mockUser);
    mockAuthApi.signin.mockResolvedValue({ user: { id: 1, email: 'test@example.com' } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password1');
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password1');
    expect(mockAuthApi.signin).toHaveBeenCalledWith('token');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.dbUser).toBeDefined();
  });

  test('異常系: Cognito認証失敗でエラーをthrow', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    mockSignIn.mockRejectedValue(new Error('NotAuthorizedException'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    await expect(
      act(async () => { await result.current.signIn('test@example.com', 'wrongpass'); })
    ).rejects.toThrow('NotAuthorizedException');
  });
});

// ─── signOut ─────────────────────────────────────────────────────

describe('signOut', () => {
  test('signOut後はuserがnullになる', async () => {
    mockGetCurrentSession.mockResolvedValue({ cognitoId: 'abc', email: 'test@example.com', idToken: 'token' });
    mockAuthApi.me.mockResolvedValue({ user: { id: 1 } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    act(() => { result.current.signOut(); });

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.dbUser).toBeNull();
  });
});

// ─── signUp ──────────────────────────────────────────────────────

describe('signUp', () => {
  test('正常系: cognitoSignUpを呼び出す', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    mockSignUp.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    await act(async () => {
      await result.current.signUp('test@example.com', 'password1', {
        name: '田中太郎',
        gender: '男性',
        birthdate: '1995-04-01',
      });
    });

    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password1');
  });
});
