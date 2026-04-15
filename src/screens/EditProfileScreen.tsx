import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing } from '@/theme';
import { userPhotos, mockUsers } from '@/data/mockUsers';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// ── Icons ───────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"
    stroke={colors.textBody} strokeWidth={1.8} strokeLinecap="round">
    <Line x1={18} y1={6} x2={6} y2={18} />
    <Line x1={6} y1={6} x2={18} y2={18} />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"
    stroke={colors.accent} strokeWidth={2} strokeLinecap="round">
    <Line x1={12} y1={5} x2={12} y2={19} />
    <Line x1={5} y1={12} x2={19} y2={12} />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
    stroke={colors.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

// ── Photo Grid ───────────────────────────────────────────────────────────────

const TOTAL_SLOTS = 6;

const PhotoGrid: React.FC = () => {
  // u001 の写真をデフォルトで使用（将来的に自分のユーザーIDに差し替え）
  const initialPhotos = userPhotos['u001'] ?? [];
  const [photos, setPhotos] = useState<(ReturnType<typeof require> | null)[]>([
    ...initialPhotos,
    ...Array(TOTAL_SLOTS - initialPhotos.length).fill(null),
  ]);

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    updated.push(null);
    setPhotos(updated);
  };

  return (
    <View style={gridStyles.container}>
      {photos.map((photo, i) => (
        <View key={i} style={gridStyles.cell}>
          {photo ? (
            <>
              <Image source={photo} style={gridStyles.image} resizeMode="cover" />
              <TouchableOpacity
                style={gridStyles.removeBtn}
                onPress={() => removePhoto(i)}
                activeOpacity={0.8}
              >
                <CloseIcon />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={gridStyles.addCell} activeOpacity={0.7}>
              <View style={gridStyles.addDot} />
              <View style={gridStyles.addIcon}>
                <PlusIcon />
              </View>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '31%',
    aspectRatio: 0.75,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.bgBase,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCell: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

// ── Section Components ───────────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string; dot?: boolean }> = ({ label, dot }) => (
  <View style={sectionStyles.row}>
    {dot && <View style={sectionStyles.dot} />}
    <Text style={sectionStyles.label}>{label}</Text>
  </View>
);

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    marginTop: 28,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.white,
    textTransform: 'uppercase',
  },
});

// タップで遷移する選択系フィールド
const FieldRow: React.FC<{ label: string; value?: string; placeholder?: string }> = ({
  label, value, placeholder,
}) => (
  <TouchableOpacity style={fieldStyles.row} activeOpacity={0.7}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View style={fieldStyles.right}>
      <Text style={[fieldStyles.value, !value && fieldStyles.placeholder]}>
        {value || placeholder || 'Add'}
      </Text>
      <ChevronIcon />
    </View>
  </TouchableOpacity>
);

// インライン入力フィールド
const InputRow: React.FC<{
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  unit?: string;
  keyboardType?: 'numeric' | 'default';
}> = ({ label, value, onChangeText, placeholder, unit, keyboardType = 'default' }) => (
  <View style={fieldStyles.row}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View style={fieldStyles.right}>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Add'}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        returnKeyType="done"
        textAlign="right"
      />
      {unit && <Text style={fieldStyles.unit}>{unit}</Text>}
    </View>
  </View>
);

const fieldStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textBody,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textBody,
  },
  placeholder: {
    color: colors.textMuted,
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textBody,
    minWidth: 60,
    maxWidth: 140,
    padding: 0,
  },
  unit: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
  },
});

// ── Preview Tab ──────────────────────────────────────────────────────────────

const WeightCell: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={previewStyles.weightCell}>
    <Text style={previewStyles.weightLabel}>{label}</Text>
    <View style={previewStyles.weightValueRow}>
      <Text style={previewStyles.weightValue}>{value}</Text>
      <Text style={previewStyles.weightUnit}>kg</Text>
    </View>
  </View>
);

const MetaRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={previewStyles.metaRow}>
    <Text style={previewStyles.metaIcon}>{icon}</Text>
    <Text style={previewStyles.metaText}>{text}</Text>
  </View>
);

