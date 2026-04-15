import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors, fonts, spacing } from '@/theme';

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
        {/* <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}
        <Text style={styles.logoText}>Anchor</Text>
      </View>
      <View style={styles.iconRow}>
        {/* TODO: Filter機能を追加 */}
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <MenuIcon />
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
  logo: {
    height: 50,
    width: 50,
    opacity: 0.4,
  },
  logoText: {
    fontFamily: fonts.serif,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.white,
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
