import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle, Path, Line, Rect, Polyline } from 'react-native-svg';
import { colors, fonts, spacing } from '@/theme';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

// ── Icons ──────────────────────────────────────────────────────────────────

const GearIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const PencilIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

// ── Avatar with completion ring ────────────────────────────────────────────

const AVATAR_SIZE = 120;
const RING_THICKNESS = 3;
const RADIUS = (AVATAR_SIZE - RING_THICKNESS) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const COMPLETION = 0.6; // 60%

const AvatarRing: React.FC<{ initial: string }> = ({ initial }) => {
  const dashOffset = CIRCUMFERENCE * (1 - COMPLETION);

  return (
    <View style={avatarStyles.wrapper}>
      {/* SVG ring */}
      <Svg
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        style={avatarStyles.svgRing}
      >
        {/* Track */}
        <Circle
          cx={AVATAR_SIZE / 2}
          cy={AVATAR_SIZE / 2}
          r={RADIUS}
          stroke={colors.border}
          strokeWidth={RING_THICKNESS}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={AVATAR_SIZE / 2}
          cy={AVATAR_SIZE / 2}
          r={RADIUS}
          stroke={colors.accent}
          strokeWidth={RING_THICKNESS}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={`${dashOffset}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${AVATAR_SIZE / 2}, ${AVATAR_SIZE / 2}`}
        />
      </Svg>

      {/* Avatar circle */}
      <View style={avatarStyles.circle}>
        <Text style={avatarStyles.initial}>{initial}</Text>
      </View>
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  wrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgRing: {
    position: 'absolute',
  },
  circle: {
    width: AVATAR_SIZE - RING_THICKNESS * 2 - 6,
    height: AVATAR_SIZE - RING_THICKNESS * 2 - 6,
    borderRadius: 999,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fonts.serifRegular,
    fontSize: 48,
    color: colors.white,
  },
});

// ── Main Screen ────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  // TODO: replace with real user data
  const name = 'Username';
  const age = 30;
  const completionPct = Math.round(COMPLETION * 100);
  const [editVisible, setEditVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <EditProfileScreen visible={editVisible} onClose={() => setEditVisible(false)} />
      <SettingsScreen visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ─ Header ─ */}
        <View style={styles.topRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerAccent} />
        </View>

        {/* ─ Avatar + completion badge ─ */}
        <View style={styles.avatarSection}>
          <AvatarRing initial={name[0]} />
          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>{completionPct}% complete</Text>
          </View>
        </View>

        {/* ─ Name & age ─ */}
        <Text style={styles.name}>{name}, {age}</Text>

        {/* ─ Action buttons ─ */}
        <View style={styles.actionRow}>
          {/* Settings */}
          <View style={styles.actionCol}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => setSettingsVisible(true)}>
              <GearIcon />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Settings</Text>
          </View>

          {/* Edit Profile */}
          <View style={styles.actionCol}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => setEditVisible(true)}>
              <PencilIcon />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Edit Profile</Text>
          </View>

        </View>

        {/* ─ Divider ─ */}
        <View style={styles.divider} />

        {/* ─ Boost card ─ */}
        <View style={styles.boostCard}>
          <Text style={styles.boostIcon}>⚡</Text>
          <Text style={styles.boostTitle}>Boost</Text>
          <Text style={styles.boostDesc}>
            Be a top profile in your area for 30 minutes to get more matches.
          </Text>
          <View style={styles.dotRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.dot, i === 4 && styles.dotActive]} />
            ))}
          </View>
          <TouchableOpacity style={styles.boostBtn} activeOpacity={0.8}>
            <Text style={styles.boostBtnText}>My Boosts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ─ Top row
  topRow: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: spacing.xl,
    marginBottom: 28,
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
    borderRadius: 999,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─ Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  completionBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  completionText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.bgBase,
    letterSpacing: 0.4,
  },

  // ─ Name
  name: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.white,
    letterSpacing: 0.5,
    marginBottom: 28,
  },

  // ─ Action buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 32,
  },
  actionCol: {
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },

  // ─ Divider
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 32,
  },

  // ─ Boost card
  boostCard: {
    width: '100%',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  boostIcon: {
    fontSize: 28,
  },
  boostTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.white,
    letterSpacing: 1,
  },
  boostDesc: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textBody,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  boostBtn: {
    marginTop: 4,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  boostBtnText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.6,
  },
});