const PreviewTab: React.FC<{ bio: string }> = ({ bio }) => {
  const user = mockUsers[0]; // u001 をプレビュー用に使用（将来は自分のデータに）
  const photos = userPhotos[user.id] ?? [];
  const [photoIndex, setPhotoIndex] = useState(0);

  // photo section はモーダルの高さに合わせて調整
  const photoHeight = SCREEN_HEIGHT * 0.5;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} bounces={false}>

      {/* ── 写真セクション ── */}
      <View style={[previewStyles.photoSection, { height: photoHeight }]}>
        {photos.length > 0 && (
          <Image
            source={photos[photoIndex]}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}

        {/* インジケーター */}
        <View style={previewStyles.indicators}>
          {photos.map((_, i) => (
            <View key={i} style={[previewStyles.dot, i === photoIndex && previewStyles.dotActive]} />
          ))}
        </View>

        {/* タップで写真切替 */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row' }}
            activeOpacity={1}
            onPress={() => {}}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setPhotoIndex(i => Math.max(i - 1, 0))}
            />
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setPhotoIndex(i => Math.min(i + 1, photos.length - 1))}
            />
          </TouchableOpacity>
        </View>

        {/* グラデーション */}
        <LinearGradient
          colors={['transparent', 'rgba(7,17,31,0.15)', 'rgba(7,17,31,0.7)', 'rgba(7,17,31,0.97)']}
          locations={[0, 0.4, 0.75, 1]}
          style={previewStyles.overlay}
          pointerEvents="none"
        />

        {/* 名前・年齢・verified */}
        <View style={previewStyles.photoInfo} pointerEvents="none">
          {user.verified && (
            <Text style={previewStyles.verified}>◆ Photo verified</Text>
          )}
          <View style={previewStyles.nameRow}>
            <Text style={previewStyles.name}>{user.name}</Text>
            <Text style={previewStyles.age}>{user.age}</Text>
          </View>
        </View>
      </View>

      {/* ── コンテンツセクション ── */}
      <View style={previewStyles.contentSection}>

        {/* About */}
        <View style={previewStyles.block}>
          <Text style={previewStyles.sectionLabel}>About</Text>
          <Text style={previewStyles.bio}>
            {bio || user.bio || 'Your bio will appear here...'}
          </Text>
        </View>

        {/* Training Info */}
        <View style={previewStyles.block}>
          <Text style={previewStyles.sectionLabel}>Training Info</Text>
          <MetaRow icon="⚓" text={user.gym.name} />
          <MetaRow icon="📅" text={`週${user.frequencyPerWeek}回 · ${user.trainingTime}`} />
          <MetaRow icon="🏋️" text={`経験 ${user.experienceYears}年 · ${user.level}`} />
          {(user.height != null || user.weight != null) && (
            <MetaRow
              icon="📐"
              text={[
                user.height != null && `${user.height} cm`,
                user.weight != null && `${user.weight} kg`,
              ].filter(Boolean).join('  /  ')}
            />
          )}
        </View>

        {/* Big Three */}
        <View style={previewStyles.block}>
          <Text style={previewStyles.sectionLabel}>Big Three</Text>
          <View style={previewStyles.weights}>
            <WeightCell label="Bench" value={user.bigThree.bench} />
            <View style={previewStyles.weightDivider} />
            <WeightCell label="Squat" value={user.bigThree.squat} />
            <View style={previewStyles.weightDivider} />
            <WeightCell label="Deadlift" value={user.bigThree.deadlift} />
          </View>
        </View>

        {/* Training Style */}
        <View style={previewStyles.block}>
          <Text style={previewStyles.sectionLabel}>Training Style</Text>
          <View style={previewStyles.tags}>
            {user.tags.map((t, i) => (
              <View key={i} style={[previewStyles.tag, t.primary && previewStyles.tagPrimary]}>
                <Text style={[previewStyles.tagText, t.primary && previewStyles.tagTextPrimary]}>
                  {t.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <View style={previewStyles.block}>
            <Text style={previewStyles.sectionLabel}>Interests</Text>
            <View style={previewStyles.tags}>
              {user.interests.map((interest, i) => (
                <View key={i} style={previewStyles.interestTag}>
                  <Text style={previewStyles.interestTagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

const previewStyles = StyleSheet.create({
  // 写真セクション
  photoSection: {
    backgroundColor: colors.bgDeep,
    overflow: 'hidden',
  },
  indicators: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 5,
    zIndex: 10,
  },
  dot: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xxl,
    zIndex: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.white,
    letterSpacing: 0.5,
  },
  age: {
    fontFamily: fonts.serifRegular,
    fontSize: 24,
    color: colors.whiteAlpha(0.75),
    fontStyle: 'italic',
  },
  verified: {
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  // コンテンツセクション
  contentSection: {
    backgroundColor: colors.bgDeep,
    padding: spacing.xxl,
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: colors.accentAlpha(0.12),
  },
  block: {
    gap: 0,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 10,
  },
  bio: {
    fontSize: 13,
    color: colors.whiteAlpha(0.75),
    lineHeight: 21,
    fontWeight: '300',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  metaIcon: {
    fontSize: 13,
    width: 20,
    textAlign: 'center',
  },
  metaText: {
    fontSize: 13,
    color: colors.textBody,
    letterSpacing: 0.2,
  },
  weights: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.accentAlpha(0.18),
  },
  weightCell: {
    flex: 1,
    alignItems: 'center',
  },
  weightDivider: {
    width: 1,
    backgroundColor: colors.accentAlpha(0.15),
    marginVertical: 8,
  },
  weightLabel: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  weightValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightValue: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.white,
  },
  weightUnit: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 2,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.accentAlpha(0.3),
    backgroundColor: colors.accentAlpha(0.04),
  },
  tagPrimary: {
    borderColor: colors.accent,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.whiteAlpha(0.8),
  },
  tagTextPrimary: {
    color: colors.white,
  },
  interestTag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.whiteAlpha(0.07),
    borderWidth: 1,
    borderColor: colors.whiteAlpha(0.12),
  },
  interestTagText: {
    fontSize: 12,
    color: colors.whiteAlpha(0.85),
    fontWeight: '400',
  },
});

// ── Main Component ───────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileScreen: React.FC<Props> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [bio, setBio] = useState('');
  const [gym, setGym] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bench, setBench] = useState('');
  const [squat, setSquat] = useState('');
  const [deadlift, setDeadlift] = useState('');

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
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>Edit Info</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.doneBtn}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* ─ Tabs ─ */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'edit' && styles.tabActive]}
            onPress={() => setActiveTab('edit')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'edit' && styles.tabTextActive]}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'preview' && styles.tabActive]}
            onPress={() => setActiveTab('preview')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'preview' && styles.tabTextActive]}>
              Preview
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─ Content ─ */}
        {activeTab === 'edit' ? (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Photos */}
              <SectionHeader label="Profile Photos" />
              <PhotoGrid />

              {/* About */}
              <SectionHeader label={`About Fumiya`} dot />
              <View style={styles.bioContainer}>
                <TextInput
                  style={styles.bioInput}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Write something about yourself..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={500}
                />
                <Text style={styles.charCount}>{500 - bio.length}</Text>
                <Text style={styles.bioHint}>
                  Do not include social media handles or other contact information in your profile.
                </Text>
              </View>

              {/* Gym */}
              <SectionHeader label="Gym" dot />
              <InputRow label="所属ジム" value={gym} onChangeText={setGym} placeholder="Add gym" />

              {/* Training Info */}
              <SectionHeader label="Training" dot />
              <InputRow label="Height" value={height} onChangeText={setHeight} placeholder="0" unit="cm" keyboardType="numeric" />
              <InputRow label="Weight" value={weight} onChangeText={setWeight} placeholder="0" unit="kg" keyboardType="numeric" />
              <FieldRow label="Experience" value="3 years" />
              <FieldRow label="Frequency" value="4–5 days/week" />
              <FieldRow label="Training Time" value="Morning 6–8" />

              {/* Big Three */}
              <SectionHeader label="Big Three" dot />
              <InputRow label="Bench Press" value={bench} onChangeText={setBench} placeholder="0" unit="kg" keyboardType="numeric" />
              <InputRow label="Squat" value={squat} onChangeText={setSquat} placeholder="0" unit="kg" keyboardType="numeric" />
              <InputRow label="Deadlift" value={deadlift} onChangeText={setDeadlift} placeholder="0" unit="kg" keyboardType="numeric" />

              {/* Goals */}
              <SectionHeader label="Goals" dot />
              <FieldRow label="Training Goals" value="Hypertrophy, Competition" />

              {/* Interests */}
              <SectionHeader label="Interests" dot />
              <FieldRow label="Passions" value="Surfing, Coffee, Hiking, Music" />

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <PreviewTab bio={bio} />
        )}
      </SafeAreaView>
    </Modal>
  );
};

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
  headerLeft: {
    width: 60,
  },
  headerTitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.3,
  },
  doneBtn: {
    width: 60,
    alignItems: 'flex-end',
  },
  doneText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.3,
  },

  // ─ Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },

  // ─ Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 20,
  },

  // ─ Bio
  bioContainer: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
  },
  bioInput: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textBody,
    minHeight: 90,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  charCount: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 6,
  },
  bioHint: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 10,
    lineHeight: 17,
  },
});
