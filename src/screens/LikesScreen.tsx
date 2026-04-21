import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '@/theme';
import { userPhotos, mockUsers } from '@/data/mockUsers';
import { User } from '@/types/user';
import { MatchModal } from '@/components/MatchModal';
import { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { likesApi } from '@/services/api';

type NavProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

// ─── 有料会員フラグ ────────────────────────────────────────────
// TODO: 認証システムと連携して動的に切り替える
const IS_PREMIUM = true;

// ─── Mock data ────────────────────────────────────────────────

interface LikedUser {
  id: string;
  name: string;
  age: number;
  photoKey: string;
  likedAgo: string;
  apiData?: any;
}

const calcAge = (birthdate?: string): number => {
  if (!birthdate) return 0;
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'たった今';
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  if (d === 1) return '昨日';
  if (d < 7) return `${d}日前`;
  return `${Math.floor(d / 7)}週間前`;
};

// ─── Icons ────────────────────────────────────────────────────

const LockIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none"
    stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const StarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24"
    fill={colors.accent} stroke={colors.accent} strokeWidth={1}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const HeartIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24"
    fill={colors.nope} stroke={colors.nope} strokeWidth={1}>
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

// ─── Swipable card ────────────────────────────────────────────

const CARD_GAP = spacing.md;
const CARD_WIDTH = (Dimensions.get('window').width - spacing.xxl * 2 - CARD_GAP) / 2;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.3;

interface SwipableLikeCardProps {
  user: LikedUser;
  onRemove: (id: string) => void;
  onMatch: (user: LikedUser) => void;
  onOpenDetail: (user: LikedUser) => void;
}

const SwipableLikeCard: React.FC<SwipableLikeCardProps> = ({ user, onRemove, onMatch, onOpenDetail }) => {
  const photo = userPhotos[user.photoKey]?.[0];
  const translateX = useSharedValue(0);
  const rotateZ   = useSharedValue(0);

  const remove       = () => onRemove(user.id);
  const triggerMatch = () => onMatch(user);
  const openDetail   = () => onOpenDetail(user);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-8, 8])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      rotateZ.value    = e.translationX * 0.06;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        triggerMatch();
        translateX.value = withTiming(CARD_WIDTH * 4, { duration: 280 });
        setTimeout(remove, 280);
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-CARD_WIDTH * 4, { duration: 280 });
        setTimeout(remove, 280);
      } else {
        translateX.value = withSpring(0);
        rotateZ.value    = withSpring(0);
      }
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(openDetail);

  const gesture = Gesture.Exclusive(pan, tap);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [16, 70], [0, 1], Extrapolation.CLAMP),
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-70, -16], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image source={photo} style={styles.cardImage} />

        {/* LIKE スタンプ */}
        <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]}>
          <Text style={[styles.stampText, { color: colors.like }]}>LIKE</Text>
        </Animated.View>

        {/* PASS スタンプ */}
        <Animated.View style={[styles.stamp, styles.stampPass, passStyle]}>
          <Text style={[styles.stampText, { color: colors.nope }]}>PASS</Text>
        </Animated.View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{user.name}, {user.age}</Text>
          <Text style={styles.cardTime}>{user.likedAgo}</Text>
        </View>
        <TouchableOpacity
          style={styles.cardHeartBadge}
          activeOpacity={0.7}
          onPress={() => {
            triggerMatch();
            translateX.value = withTiming(CARD_WIDTH * 4, { duration: 280 });
            setTimeout(remove, 280);
          }}
        >
          <HeartIcon />
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

/** 非プレミアム用: ぼかしカード */
const BlurCard: React.FC<{ user: LikedUser }> = ({ user }) => {
  const photo = userPhotos[user.photoKey]?.[0];
  return (
    <View style={styles.card}>
      <Image source={photo} style={[styles.cardImage, styles.blurredImage]} blurRadius={18} />
      <View style={styles.blurOverlay} />
    </View>
  );
};

