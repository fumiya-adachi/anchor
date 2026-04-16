import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

type Filter = { id: string; label: string };

const FILTERS: Filter[] = [
  { id: 'all', label: 'All' },
  { id: 'same_level', label: 'Same Level' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'same_age', label: 'Same Age' },
  { id: 'beginner', label: 'Beginner' },
];

interface FilterBarProps {
  onChange?: (id: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onChange }) => {
  const [active, setActive] = useState('all');

  const handlePress = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return null;
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: spacing.xxl - 2,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md + 2,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  textActive: {
    color: '#1a1208',
    fontWeight: '600',
  },
});
