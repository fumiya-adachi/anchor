// SignUpScreen の validatePassword をそのまま切り出してテスト
const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'パスワードは8文字以上で入力してください';
  if (!/[a-z]/.test(password)) return 'パスワードに英小文字を含めてください';
  if (!/[0-9]/.test(password)) return 'パスワードに数字を含めてください';
  return null;
};

describe('validatePassword', () => {
  test('有効: 英小文字と数字を含む8文字以上', () => {
    expect(validatePassword('password1')).toBeNull();
    expect(validatePassword('abc12345')).toBeNull();
    expect(validatePassword('a1b2c3d4')).toBeNull();
  });

  test('有効: 大文字・記号を含んでもOK', () => {
    expect(validatePassword('Password1!')).toBeNull();
    expect(validatePassword('ABC123abc')).toBeNull();
  });

  test('無効: 7文字以下', () => {
    expect(validatePassword('abc123')).toBe('パスワードは8文字以上で入力してください');
    expect(validatePassword('a1')).toBe('パスワードは8文字以上で入力してください');
  });

  test('無効: 英小文字なし', () => {
    expect(validatePassword('12345678')).toBe('パスワードに英小文字を含めてください');
    expect(validatePassword('ABCDEFG1')).toBe('パスワードに英小文字を含めてください');
  });

  test('無効: 数字なし', () => {
    expect(validatePassword('abcdefgh')).toBe('パスワードに数字を含めてください');
    expect(validatePassword('abcdefgH')).toBe('パスワードに数字を含めてください');
  });
});
