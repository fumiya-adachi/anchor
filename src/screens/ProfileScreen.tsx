import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.accentLine} />

        <View style={styles.avatarBox}>
          <Text style={styles.avatarInitial}>Y</Text>
        </View>

        <Text style={styles.name}>Your Name</Text>
        <Text style={styles.meta}>anchor · member since 2026</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TRAINING RECORD</Text>
          <Text style={styles.cardHint}>
            Log at least 1 week of training to start matching.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
          <Text style={styles.progressText}>0 / 7 days</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgBase },
  container: { padding: spacing.xxl, alignItems: 'center' },
  title: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.accent,
    letterSpacing: 2,
    marginTop: 20,
  },
  accentLine: { width: 40, height: 1, backgroundColor: colors.accent, marginTop: 12, marginBottom: 32 },
  avatarBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: colors.bgSurface,
  },
  avatarInitial: {
    fontFamily: fonts.serifRegular,
    fontSize: 56,
    color: colors.accent,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.white,
    letterSpacing: 0.5,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    marginTop: 40,
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSurface,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.accent,
    marginBottom: 8,
  },
  cardHint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textBody,
    marginBottom: 16,
    lineHeight: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
});
