import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme';
import { AuthStackParamList } from '@/types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

type ProfileData = {
  name: string;
  gender: string;
  birthdate: Date;
  photos: string[];
  email: string;
  password: string;
};

type Errors = Partial<Record<keyof ProfileData | 'verifyCode' | 'submit', string>>;

const TOTAL_STEPS = 5;
const { width } = Dimensions.get('window');
const GENDERS = ['男性', '女性', 'その他'];

const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'パスワードは8文字以上で入力してください';
  if (!/[a-z]/.test(password)) return 'パスワードに英小文字を含めてください';
  if (!/[0-9]/.test(password)) return 'パスワードに数字を含めてください';
  return null;
};

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, confirmSignUp, signIn } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    gender: '',
    birthdate: new Date(2000, 0, 1),
    photos: [],
    email: '',
    password: '',
  });

  const setError = (key: keyof Errors, msg: string) =>
    setErrors((e) => ({ ...e, [key]: msg }));

  const clearError = (key: keyof Errors) =>
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });

  const animateNext = () => {
    slideAnim.setValue(width);
    setStep((s) => s + 1);
    setErrors({});
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const animatePrev = () => {
    slideAnim.setValue(-width);
    setStep((s) => s - 1);
    setErrors({});
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const handleNext = () => {
    if (step === 0 && !profile.name.trim()) {
      setError('name', '名前を入力してください');
      return;
    }
    if (step === 1 && !profile.gender) {
      setError('gender', '性別を選択してください');
      return;
    }
    animateNext();
  };

  const handlePickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('photos', 'フォトライブラリへのアクセスを許可してください');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setProfile((p) => ({ ...p, photos: [...p.photos, ...uris].slice(0, 6) }));
      clearError('photos');
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setProfile((p) => ({ ...p, photos: p.photos.filter((u) => u !== uri) }));
  };

  const handleSubmit = async () => {
    const newErrors: Errors = {};
    if (!profile.email.trim()) newErrors.email = 'メールアドレスを入力してください';
    const pwError = validatePassword(profile.password);
    if (pwError) newErrors.password = pwError;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await signUp(profile.email.trim(), profile.password, {
        name: profile.name,
        gender: profile.gender,
        birthdate: profile.birthdate.toISOString().split('T')[0],
      });
      animateNext();
    } catch (err: any) {
      setError('submit', err.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) {
      setError('verifyCode', '確認コードを入力してください');
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(profile.email.trim(), verifyCode.trim());
      await signIn(profile.email.trim(), profile.password);
    } catch (err: any) {
      setError('verifyCode', err.message || '確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[styles.progressDot, i <= step && i < TOTAL_STEPS && styles.progressDotActive]}
        />
      ))}
    </View>
  );

  const renderStep = () => {
    if (step === TOTAL_STEPS) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>メール確認</Text>
          <Text style={styles.stepSubtitle}>{profile.email} に送信されたコードを入力してください</Text>
          <TextInput
            style={[styles.input, errors.verifyCode && styles.inputError]}
            placeholder="確認コード"
            placeholderTextColor={colors.textMuted}
            value={verifyCode}
            onChangeText={(v) => { setVerifyCode(v); clearError('verifyCode'); }}
            keyboardType="number-pad"
            autoFocus
          />
          {errors.verifyCode && <Text style={styles.errorText}>{errors.verifyCode}</Text>}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.bgBase} /> : <Text style={styles.buttonText}>確認</Text>}
          </TouchableOpacity>
        </View>
      );
    }

    if (step === 0) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>お名前は？</Text>
          <Text style={styles.stepSubtitle}>アプリ上で表示される名前を入力してください</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="名前"
            placeholderTextColor={colors.textMuted}
            value={profile.name}
            onChangeText={(v) => { setProfile((p) => ({ ...p, name: v })); clearError('name'); }}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>
      );
    }

    if (step === 1) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>性別を教えてください</Text>
          <View style={styles.genderContainer}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderButton, profile.gender === g && styles.genderButtonActive]}
                onPress={() => { setProfile((p) => ({ ...p, gender: g })); clearError('gender'); }}
              >
                <Text style={[styles.genderText, profile.gender === g && styles.genderTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={[styles.errorText, { marginTop: 12 }]}>{errors.gender}</Text>}
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>生年月日は？</Text>
          <Text style={styles.birthdateDisplay}>
            {profile.birthdate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <DateTimePicker
            value={profile.birthdate}
            mode="date"
            display="spinner"
            locale="ja-JP"
            maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
            minimumDate={new Date(1940, 0, 1)}
            onChange={(_, date) => date && setProfile((p) => ({ ...p, birthdate: date }))}
            style={styles.datePicker}
            textColor={colors.textPrimary}
          />
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>写真を追加</Text>
          <Text style={styles.stepSubtitle}>最大6枚まで選択できます</Text>
          {errors.photos && <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.photos}</Text>}
          <ScrollView contentContainerStyle={styles.photoGrid} showsVerticalScrollIndicator={false}>
            {profile.photos.map((uri) => (
              <View key={uri} style={styles.photoItem}>
                <Image source={{ uri }} style={styles.photoImage} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => handleRemovePhoto(uri)}>
                  <Text style={styles.photoRemoveText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {profile.photos.length < 6 && (
              <TouchableOpacity style={styles.photoAdd} onPress={handlePickPhotos}>
                <Text style={styles.photoAddIcon}>+</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      );
    }

    if (step === 4) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>アカウント情報</Text>
          <Text style={styles.stepSubtitle}>メールアドレスとパスワードを設定してください</Text>
          <View style={styles.form}>
            <View>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="メールアドレス"
                placeholderTextColor={colors.textMuted}
                value={profile.email}
                onChangeText={(v) => { setProfile((p) => ({ ...p, email: v })); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            <View>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="パスワード（8文字以上・英小文字と数字必須）"
                placeholderTextColor={colors.textMuted}
                value={profile.password}
                onChangeText={(v) => { setProfile((p) => ({ ...p, password: v })); clearError('password'); }}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
            {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}
          </View>
        </View>
      );
    }

    return null;
  };

  const isVerifyStep = step === TOTAL_STEPS;
  const showNext = step < TOTAL_STEPS - 1;
  const showSubmit = step === TOTAL_STEPS - 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        {step > 0 && !isVerifyStep && (
          <TouchableOpacity onPress={animatePrev} style={styles.backButton}>
            <Text style={styles.backText}>‹ 戻る</Text>
          </TouchableOpacity>
        )}
        {!isVerifyStep && renderProgressBar()}
      </View>

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        {renderStep()}
      </Animated.View>

      {!isVerifyStep && (
        <View style={styles.footer}>
          {showNext && (
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>次へ</Text>
            </TouchableOpacity>
          )}
          {showSubmit && (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.bgBase} /> : <Text style={styles.buttonText}>登録する</Text>}
            </TouchableOpacity>
          )}
          {step === 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
              <Text style={styles.link}>既にアカウントをお持ちの方はこちら</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const PHOTO_SIZE = (width - 64 - 12) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: { paddingRight: 8 },
  backText: { color: colors.accent, fontFamily: 'Inter_400Regular', fontSize: 16 },
  progressContainer: { flex: 1, flexDirection: 'row', gap: 6 },
  progressDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.bgElevated },
  progressDotActive: { backgroundColor: colors.accent },
  content: { flex: 1, paddingHorizontal: 24 },
  stepContainer: { flex: 1, paddingTop: 24 },
  stepTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: 'Inter_300Light',
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 32,
    lineHeight: 20,
  },
  form: { gap: 8 },
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
    marginTop: 6,
  },
  genderContainer: { gap: 12, marginTop: 8 },
  genderButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
  },
  genderButtonActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  genderText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textMuted },
  genderTextActive: { color: colors.accent, fontFamily: 'Inter_500Medium' },
  birthdateDisplay: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: colors.accent,
    marginBottom: 16,
  },
  datePicker: { marginTop: 8 },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 16,
  },
  photoItem: { position: 'relative' },
  photoImage: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 8 },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.blackAlpha(0.7),
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: colors.white, fontSize: 14, lineHeight: 18 },
  photoAdd: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSurface,
  },
  photoAddIcon: { color: colors.textMuted, fontSize: 32 },
  footer: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.bgBase, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  loginLink: { alignItems: 'center' },
  link: { color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 13 },
});
