import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, spacing } from '@/theme';

// ── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

// ── Toggle Row ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  note?: string;
  noteLink?: string;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onValueChange, note, noteLink }) => (
  <View style={rowStyles.wrapper}>
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.bgElevated, true: colors.accent }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.bgElevated}
      />
    </View>
    {note && (
      <View style={rowStyles.noteRow}>
        <Text style={rowStyles.note}>{note} </Text>
        {noteLink && (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={rowStyles.noteLink}>{noteLink}</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

const rowStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textBody,
  },
  noteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 14,
    marginTop: -4,
  },
  note: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  noteLink: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.accent,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
});

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

export const NotificationDetailScreen: React.FC<Props> = ({
  visible,
  onClose,
  title,
  description,
}) => {
  const [push, setPush] = useState(true);
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        {/* ─ Header ─ */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <ToggleRow
            label="Push notifications"
            value={push}
            onValueChange={setPush}
          />
          <ToggleRow
            label="In-app notifications"
            value={inApp}
            onValueChange={setInApp}
          />
          <ToggleRow
            label="Emails"
            value={email}
            onValueChange={setEmail}
            note="You don't have an email on your account."
            noteLink="Add email"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 24,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: spacing.lg,
  },
});
