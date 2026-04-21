import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, fonts, spacing, radius } from '@/theme';
import { userPhotos } from '@/data/mockUsers';
import { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { matchesApi } from '@/services/api';

type NavProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

// ────────────────────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────────────────────

interface NewMatch {
  id: string;
  name: string;
  photo: ImageSourcePropType;
  verified: boolean;
  photoKey: string;
}

interface Conversation {
  id: string;
  name: string;
  photo: ImageSourcePropType;
  verified: boolean;
  lastMessage: string;
  isOnline: boolean;
  likesYou: boolean;
  photoKey: string;
}

// モックはフォールバック用に残す（API未接続時・写真表示用）
const MOCK_NEW_MATCHES: NewMatch[] = [];
const MOCK_CONVERSATIONS: Conversation[] = [];

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

const NewMatchItem: React.FC<{ match: NewMatch; onPress: () => void }> = ({ match, onPress }) => (
  <TouchableOpacity style={styles.matchItem} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.matchAvatarWrap}>
      <Image source={match.photo} style={styles.matchAvatar} />
      {match.verified && (
        <View style={styles.matchVerifiedBadge}>
          <Text style={styles.matchVerifiedIcon}>✓</Text>
        </View>
      )}
    </View>
    <Text style={styles.matchName} numberOfLines={1}>{match.name}</Text>
  </TouchableOpacity>
);

const ConversationItem: React.FC<{ item: Conversation; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.convRow} activeOpacity={0.7} onPress={onPress}>
    {/* Avatar */}
    <View style={styles.convAvatarWrap}>
      <Image source={item.photo} style={styles.convAvatar} />
      {item.isOnline && <View style={styles.onlineDot} />}
    </View>

    {/* Text content */}
    <View style={styles.convContent}>
      <View style={styles.convNameRow}>
        <Text style={styles.convName}>{item.name}</Text>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        )}
        {item.likesYou && (
          <View style={styles.likesYouBadge}>
            <Text style={styles.likesYouText}>LIKES YOU</Text>
          </View>
        )}
      </View>
      <View style={styles.convMessageRow}>
        {!item.likesYou && (
          <Text style={styles.replyArrow}>↩ </Text>
        )}
        <Text style={styles.convMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────

export const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user: authUser } = useAuth();

  const [matches, setMatches] = useState<NewMatch[]>(MOCK_NEW_MATCHES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.idToken) return;
    matchesApi.getAll(authUser.idToken)
      .then(({ matches: data }) => {
        setMatches(data.map(m => ({
          id: String(m.match_id),
          name: m.name,
          photo: userPhotos[String(m.partner_user_id)]?.[0] ?? null,
          verified: false,
          photoKey: String(m.partner_user_id),
        })));
      })
      .catch(err => console.error('[Messages] fetch error:', err))
      .finally(() => setLoading(false));
  }, [authUser?.idToken]);

  const openChat = (name: string, verified: boolean, photoKey: string, conversationId: string) => {
    navigation.navigate('Chat', { conversationId, name, verified, photoKey });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerAccent} />
        </View>

        {/* New Matches */}
        <Text style={styles.sectionLabel}>New matches</Text>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NewMatchItem
                match={item}
                onPress={() => openChat(item.name, item.verified, item.photoKey, item.id)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchList}
            scrollEnabled
            ListEmptyComponent={
              <Text style={styles.emptyText}>まだマッチはありません</Text>
            }
          />
        )}

        {/* Separator */}
        <View style={styles.divider} />

        {/* Conversations（チャット履歴は Firebase 連携後に実装） */}
        <Text style={styles.sectionLabel}>Messages</Text>
        {MOCK_CONVERSATIONS.map((item) => (
          <ConversationItem
            key={item.id}
            item={item}
            onPress={() => openChat(item.name, item.verified, item.photoKey, item.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────

const MATCH_AVATAR_SIZE = 72;
const CONV_AVATAR_SIZE = 60;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.white,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  headerAccent: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.accent,
    borderRadius: radius.round,
  },

  // ── Section label ────────────────────────────────────────
  sectionLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 0.3,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.md,
  },

  // ── New Matches ──────────────────────────────────────────
  matchList: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  matchItem: {
    alignItems: 'center',
    width: MATCH_AVATAR_SIZE,
  },
  matchAvatarWrap: {
    position: 'relative',
    marginBottom: 6,
  },
  matchAvatar: {
    width: MATCH_AVATAR_SIZE,
    height: MATCH_AVATAR_SIZE,
    borderRadius: MATCH_AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.border,
  },
  matchVerifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bgBase,
  },
  matchVerifiedIcon: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fonts.sansBold,
    lineHeight: 12,
  },
  matchName: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textBody,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── Divider ──────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xxl,
    marginVertical: spacing.xl,
  },

  // ── Conversations ────────────────────────────────────────
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  convAvatarWrap: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  convAvatar: {
    width: CONV_AVATAR_SIZE,
    height: CONV_AVATAR_SIZE,
    borderRadius: CONV_AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.like,
    borderWidth: 2,
    borderColor: colors.bgBase,
  },
  convContent: {
    flex: 1,
  },
  convNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  convName: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    color: colors.white,
    fontSize: 8,
    fontFamily: fonts.sansBold,
    lineHeight: 10,
  },
  likesYouBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.small,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  likesYouText: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    color: colors.bgBase,
    letterSpacing: 0.8,
  },
  convMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyArrow: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  convMessage: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.1,
    flex: 1,
  },
});
