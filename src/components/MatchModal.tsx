import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts, spacing, radius } from '@/theme';
import { User } from '@/types/user';
import { userPhotos } from '@/data/mockUsers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = 110;

interface MatchModalProps {
  visible: boolean;
  matchedUser: User | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  matchedUser,
  onSendMessage,
  onKeepSwiping,
}) => {
  // ── アニメーション値 ──────────────────────────────────────────
  const bgOpacity      = useSharedValue(0);
  const selfX          = useSharedValue(-SCREEN_WIDTH * 0.5);
  const matchX         = useSharedValue(SCREEN_WIDTH * 0.5);
  const titleScale     = useSharedValue(0.4);
  const titleOpacity   = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const heartScale     = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // リセット
      bgOpacity.value      = 0;
      selfX.value          = -SCREEN_WIDTH * 0.5;
      matchX.value         = SCREEN_WIDTH * 0.5;
      titleScale.value     = 0.4;
      titleOpacity.value   = 0;
      subtitleOpacity.value = 0;
      buttonsOpacity.value = 0;
      heartScale.value     = 0;

      // シーケンス開始
      // 1. 背景フェードイン
      bgOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });

      // 2. アバター スライドイン (200ms 後)
      selfX.value  = withDelay(200, withSpring(0, { damping: 14, stiffness: 120 }));
      matchX.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 120 }));

      // 3. ハート ポップイン
      heartScale.value = withDelay(450, withSpring(1, { damping: 10, stiffness: 200 }));

      // 4. タイトル ズームイン
      titleOpacity.value = withDelay(550, withTiming(1, { duration: 250 }));
      titleScale.value   = withDelay(550, withSpring(1, { damping: 12, stiffness: 150 }));

      // 5. サブタイトル フェードイン
      subtitleOpacity.value = withDelay(750, withTiming(1, { duration: 300 }));

      // 6. ボタン フェードイン
      buttonsOpacity.value = withDelay(950, withTiming(1, { duration: 300 }));
    }
  }, [visible]);

  // ── Animated styles ──────────────────────────────────────────
  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));

  const selfAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: selfX.value }],
  }));
  const matchAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: matchX.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonsStyle  = useAnimatedStyle(() => ({ opacity: buttonsOpacity.value }));

  if (!matchedUser) return null;

  const matchedPhoto = userPhotos[matchedUser.id]?.[0];

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      {/* 背景 */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.bg, bgStyle]}>

        {/* アバター列 */}
        <View style={styles.avatarRow}>
          {/* 自分のアバター（左から） */}
          <Animated.View style={[styles.avatarWrap, selfAvatarStyle]}>
            <View style={[styles.avatarCircle, styles.selfAvatar]}>
              <Text style={styles.selfInitial}>Me</Text>
            </View>
            <View style={styles.avatarRing} />
          </Animated.View>

          {/* ハートアイコン */}
          <Animated.View style={[styles.heartWrap, heartStyle]}>
            <Text style={styles.heartEmoji}>❤️</Text>
          </Animated.View>

          {/* マッチした相手（右から） */}
          <Animated.View style={[styles.avatarWrap, matchAvatarStyle]}>
            {matchedPhoto ? (
              <Image source={matchedPhoto} style={styles.avatarCircle} />
            ) : (
              <View style={[styles.avatarCircle, styles.selfAvatar]}>
                <Text style={styles.selfInitial}>{matchedUser.initial}</Text>
              </View>
            )}
            <View style={styles.avatarRing} />
          </Animated.View>
        </View>

        {/* タイトル */}
        <Animated.Text style={[styles.title, titleStyle]}>
          It's a Match!
        </Animated.Text>

        {/* サブタイトル */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          You and {matchedUser.name} liked each other.{'\n'}
          Start a conversation now!
        </Animated.Text>

        {/* ボタン */}
        <Animated.View style={[styles.buttons, buttonsStyle]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={onSendMessage}
          >
            <Text style={styles.primaryBtnText}>Send a Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={onKeepSwiping}
          >
            <Text style={styles.secondaryBtnText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>
    </Modal>
  );
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  bg: {
    backgroundColor: 'rgba(5, 12, 24, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: 0,
  },

  // Avatars
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: 36,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    resizeMode: 'cover',
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    inset: -3,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  selfAvatar: {
    backgroundColor: colors.bgSurface,
  },
  selfInitial: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 28,
    color: colors.accent,
  },

  // Heart
  heartWrap: {
    marginHorizontal: -spacing.sm,
    zIndex: 1,
  },
  heartEmoji: {
    fontSize: 30,
  },

  // Texts
  title: {
    fontFamily: fonts.serif,
    fontSize: 40,
    color: colors.accent,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textBody,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
    marginBottom: 48,
  },

  // Buttons
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.round,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.bgBase,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    borderRadius: radius.round,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