/** 非プレミアム用: ロックオーバーレイ */
const PremiumGate: React.FC<{ count: number }> = ({ count }) => (
  <View style={styles.gateWrap} pointerEvents="box-none">
    <View style={styles.gateCard}>
      <View style={styles.gateIconWrap}>
        <LockIcon />
      </View>
      <Text style={styles.gateTitle}>プレミアム会員限定</Text>
      <Text style={styles.gateDesc}>
        あなたをLikeした{count}人を{'\n'}今すぐ確認しよう
      </Text>
      <TouchableOpacity style={styles.gateBtn} activeOpacity={0.85}>
        <View style={styles.gateBtnInner}>
          <StarIcon />
          <Text style={styles.gateBtnText}>プレミアムにアップグレード</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Profile detail overlay ───────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileDetailOverlayProps {
  user: LikedUser;
  onClose: () => void;
  onPass: () => void;
  onLike: () => void;
}

const DetailMetaRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={detailStyles.metaRow}>
    <Text style={detailStyles.metaIcon}>{icon}</Text>
    <Text style={detailStyles.metaText}>{text}</Text>
  </View>
);

const DetailWeightCell: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={detailStyles.weightCell}>
    <Text style={detailStyles.weightLabel}>{label}</Text>
    <View style={detailStyles.weightValueRow}>
      <Text style={detailStyles.weightValue}>{value}</Text>
      <Text style={detailStyles.weightUnit}>kg</Text>
    </View>
  </View>
);

