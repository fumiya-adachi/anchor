import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView } from 'react-native';
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

import { colors, spacing, fonts } from '@/theme';
import { User } from '@/types/user';
import { userPhotos } from '@/data/mockUsers';

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
  const photos = userPhotos[user.id] ?? [];
  const photoCount = photos.length;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const [sectionW, setSectionW] = useState(0);
  const [sectionH, setSectionH] = useState(0);

  const goNext = () => setPhotoIndex((i) => Math.min(i + 1, photoCount - 1));
  const goPrev = () => setPhotoIndex((i) => Math.max(i - 1, 0));

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  const triggerSwipe = (dir: SwipeDirection) => onSwipe(dir);

  // 水平移動のみ検知（縦スクロールと競合しない）
  const pan = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.15;
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

  // 写真タップ（写真エリアのみ）
  const tap = Gesture.Tap()
    .enabled(isTop)
    .onEnd((e) => {
      if (e.x < SCREEN_WIDTH / 2) {
        runOnJS(goPrev)();
      } else {
        runOnJS(goNext)();
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

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, 100], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, -20], [1, 0], Extrapolation.CLAMP),
  }));

  const cardContent = (
    <Animated.View
      style={[styles.card, cardStyle]}
      onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
    >
      <ScrollView
        scrollEnabled={isTop}
        showsVerticalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
      >
        {/* ── 写真セクション ── */}
        <GestureDetector gesture={Gesture.Exclusive(tap)}>
          <View
            style={[styles.photoSection, cardHeight > 0 && { height: cardHeight }]}
            onLayout={(e) => {
              setSectionW(e.nativeEvent.layout.width);
              setSectionH(e.nativeEvent.layout.height);
            }}
          >

            {/* 写真 or イニシャル */}
            {photoCount > 0 ? (
              <Image
                source={photos[photoIndex]}
                style={{
                  position: 'absolute',
                  width: sectionW > 0 ? sectionW : SCREEN_WIDTH,
                  height: sectionH > 0 ? sectionH : 500,
                }}
                resizeMode="cover"
              />
            ) : (
              <>
                <View style={styles.radialGlow} />
                <Text style={styles.avatarInitial}>{user.initial}</Text>
              </>
            )}

            {/* インジケーター */}
            <View style={styles.indicators}>
              {Array.from({ length: photoCount || 1 }).map((_, i) => (
                <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
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

            {/* グラデーションオーバーレイ */}
            <LinearGradient
              colors={['transparent', 'rgba(7,17,31,0.15)', 'rgba(7,17,31,0.7)', 'rgba(7,17,31,0.97)']}
              locations={[0, 0.4, 0.75, 1]}
              style={styles.overlay}
              pointerEvents="none"
            />

            {/* 写真上に残す情報：名前・年齢・verified */}
            <View style={styles.photoInfo} pointerEvents="none">
              {user.verified && (
                <Text style={styles.verified}>◆ Photo verified</Text>
              )}
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.age}>{user.age}</Text>
              </View>
              {(user.city || user.gym.distanceKm != null) && (
                <View style={styles.locationRow}>
                  {user.city && (
                    <Text style={styles.locationText}>Lives in {user.city}</Text>
                  )}
                  {user.city && user.gym.distanceKm != null && (
                    <Text style={styles.locationDot}>·</Text>
                  )}
                  {user.gym.distanceKm != null && (
                    <Text style={styles.locationText}>{user.gym.distanceKm} km away</Text>
                  )}
                </View>
              )}
            </View>

          </View>
        </GestureDetector>

        {/* ── コンテンツセクション（スクロール先） ── */}
        <View style={styles.contentSection}>

          {/* 自己紹介 */}
          {user.bio && (
            <View style={styles.bioBlock}>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          )}

          {/* ジム・トレーニング情報 */}
          <View style={styles.metaBlock}>
            <Text style={styles.sectionLabel}>Training Info</Text>
            <MetaRow icon="⚓" text={user.gym.name} />
            <MetaRow icon="📅" text={`週${user.frequencyPerWeek}回 · ${user.trainingTime}`} />
            <MetaRow icon="🏋️" text={`経験 ${user.experienceYears}年 · ${user.level}`} />
            {(user.height != null || user.weight != null) && (
              <MetaRow
                icon="📐"
                text={[
                  user.height != null && `${user.height} cm`,
                  user.weight != null && `${user.weight} kg`,
                ].filter(Boolean).join('  /  ')}
              />
            )}
          </View>

          {/* BIG3 */}
          <View style={styles.weightsBlock}>
            <Text style={styles.sectionLabel}>Big Three</Text>
            <View style={styles.weights}>
              <WeightCell label="Bench" value={user.bigThree.bench} />
              <View style={styles.divider} />
              <WeightCell label="Squat" value={user.bigThree.squat} />
              <View style={styles.divider} />
              <WeightCell label="Deadlift" value={user.bigThree.deadlift} />
            </View>
          </View>

          {/* トレーニングタグ */}
          <View style={styles.tagsBlock}>
            <Text style={styles.sectionLabel}>Training Style</Text>
            <View style={styles.tags}>
              {user.tags.map((t, i) => (
                <View key={i} style={[styles.tag, t.primary && styles.tagPrimary]}>
                  <Text style={[styles.tagText, t.primary && styles.tagTextPrimary]}>
                    {t.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 興味・趣味 */}
          {user.interests && user.interests.length > 0 && (
            <View style={styles.tagsBlock}>
              <Text style={styles.sectionLabel}>Interests</Text>
              <View style={styles.tags}>
                {user.interests.map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </Animated.View>
  );

  return isTop ? (
    <GestureDetector gesture={pan}>{cardContent}</GestureDetector>
  ) : (
    cardContent
  );
};

// ── サブコンポーネント ──

const WeightCell: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.weightCell}>
    <Text style={styles.weightLabel}>{label}</Text>
    <View style={styles.weightValueRow}>
      <Text style={styles.weightValue}>{value}</Text>
      <Text style={styles.weightUnit}>kg</Text>
    </View>
  </View>
);

const MetaRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaIcon}>{icon}</Text>
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

// ── スタイル ──

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

  // 写真セクション
  photoSection: {
    height: 500,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radialGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#152842',
    opacity: 0.4,
  },
  avatarInitial: {
    fontFamily: fonts.serifRegular,
    fontSize: 120,
    color: colors.accent,
    opacity: 0.35,
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
    height: '50%',
  },
  stamp: {
    position: 'absolute',
    top: 50,
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
  photoInfo: {
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
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  accentLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.accent,
    marginVertical: 10,
  },
  scrollHint: {
    fontSize: 10,
    color: colors.whiteAlpha(0.4),
    letterSpacing: 1,
  },

  // コンテンツセクション
  contentSection: {
    backgroundColor: colors.bgDeep,
    padding: spacing.xxl,
    paddingBottom: spacing.xxl * 2,
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: colors.accentAlpha(0.12),
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 10,
  },
  bioBlock: {
    gap: 0,
  },
  bio: {
    fontSize: 13,
    color: colors.whiteAlpha(0.75),
    lineHeight: 21,
    fontWeight: '300',
  },
  metaBlock: {
    gap: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  metaIcon: {
    fontSize: 13,
    width: 20,
    textAlign: 'center',
  },
  metaText: {
    fontSize: 13,
    color: colors.textBody,
    letterSpacing: 0.2,
  },
  weightsBlock: {
    gap: 0,
  },
  weights: {
    flexDirection: 'row',
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
    color: colors.white,
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
    color: colors.white,
  },
  tagsBlock: {
    gap: 0,
  },
  interestTag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.whiteAlpha(0.07),
    borderWidth: 1,
    borderColor: colors.whiteAlpha(0.12),
  },
  interestTagText: {
    fontSize: 12,
    color: colors.whiteAlpha(0.85),
    fontWeight: '400',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.whiteAlpha(0.65),
    fontWeight: '400',
  },
  locationDot: {
    fontSize: 12,
    color: colors.whiteAlpha(0.4),
  },
});
