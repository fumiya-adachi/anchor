import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, fonts } from '@/theme';
import { User } from '@/types/user';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export type SwipeDirection = 'left' | 'right';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: SwipeDirection) => void;
  isTop?: boolean;
  index?: number;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipe,
  isTop = true,
  index = 0,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  const triggerSwipe = (dir: SwipeDirection) => {
    onSwipe(dir);
  };

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.2;
      rotateZ.value = e.translationX * 0.04;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.4, { duration: 300 });
        rotateZ.value = withTiming(18, { duration: 300 });
        runOnJS(triggerSwipe)('right');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.4, { duration: 300 });
        rotateZ.value = withTiming(-18, { duration: 300 });
        runOnJS(triggerSwipe)('left');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotateZ.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      const scale = 1 - index * 0.04;
      const offsetY = index * 8;
      return {
        transform: [{ scale }, { translateY: offsetY }],
        opacity: 1 - index * 0.15,
      };
    }
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ.value}deg` },
      ],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [20, 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-100, -20],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const cardContent = (
    <Animated.View style={[styles.card, cardStyle]}>
      {/* 背景グラデーション */}
      <View style={styles.photoBg}>
        <View style={styles.radialGlow} />
        <Text style={styles.avatarInitial}>{user.initial}</Text>
      </View>

      {/* 写真インジケーター */}
      <View style={styles.indicators}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === 0 && styles.dotActive]}
          />
        ))}
      </View>

      {/* LIKE / NOPE スタンプ */}
      {isTop && (
        <>
          <Animated.View style={[styles.stamp, styles.stampLike, likeStampStyle]}>
            <Text style={[styles.stampText, { color: colors.like }]}>Like</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.stampNope, nopeStampStyle]}>
            <Text style={[styles.stampText, { color: colors.nope }]}>Pass</Text>
          </Animated.View>
        </>
      )}

      {/* 下部オーバーレイ */}
      <LinearGradient
        colors={['transparent', 'rgba(7,17,31,0.2)', 'rgba(7,17,31,0.75)', 'rgba(7,17,31,0.97)']}
        locations={[0, 0.25, 0.65, 1]}
        style={styles.overlay}
        pointerEvents="none"
      />

      {/* カード情報 */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.age}>{user.age}</Text>
          {user.verified && <Text style={styles.verified}>◆ VERIFIED</Text>}
        </View>

        <View style={styles.accentLine} />

        <Text style={styles.gym}>{user.gym.name}</Text>
        <Text style={styles.meta}>
          Training {user.experienceYears} yr{user.experienceYears > 1 ? 's' : ''} · {user.frequencyPerWeek}× weekly · {user.trainingTime}
        </Text>

        {/* BIG3 */}
        <View style={styles.weights}>
          <WeightCell label="Bench" value={user.bigThree.bench} />
          <View style={styles.divider} />
          <WeightCell label="Squat" value={user.bigThree.squat} />
          <View style={styles.divider} />
          <WeightCell label="Deadlift" value={user.bigThree.deadlift} />
        </View>

        {/* タグ */}
        <View style={styles.tags}>
          {user.tags.map((t, i) => (
            <View
              key={i}
              style={[styles.tag, t.primary && styles.tagPrimary]}
            >
              <Text style={[styles.tagText, t.primary && styles.tagTextPrimary]}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  return isTop ? (
    <GestureDetector gesture={pan}>{cardContent}</GestureDetector>
  ) : (
    cardContent
  );
};

const WeightCell: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.weightCell}>
    <Text style={styles.weightLabel}>{label}</Text>
    <View style={styles.weightValueRow}>
      <Text style={styles.weightValue}>{value}</Text>
      <Text style={styles.weightUnit}>kg</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.accentAlpha(0.1),
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  photoBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#152842',
    opacity: 0.4,
  },
  avatarInitial: {
    fontFamily: fonts.serifRegular,
    fontSize: 160,
    color: colors.accent,
    opacity: 0.35,
    letterSpacing: -4,
    marginTop: -100,
  },
  indicators: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 5,
    zIndex: 10,
  },
  dot: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  stamp: {
    position: 'absolute',
    top: 70,
    borderWidth: 2,
    borderRadius: 2,
    paddingVertical: 8,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  stampLike: {
    left: 24,
    borderColor: colors.like,
    transform: [{ rotate: '-15deg' }],
  },
  stampNope: {
    right: 24,
    borderColor: colors.nope,
    transform: [{ rotate: '15deg' }],
  },
  stampText: {
    fontFamily: fonts.serif,
    fontSize: 32,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xxl,
    zIndex: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.white,
    letterSpacing: 0.5,
  },
  age: {
    fontFamily: fonts.serifRegular,
    fontSize: 24,
    color: colors.whiteAlpha(0.75),
    fontStyle: 'italic',
  },
  verified: {
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 0.5,
    alignSelf: 'center',
    marginLeft: 2,
  },
  accentLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.accent,
    marginVertical: 10,
  },
  gym: {
    fontSize: 12,
    color: colors.textBody,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: colors.whiteAlpha(0.55),
    fontWeight: '300',
  },
  weights: {
    flexDirection: 'row',
    marginTop: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.accentAlpha(0.18),
  },
  weightCell: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.accentAlpha(0.15),
    marginVertical: 8,
  },
  weightLabel: {
    fontSize: 9,
    color: colors.accent,
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  weightValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightValue: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.white,
  },
  weightUnit: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 2,
  },
  tags: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.accentAlpha(0.3),
    backgroundColor: colors.accentAlpha(0.04),
  },
  tagPrimary: {
    borderColor: colors.accent,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.whiteAlpha(0.8),
  },
  tagTextPrimary: {
    color: colors.accent,
  },
});
