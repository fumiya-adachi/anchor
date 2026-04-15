import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors, typography, spacing } from '@/theme';

/**
 * Anchorアイコン（錨） — ブランドマーク
 */
const AnchorIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={5} r={2} />
    <Line x1={12} y1={7} x2={12} y2={22} />
    <Line x1={8} y1={10} x2={16} y2={10} />
    <Path d="M4 15a8 8 0 0016 0" />
  </Svg>
);

const MenuIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round">
    <Line x1={4} y1={6} x2={20} y2={6} />
    <Line x1={4} y1={12} x2={16} y2={12} />
    <Line x1={4} y1={18} x2={12} y2={18} />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round">
    <Circle cx={11} cy={11} r={7} />
    <Line x1={21} y1={21} x2={16.65} y2={16.65} />
  </Svg>
);

export const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <AnchorIcon />
        <Text style={styles.logoText}>anchor</Text>
      </View>
      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <MenuIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <SearchIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl - 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    ...typography.brand,
    color: colors.accent,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
