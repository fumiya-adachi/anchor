import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors, fonts, spacing } from '@/theme';

// ── Icons ────────────────────────────────────────────────────────────────────

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const LocationIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx={12} cy={10} r={3} />
  </Svg>
);

const BellIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const ShieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const FileIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6" />
  </Svg>
);

const HelpIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Line x1={12} y1={17} x2={12} y2={17} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const DiscoveryIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={11} cy={11} r={7} />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

// ── Sub components ───────────────────────────────────────────────────────────

const SectionGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={groupStyles.container}>{children}</View>
);

const groupStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
});

interface RowProps {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  description?: string;
  onPress?: () => void;
  showChevron?: boolean;
  last?: boolean;
}

const Row: React.FC<RowProps> = ({
  icon, label, value, description, onPress, showChevron = true, last = false,
}) => (
  <TouchableOpacity
    style={[rowStyles.row, !last && rowStyles.border]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={rowStyles.left}>
      {icon && <View style={rowStyles.iconWrap}>{icon}</View>}
      <View style={rowStyles.labelWrap}>
        <Text style={rowStyles.label}>{label}</Text>
        {description && <Text style={rowStyles.description}>{description}</Text>}
      </View>
    </View>
    <View style={rowStyles.right}>
      {value && <Text style={rowStyles.value}>{value}</Text>}
      {showChevron && <ChevronIcon />}
    </View>
  </TouchableOpacity>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelWrap: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textBody,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
  },
});

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ visible, onClose }) => {
  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ],
    );
  };

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
          <TouchableOpacity onPress={onClose} style={styles.headerSideBtn} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerSideBtn} activeOpacity={0.7}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─ Location ─ */}
          <SectionGroup>
            <Row
              icon={<LocationIcon />}
              label="Current location"
              value="Tokyo, JP"
              showChevron={false}
              last
            />
          </SectionGroup>

          {/* ─ Discovery ─ */}
          <SectionGroup>
            <Row
              icon={<DiscoveryIcon />}
              label="Discovery settings"
              description="Adjust distance, age range, and gym preferences."
              showChevron
            />
          </SectionGroup>

          {/* ─ General ─ */}
          <SectionGroup>
            <Row icon={<BellIcon />} label="Notification settings" />
            <Row icon={<ShieldIcon />} label="Security and Privacy" />
            <Row icon={<FileIcon />} label="Legal information" />
            <Row icon={<HelpIcon />} label="Get help" last showChevron />
          </SectionGroup>

          {/* ─ Purchases ─ */}
          <SectionGroup>
            <Row label="Restore purchases" showChevron={false} last />
          </SectionGroup>

          {/* ─ Danger zone ─ */}
          <SectionGroup>
            <TouchableOpacity
              style={[dangerStyles.btn, dangerStyles.border]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={dangerStyles.logout}>Log out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dangerStyles.btn}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Text style={dangerStyles.delete}>Delete account</Text>
            </TouchableOpacity>
          </SectionGroup>

          {/* ─ Footer ─ */}
          <View style={styles.footer}>
            <Text style={styles.appName}>anchor</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.tagline}>Find your training partner.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const dangerStyles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logout: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textBody,
  },
  delete: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.nope,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },

  // ─ Header
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSideBtn: {
    minWidth: 60,
  },
  headerTitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.3,
  },
  cancelText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
  },
  doneText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'right',
  },

  // ─ Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  // ─ Footer
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 4,
  },
  appName: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.textFaint,
    letterSpacing: 3,
  },
  version: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textFaint,
    letterSpacing: 0.4,
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textFaint,
    letterSpacing: 0.4,
  },
});
