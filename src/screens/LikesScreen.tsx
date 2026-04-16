import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, fonts, spacing, radius } from '@/theme';
import { userPhotos } from '@/data/mockUsers';

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
}

const LIKED_USERS: LikedUser[] = [
  { id: 'u001', name: 'Sota',   age: 26, photoKey: 'u001', likedAgo: '2時間前' },
  { id: 'u002', name: 'Takumi', age: 23, photoKey: 'u002', likedAgo: '5時間前' },
  { id: 'u003', name: 'Kenta',  age: 31, photoKey: 'u003', likedAgo: '昨日' },
  { id: 'u004', name: 'Sho',    age: 28, photoKey: 'u004', likedAgo: '昨日' },
  { id: 'u005', name: 'Ryo',    age: 29, photoKey: 'u005', likedAgo: '2日前' },
  { id: 'u001b', name: 'Sota',  age: 26, photoKey: 'u001', likedAgo: '3日前' },
];

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

// ─── Sub-components ───────────────────────────────────────────

const CARD_GAP = spacing.md;
const CARD_WIDTH = (Dimensions.get('window').width - spacing.xxl * 2 - CARD_GAP) / 2;

/** プレミアム用: 通常カード */
const LikeCard: React.FC<{ user: LikedUser }> = ({ user }) => {
  const photo = userPhotos[user.photoKey]?.[0];
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <Image source={photo} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{user.name}, {user.age}</Text>
        <Text style={styles.cardTime}>{user.likedAgo}</Text>
      </View>
      <View style={styles.cardHeartBadge}>
        <HeartIcon />
      </View>
    </TouchableOpacity>
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
const PremiumGate: React.FC = () => (
  <View style={styles.gateWrap} pointerEvents="box-none">
    <View style={styles.gateCard}>
      <View style={styles.gateIconWrap}>
        <LockIcon />
      </View>
      <Text style={styles.gateTitle}>プレミアム会員限定</Text>
      <Text style={styles.gateDesc}>
        あなたをLikeした{LIKED_USERS.length}人を{'\n'}今すぐ確認しよう
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

// ─── Main screen ──────────────────────────────────────────────

export const LikesScreen: React.FC = () => {
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
              ? `${LIKED_USERS.length}人があなたをLikeしました`
              : 'あなたをLikeした人が表示されます'}
          </Text>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {LIKED_USERS.map((user) =>
            IS_PREMIUM
              ? <LikeCard key={user.id} user={user} />
              : <BlurCard key={user.id} user={user} />
          )}
        </View>
      </ScrollView>

      {/* Premium gate overlay */}
      {!IS_PREMIUM && <PremiumGate />}
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
    // フェードイン用の背景グラデーション代わり
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
