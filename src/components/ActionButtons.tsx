import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Line, Path, Polygon } from 'react-native-svg';
import { colors } from '@/theme';

interface ActionButtonsProps {
  onPass: () => void;
  onSuperLike: () => void;
  onLike: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPass,
  onSuperLike,
  onLike,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, styles.btnNope]}
        onPress={onPass}
        activeOpacity={0.75}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.nope} strokeWidth={1.8} strokeLinecap="round">
          <Line x1={18} y1={6} x2={6} y2={18} />
          <Line x1={6} y1={6} x2={18} y2={18} />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnSuper]}
        onPress={onSuperLike}
        activeOpacity={0.75}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.super} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <Polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnLike]}
        onPress={onLike}
        activeOpacity={0.75}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.like} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 94,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 20,
  },
  btn: {
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNope: {
    width: 52,
    height: 52,
    borderColor: colors.nope,
  },
  btnSuper: {
    width: 44,
    height: 44,
    borderColor: colors.super,
  },
  btnLike: {
    width: 52,
    height: 52,
    borderColor: colors.like,
  },
});
