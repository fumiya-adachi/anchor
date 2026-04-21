import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme';
import { AuthStackParamList } from '@/types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>anchor</Text>
        <Text style={styles.subtitle}>上質な出会いを</Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, !!error && styles.inputError]}
            placeholder="メールアドレス"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, !!error && styles.inputError]}
            placeholder="パスワード"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={(v) => { setPassword(v); setError(''); }}
            secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bgBase} />
            ) : (
              <Text style={styles.buttonText}>ログイン</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>アカウントをお持ちでない方はこちら</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 48,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_300Light',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 48,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  inputError: {
    borderColor: colors.nope,
  },
  errorText: {
    color: colors.nope,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: -8,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.bgBase,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  link: {
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
});
