import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, spacing } from '@/theme';
import { NotificationDetailScreen } from '@/screens/NotificationDetailScreen';

// ── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

// ── Components ───────────────────────────────────────────────────────────────

interface NotifRowProps {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
  last?: boolean;
}

const NotifRow: React.FC<NotifRowProps> = ({ label, description, enabled, onToggle, last }) => (
  <View style={[rowStyles.wrapper, !last && rowStyles.border]}>
    <TouchableOpacity style={rowStyles.row} onPress={onToggle} activeOpacity={0.7}>
      <Text style={rowStyles.label}>{label}</Text>
      <ChevronIcon />
    </TouchableOpacity>
    {description && !enabled && (
      <Text style={rowStyles.description}>{description}</Text>
    )}
  </View>
);

const rowStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  description: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    paddingBottom: 14,
  },
});

interface SectionProps {
  title: string;
  children: React.ReactNode;
  note?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, note }) => (
  <View style={sectionStyles.wrapper}>
    <Text style={sectionStyles.title}>{title}</Text>
    <View style={sectionStyles.group}>{children}</View>
    {note && <Text style={sectionStyles.note}>{note}</Text>}
  </View>
);

const sectionStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 6,
    paddingHorizontal: spacing.lg,
  },
  group: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  note: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: spacing.lg,
  },
});

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const NotificationSettingsScreen: React.FC<Props> = ({ visible, onClose }) => {
  const [newMessages, setNewMessages] = useState(true);
  const [newMatches, setNewMatches] = useState(true);
  const [newLikes, setNewLikes] = useState(true);
  const [expiringMatches, setExpiringMatches] = useState(true);
  const [nearbyPartners, setNearbyPartners] = useState(false);
  const [trainingReminders, setTrainingReminders] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [appUpdates, setAppUpdates] = useState(true);

  const [detailConfig, setDetailConfig] = useState<{ title: string; description: string } | null>(null);

  const openDetail = (title: string, description: string) =>
    setDetailConfig({ title, description });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        <NotificationDetailScreen
          visible={detailConfig !== null}
          onClose={() => setDetailConfig(null)}
          title={detailConfig?.title ?? ''}
          description={detailConfig?.description}
        />

        {/* ─ Header ─ */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Choose how you'd like us to keep in touch.
          </Text>

          {/* ─ Message notifications ─ */}
          <Section
            title="Message notifications"
            note={
              !newMessages
                ? 'Turning off this notification means you will miss out on new messages from your connections.'
                : undefined
            }
          >
            <NotifRow
              label="New messages"
              enabled={newMessages}
              onToggle={() => openDetail('New messages', "Turning these off might mean you miss alerts from your connections.")}
              last
            />
          </Section>

          {/* ─ Match notifications ─ */}
          <Section
            title="Match notifications"
            note={
              (!newMatches || !newLikes || !expiringMatches)
                ? 'Turning off this notification means you will miss out on your new or expiring matches.'
                : undefined
            }
          >
            <NotifRow
              label="New likes"
              enabled={newLikes}
              onToggle={() => openDetail('New likes', "Turning these off might mean you miss out on new likes.")}
            />
            <NotifRow
              label="New matches"
              enabled={newMatches}
              onToggle={() => openDetail('New matches', "Turning these off might mean you miss out on new matches.")}
            />
            <NotifRow
              label="Expiring matches"
              enabled={expiringMatches}
              onToggle={() => openDetail('Expiring matches', "Turning these off might mean you miss out on expiring matches.")}
              last
            />
          </Section>

          {/* ─ Training notifications ─ */}
          <Section
            title="Training notifications"
            note={
              !nearbyPartners
                ? 'Turning off this notification means you will not be notified when potential training partners are near your gym.'
                : undefined
            }
          >
            <NotifRow
              label="Nearby gym partners"
              enabled={nearbyPartners}
              onToggle={() => openDetail('Nearby gym partners', "Turning these off might mean you miss alerts when training partners are near your gym.")}
            />
            <NotifRow
              label="Training reminders"
              enabled={trainingReminders}
              onToggle={() => openDetail('Training reminders', "Turning these off might mean you miss your scheduled training reminders.")}
              last
            />
          </Section>

          {/* ─ Other notifications ─ */}
          <Section title="Other notifications">
            <NotifRow
              label="App updates"
              enabled={appUpdates}
              onToggle={() => openDetail('App updates', "Turning these off might mean you miss important app update notifications.")}
            />
            <NotifRow
              label="Marketing Communications"
              enabled={marketing}
              onToggle={() => openDetail('Marketing Communications', "Turning these off means you will not receive promotional communications from us.")}
              last
            />
          </Section>

          <View style={{ height: 40 }} />
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
    paddingTop: 20,
    paddingHorizontal: spacing.lg,
    gap: 16,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    marginBottom: 8,
  },
});
