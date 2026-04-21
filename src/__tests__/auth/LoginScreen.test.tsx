import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '@/screens/auth/LoginScreen';

// --- Mocks ---

const mockSignIn = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

const navigation = { navigate: mockNavigate } as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen', () => {
  test('メールとパスワードを入力してログインできる', async () => {
    mockSignIn.mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('パスワード'), 'password1');
    fireEvent.press(getByText('ログイン'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password1');
    });
  });

  test('メール未入力でログインボタン押下 → エラーが表示される', async () => {
    const { getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.press(getByText('ログイン'));

    await waitFor(() => {
      expect(getByText('メールアドレスとパスワードを入力してください')).toBeTruthy();
    });
  });

  test('signIn失敗時にエラーが表示される', async () => {
    mockSignIn.mockRejectedValue(new Error('メールアドレスまたはパスワードが正しくありません'));
    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('パスワード'), 'wrongpass1');
    fireEvent.press(getByText('ログイン'));

    expect(await findByText('メールアドレスまたはパスワードが正しくありません')).toBeTruthy();
  });

  test('アカウント作成リンクでSignUpに遷移する', () => {
    const { getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.press(getByText('アカウントをお持ちでない方はこちら'));
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });
});