const ProfileDetailOverlay: React.FC<ProfileDetailOverlayProps> = ({
  user,
  onClose,
  onPass,
  onLike,
}) => {
  const insets = useSafeAreaInsets();
  const photos = userPhotos[user.photoKey] ?? [];
  const fullUser = mockUsers.find(u => u.id === user.photoKey);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(0);

  const goNext = () => setPhotoIndex(i => Math.min(i + 1, photos.length - 1));
  const goPrev = () => setPhotoIndex(i => Math.max(i - 1, 0));

  const ACTION_BAR_HEIGHT = insets.bottom + 88;

  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView
        style={detailStyles.scroll}
        contentContainerStyle={{ paddingBottom: ACTION_BAR_HEIGHT }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Photo section (full screen height) ── */}
        <View
          style={[detailStyles.photoSection, sectionHeight > 0 && { height: sectionHeight }]}
          onLayout={e => setSectionHeight(e.nativeEvent.layout.height)}
        >
          {/* Tappable photo area */}
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={e => e.nativeEvent.locationX < SCREEN_WIDTH / 2 ? goPrev() : goNext()}
          >
            {photos.length > 0 && (
              <Image
                source={photos[photoIndex]}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>

          {/* Photo indicators */}
          <View style={[detailStyles.indicators, { top: insets.top + 14 }]}>
            {photos.map((_, i) => (
              <View key={i} style={[detailStyles.dot, i === photoIndex && detailStyles.dotActive]} />
            ))}
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={[detailStyles.closeBtn, { top: insets.top + 8 }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={detailStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(7,17,31,0.15)', 'rgba(7,17,31,0.7)', 'rgba(7,17,31,0.97)']}
            locations={[0, 0.4, 0.75, 1]}
            style={detailStyles.gradient}
            pointerEvents="none"
          />

          {/* Name / age / location */}
          <View style={detailStyles.photoInfo} pointerEvents="none">
            {fullUser?.verified && (
              <Text style={detailStyles.verified}>◆ Photo verified</Text>
            )}
            <View style={detailStyles.nameRow}>
              <Text style={detailStyles.name}>{user.name}</Text>
              <Text style={detailStyles.age}>{user.age}</Text>
            </View>
            {fullUser && (fullUser.city || fullUser.gym.distanceKm != null) && (
              <View style={detailStyles.locationRow}>
                {fullUser.city && (
                  <Text style={detailStyles.locationText}>Lives in {fullUser.city}</Text>
                )}
                {fullUser.city && fullUser.gym.distanceKm != null && (
                  <Text style={detailStyles.locationDot}>·</Text>
                )}
                {fullUser.gym.distanceKm != null && (
                  <Text style={detailStyles.locationText}>{fullUser.gym.distanceKm} km away</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* ── Content section ── */}
        {fullUser && (
          <View style={detailStyles.contentSection}>
            {/* Bio */}
            {fullUser.bio && (
              <View>
                <Text style={detailStyles.sectionLabel}>About</Text>
                <Text style={detailStyles.bio}>{fullUser.bio}</Text>
              </View>
            )}

            {/* Training Info */}
            <View>
              <Text style={detailStyles.sectionLabel}>Training Info</Text>
              <DetailMetaRow icon="⚓" text={fullUser.gym.name} />
              <DetailMetaRow icon="📅" text={`週${fullUser.frequencyPerWeek}回 · ${fullUser.trainingTime}`} />
              <DetailMetaRow icon="🏋️" text={`経験 ${fullUser.experienceYears}年 · ${fullUser.level}`} />
              {(fullUser.height != null || fullUser.weight != null) && (
                <DetailMetaRow
                  icon="📐"
                  text={[
                    fullUser.height != null && `${fullUser.height} cm`,
                    fullUser.weight != null && `${fullUser.weight} kg`,
                  ].filter(Boolean).join('  /  ')}
                />
              )}
            </View>

            {/* Big Three */}
            {fullUser.bigThree && (
              <View>
                <Text style={detailStyles.sectionLabel}>Big Three</Text>
                <View style={detailStyles.weights}>
                  <DetailWeightCell label="Bench" value={fullUser.bigThree.bench} />
                  <View style={detailStyles.weightDivider} />
                  <DetailWeightCell label="Squat" value={fullUser.bigThree.squat} />
                  <View style={detailStyles.weightDivider} />
                  <DetailWeightCell label="Deadlift" value={fullUser.bigThree.deadlift} />
                </View>
              </View>
            )}

            {/* Training Style tags */}
            {fullUser.tags && fullUser.tags.length > 0 && (
              <View>
                <Text style={detailStyles.sectionLabel}>Training Style</Text>
                <View style={detailStyles.tags}>
                  {fullUser.tags.map((t, i) => (
                    <View key={i} style={[detailStyles.tag, t.primary && detailStyles.tagPrimary]}>
                      <Text style={[detailStyles.tagText, t.primary && detailStyles.tagTextPrimary]}>
                        {t.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Interests */}
            {fullUser.interests && fullUser.interests.length > 0 && (
              <View>
                <Text style={detailStyles.sectionLabel}>Interests</Text>
                <View style={detailStyles.tags}>
                  {fullUser.interests.map((interest, i) => (
                    <View key={i} style={detailStyles.interestTag}>
                      <Text style={detailStyles.interestTagText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Action buttons ── */}
      <View style={[detailStyles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={detailStyles.passBtn} activeOpacity={0.8} onPress={onPass}>
          <Text style={detailStyles.passBtnText}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity style={detailStyles.likeBtn} activeOpacity={0.8} onPress={onLike}>
          <Text style={detailStyles.likeBtnText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const detailStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },

  // Photo section
  photoSection: {
    height: 560,
    backgroundColor: colors.bgDeep,
    overflow: 'hidden',
  },
  indicators: {
    position: 'absolute',
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
  closeBtn: {
    position: 'absolute',
    right: spacing.xxl,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.blackAlpha(0.55),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  closeBtnText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.sans,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xxl,
    zIndex: 5,
  },
  verified: {
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: 4,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.whiteAlpha(0.65),
  },
  locationDot: {
    fontSize: 12,
    color: colors.whiteAlpha(0.4),
  },

  // Content section
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
  bio: {
    fontSize: 13,
    color: colors.whiteAlpha(0.75),
    lineHeight: 21,
    fontWeight: '300',
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
  weightDivider: {
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

  // Action bar
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bgBase,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  passBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  passBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  likeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.round,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  likeBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.bgBase,
    letterSpacing: 0.5,
  },
});

// ─── Main screen ──────────────────────────────────────────────

export const LikesScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user: authUser } = useAuth();

  const [remaining, setRemaining]     = useState<LikedUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [matchedUser, setMatchedUser]   = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<LikedUser | null>(null);

  useEffect(() => {
    if (!authUser?.idToken) return;
    likesApi.getReceived(authUser.idToken)
      .then(({ likes }) => {
        setRemaining(likes.map(l => ({
          id: String(l.id),
          name: l.name,
          age: calcAge(l.birthdate),
          photoKey: String(l.from_user_id),
          likedAgo: timeAgo(l.created_at),
          apiData: l,
        })));
      })
      .catch(err => console.error('[Likes] fetch error:', err))
      .finally(() => setLoading(false));
  }, [authUser?.idToken]);

  const handleRemove = useCallback((id: string) => {
    setRemaining(prev => prev.filter(u => u.id !== id));
  }, []);

  const handleMatch = useCallback((likedUser: LikedUser) => {
    // まず mockUsers から探し、なければ apiData からミニマル User を構築
    const full: User | null = mockUsers.find(u => u.id === likedUser.photoKey) ?? (
      likedUser.apiData ? {
        id: String(likedUser.apiData.from_user_id),
        initial: likedUser.name[0]?.toUpperCase() ?? '?',
        name: likedUser.name,
        age: likedUser.age,
        gender: 'other',
        verified: false,
        gym: { id: 'gym_0', name: likedUser.apiData.gym_name ?? '–' },
        experienceYears: 0,
        frequencyPerWeek: '–',
        trainingTime: '–',
        level: likedUser.apiData.level ?? 'beginner',
        goals: [],
        bigThree: { bench: 0, squat: 0, deadlift: 0 },
        tags: [],
      } : null
    );
    if (!full) return;
    setTimeout(() => setMatchedUser(full), 350);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!matchedUser) return;
    setMatchedUser(null);
    navigation.navigate('Chat', {
      conversationId: matchedUser.id,
      name: matchedUser.name,
      verified: matchedUser.verified,
      photoKey: matchedUser.id,
    });
  }, [matchedUser, navigation]);

  const handleKeepSwiping = useCallback(() => {
    setMatchedUser(null);
  }, []);

  const handleOpenDetail = useCallback((user: LikedUser) => {
    setSelectedUser(user);
  }, []);

  const handleDetailClose = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const handleDetailPass = useCallback(() => {
    if (!selectedUser) return;
    handleRemove(selectedUser.id);
    setSelectedUser(null);
  }, [selectedUser, handleRemove]);

  const handleDetailLike = useCallback(() => {
    if (!selectedUser) return;
    handleMatch(selectedUser);
    handleRemove(selectedUser.id);
    setSelectedUser(null);
  }, [selectedUser, handleMatch, handleRemove]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Likes</Text>
          <View style={styles.headerAccent} />
          <Text style={styles.headerSub}>
            {IS_PREMIUM
              ? `${remaining.length}人があなたをLikeしました`
              : 'あなたをLikeした人が表示されます'}
          </Text>
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {remaining.map((user) =>
              IS_PREMIUM
                ? <SwipableLikeCard
                    key={user.id}
                    user={user}
                    onRemove={handleRemove}
                    onMatch={handleMatch}
                    onOpenDetail={handleOpenDetail}
                  />
                : <BlurCard key={user.id} user={user} />
            )}
            {IS_PREMIUM && remaining.length === 0 && (
              <Text style={styles.emptyText}>全員チェック済みです！</Text>
            )}
          </View>
        )}
      </ScrollView>

      {!IS_PREMIUM && <PremiumGate count={remaining.length} />}

      <MatchModal
        visible={matchedUser !== null}
        matchedUser={matchedUser}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
      />

      {selectedUser && (
        <ProfileDetailOverlay
          user={selectedUser}
          onClose={handleDetailClose}
          onPass={handleDetailPass}
          onLike={handleDetailLike}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.white,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  headerAccent: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.accent,
    borderRadius: radius.round,
    marginBottom: spacing.md,
  },
  headerSub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xxl,
    gap: CARD_GAP,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    width: '100%',
    paddingTop: spacing.xxl,
    letterSpacing: 0.3,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: radius.large,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blurredImage: {
    opacity: 0.35,
  },

  // Stamp
  stamp: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stampLike: {
    top: 12,
    left: 10,
    borderColor: colors.like,
    transform: [{ rotate: '-12deg' }],
  },
  stampPass: {
    top: 12,
    right: 10,
    borderColor: colors.nope,
    transform: [{ rotate: '12deg' }],
  },
  stampText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
  },

  cardInfo: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  cardName: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.2,
  },
  cardTime: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.whiteAlpha(0.7),
    marginTop: 2,
    letterSpacing: 0.2,
  },
  cardHeartBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.whiteAlpha(0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Blur overlay
  blurOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colors.blackAlpha(0.25),
  },

  // Premium gate
  gateWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl * 2,
    backgroundColor: colors.blackAlpha(0.0),
  },
  gateCard: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.accentAlpha(0.3),
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  gateIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  gateTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 20,
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  gateDesc: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
    marginBottom: spacing.xl,
  },
  gateBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.round,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  gateBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gateBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.bgBase,
    letterSpacing: 0.5,
  },
});
