import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fonts, spacing, radius } from '@/theme';
import { userPhotos } from '@/data/mockUsers';
import { RootStackParamList } from '@/types/navigation';
import { collection, orderBy, query, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { chatApi } from '@/services/api';
import { firestoreClient } from '@/services/firebaseClient';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  text: string;
  isMine: boolean;
  liked: boolean;
  showAvatar?: boolean;
}

interface MessageGroup {
  dateLabel: string;
  messages: ChatMessage[];
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const toDate = (ts: any): Date => {
  if (ts?.toDate) return ts.toDate();        // Firestore Timestamp (JS SDK)
  if (ts?.seconds) return new Date(ts.seconds * 1000);  // Timestamp as plain object
  if (ts?._seconds) return new Date(ts._seconds * 1000); // REST format
  return new Date(ts);
};

const formatLabel = (date: Date): string =>
  date.toLocaleString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const groupMessages = (rawMessages: any[], myUserId: number): MessageGroup[] => {
  const msgs = [...rawMessages].reverse(); // API returns desc
  const groups: MessageGroup[] = [];
  let currentDateKey = '';

  msgs.forEach((msg) => {
    const date = toDate(msg.timestamp);
    const dateKey = date.toDateString();

    if (dateKey !== currentDateKey) {
      groups.push({ dateLabel: formatLabel(date), messages: [] });
      currentDateKey = dateKey;
    }

    groups[groups.length - 1].messages.push({
      id: msg.id,
      text: msg.message,
      isMine: Number(msg.userId) === Number(myUserId),
      liked: false,
      showAvatar: false,
    });
  });

  // Show avatar on the last received message within each date group
  groups.forEach((group) => {
    for (let i = group.messages.length - 1; i >= 0; i--) {
      if (!group.messages[i].isMine) {
        group.messages[i] = { ...group.messages[i], showAvatar: true };
        break;
      }
    }
  });

  return groups;
};

// ────────────────────────────────────────────────────────────
// Icons
// ────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
    stroke={colors.nope} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const DotsIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={colors.textBody}>
    <Circle cx={5} cy={12} r={1.5} />
    <Circle cx={12} cy={12} r={1.5} />
    <Circle cx={19} cy={12} r={1.5} />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24"
    fill={filled ? colors.nope : 'none'}
    stroke={filled ? colors.nope : colors.textFaint}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);


// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

type Props = StackScreenProps<RootStackParamList, 'Chat'>;

// ────────────────────────────────────────────────────────────
// Main screen
// ────────────────────────────────────────────────────────────

export const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { name, verified, photoKey, conversationId } = route.params;
  const photo = userPhotos[photoKey]?.[0];
  const { user: authUser, dbUser, signOut } = useAuth();
  const matchId = parseInt(conversationId, 10);

  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const myUserId = dbUser?.user_id ?? dbUser?.id;

  useEffect(() => {
    if (!myUserId || isNaN(matchId)) return;

    const q = query(
      collection(firestoreClient, 'chats', `match_${matchId}`, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const raw = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(groupMessages(raw, myUserId));
        setLoading(false);
      },
      (err) => {
        console.error('[Chat] onSnapshot error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [myUserId, matchId]);

  const toggleLike = (groupIdx: number, msgId: string) => {
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi !== groupIdx
          ? g
          : {
              ...g,
              messages: g.messages.map((m) =>
                m.id === msgId ? { ...m, liked: !m.liked } : m
              ),
            }
      )
    );
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    const token = authUser?.idToken;
    if (!token) {
      Alert.alert('セッション切れ', '再ログインしてください。', [
        { text: 'OK', onPress: () => { signOut(); navigation.goBack(); } },
      ]);
      return;
    }

    try {
      await chatApi.send(token, matchId, text);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (msg.includes('無効') || msg.includes('トークン')) {
        Alert.alert('セッション切れ', '再ログインしてください。', [
          { text: 'OK', onPress: () => { signOut(); navigation.goBack(); } },
        ]);
      } else {
        Alert.alert('送信エラー', msg);
      }
    }
    // onSnapshot が自動的に画面を更新するので楽観的更新不要
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <BackIcon />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {photo && <Image source={photo} style={styles.headerAvatar} />}
          <Text style={styles.headerName}>{name}</Text>
          {verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <DotsIcon />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {loading && (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />
          )}
          {groups.map((group, gi) => (
            <View key={gi}>
              {/* Date label */}
              <Text style={styles.dateLabel}>{group.dateLabel}</Text>

              {group.messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.msgRow,
                    msg.isMine ? styles.msgRowRight : styles.msgRowLeft,
                  ]}
                >
                  {/* Received: avatar placeholder */}
                  {!msg.isMine && (
                    <View style={styles.avatarSlot}>
                      {msg.showAvatar && photo ? (
                        <Image source={photo} style={styles.msgAvatar} />
                      ) : null}
                    </View>
                  )}

                  {/* Bubble + heart */}
                  <View style={[styles.bubbleWrap, msg.isMine ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
                    <View style={[styles.bubble, msg.isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text style={[styles.bubbleText, msg.isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                        {msg.text}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.heartBtn}
                      onPress={() => toggleLike(gi, msg.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <HeartIcon filled={msg.liked} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor={colors.textFaint}
              value={inputText}
              onChangeText={setInputText}
              multiline
              returnKeyType="send"
            />
            <TouchableOpacity onPress={sendMessage} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : {}]}>
                SEND
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────

const AVATAR_SIZE = 32;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 36,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  headerName: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    color: colors.white,
    fontSize: 9,
    fontFamily: fonts.sansBold,
    lineHeight: 11,
  },

  // ── Message list ─────────────────────────────────────────
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  // Date separator
  dateLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textFaint,
    textAlign: 'center',
    marginVertical: spacing.lg,
    letterSpacing: 0.3,
  },

  // Message row
  msgRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },

  // Avatar slot (keeps alignment even when no avatar shown)
  avatarSlot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: 6,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  msgAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },

  // Bubble + heart wrapper
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '72%',
    gap: 6,
  },
  bubbleWrapLeft: {
    flexDirection: 'row',
  },
  bubbleWrapRight: {
    flexDirection: 'row-reverse',
  },

  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  bubbleMine: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.bgElevated,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  bubbleTextMine: {
    fontFamily: fonts.sans,
    color: colors.white,
  },
  bubbleTextTheirs: {
    fontFamily: fonts.sans,
    color: colors.textPrimary,
  },

  heartBtn: {
    marginBottom: 4,
  },

  // ── Input area ───────────────────────────────────────────
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bgBase,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    letterSpacing: 0.1,
  },
  sendBtn: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.textFaint,
    letterSpacing: 1.2,
  },
  sendBtnActive: {
    color: '#2563eb',
  },

});
