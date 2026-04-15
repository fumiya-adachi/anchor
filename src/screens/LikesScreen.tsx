import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, typography, fonts } from '@/theme';

export const LikesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Likes</Text>
        <View style={styles.accentLine} />
        <Text style={styles.empty}>
          Coming soon —{'\n'}People who liked you will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgBase },
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: 12,
  },
  accentLine: { width: 40, height: 1, backgroundColor: colors.accent, marginBottom: 24 },
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 22,
  },
});
