import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fonts, spacing, radius } from '@/theme';
import { userPhotos } from '@/data/mockUsers';
import { RootStackParamList } from '@/types/navigation';

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
// Mock data (per conversation)
// ────────────────────────────────────────────────────────────

const MOCK_GROUPS: Record<string, MessageGroup[]> = {
  // Kenta — パワーリフティング仲間
  c1: [
    {
      dateLabel: '4/12/2026, 7:15 AM',
      messages: [
        { id: '1', text: 'よ！マッチありがとう💪', isMine: false, liked: false, showAvatar: false },
        { id: '2', text: 'スクワット何キロ挙げてる？', isMine: false, liked: false, showAvatar: true },
      ],
    },
    {
      dateLabel: '4/12/2026, 7:30 AM',
      messages: [
        { id: '3', text: '今は140kgくらいです！', isMine: true, liked: false },
        { id: '4', text: 'Kentaさんは170kgって書いてましたよね、すごい…', isMine: true, liked: false },
      ],
    },
    {
      dateLabel: '4/14/2026, 6:50 AM',
      messages: [
        { id: '5', text: 'フォーム見せてもらえたら一緒に練習しよう', isMine: false, liked: true, showAvatar: false },
        { id: '6', text: '今週末Chocozap来る？', isMine: false, liked: false, showAvatar: true },
      ],
    },
    {
      dateLabel: '4/14/2026, 7:05 AM',
      messages: [
        { id: '7', text: '土曜の朝6時ならいけます！', isMine: true, liked: false },
      ],
    },
  ],

  // Takumi — 初心者サポート
  c2: [
    {
      dateLabel: '4/13/2026, 8:00 PM',
      messages: [
        { id: '1', text: 'はじめまして！減量中なんですよね？', isMine: true, liked: false },
      ],
    },
    {
      dateLabel: '4/13/2026, 8:10 PM',
      messages: [
        { id: '2', text: 'そうです！食事管理が難しくて😅', isMine: false, liked: false, showAvatar: false },
        { id: '3', text: 'タンパク質どのくらい摂ってますか？', isMine: false, liked: false, showAvatar: true },
      ],
    },
    {
      dateLabel: '4/15/2026, 9:00 PM',
      messages: [
        { id: '4', text: '体重×2gが目安ですよ！', isMine: true, liked: false },
        { id: '5', text: 'Where are you going to train after …', isMine: true, liked: false },
      ],
    },
    {
      dateLabel: '4/15/2026, 9:20 PM',
      messages: [
        { id: '6', text: 'ありがとうございます🙏 参考にします！', isMine: false, liked: true, showAvatar: true },
      ],
    },
  ],

  // Sota — 朝活トレ仲間
  c3: [
    {
      dateLabel: '4/11/2026, 6:20 AM',
      messages: [
        { id: '1', text: 'おはようございます！朝活仲間いた🌅', isMine: false, liked: false, showAvatar: false },
        { id: '2', text: '渋谷Gold\'s Gym使ってる？', isMine: false, liked: false, showAvatar: true },
      ],
    },
    {
      dateLabel: '4/11/2026, 6:35 AM',
      messages: [
        { id: '3', text: 'はい！週4で通ってます', isMine: true, liked: false },
        { id: '4', text: '一緒にトレしましょう！', isMine: true, liked: false },
      ],
    },
    {
      dateLabel: '4/15/2026, 6:10 AM',
      messages: [
        { id: '5', text: 'You too!', isMine: false, liked: false, showAvatar: true },
      ],
    },
  ],

  // Sho — 増量期バディ
  c4: [
    {
      dateLabel: '4/14/2026, 1:00 PM',
      messages: [
        { id: '1', text: 'ボディビル目指してるんですか？', isMine: true, liked: false },
      ],
    },
    {
      dateLabel: '4/14/2026, 1:15 PM',
      messages: [
        { id: '2', text: 'そうです！来年の大会目標にしてます', isMine: false, liked: false, showAvatar: false },
        { id: '3', text: '今は増量期で爆食い中🍚', isMine: false, liked: true, showAvatar: true },
      ],
    },
    {
      dateLabel: '4/15/2026, 12:45 PM',
      messages: [
        { id: '4', text: "Let's hit the gym together sometime!", isMine: false, liked: false, showAvatar: true },
      ],
    },
    {
      dateLabel: '4/15/2026, 1:00 PM',
      messages: [
        { id: '5', text: 'ぜひ！新宿のGold\'s Gym行きましょう', isMine: true, liked: false },
      ],
    },
  ],

  // Ryo — クロスフィット仲間
  c5: [
    {
      dateLabel: '4/10/2026, 9:00 PM',
      messages: [
        { id: '1', text: 'クロスフィットもやるんですね！', isMine: true, liked: false },
        { id: '2', text: '夜トレ派ですか？', isMine: true, liked: false },
      ],
    },
    {
      dateLabel: '4/10/2026, 9:15 PM',
      messages: [
        { id: '3', text: 'そうそう、仕事終わりに20時からが多いです', isMine: false, liked: false, showAvatar: false },
        { id: '4', text: 'Morning sessions are the best 💪', isMine: false, liked: false, showAvatar: true },
      ],
    },
    {
      dateLabel: '4/13/2026, 9:30 PM',
      messages: [
        { id: '5', text: 'Ebisu Tipness一緒に行きたい！', isMine: true, liked: false },
      ],
    },
    {
      dateLabel: '4/13/2026, 9:45 PM',
      messages: [
        { id: '6', text: '来週どう？水曜とか', isMine: false, liked: true, showAvatar: true },
      ],
    },
  ],

  // New match entries (no messages yet)
  m1: [{ dateLabel: '4/16/2026, 10:00 AM', messages: [] }],
  m2: [{ dateLabel: '4/16/2026, 10:00 AM', messages: [] }],
  m3: [{ dateLabel: '4/16/2026, 10:00 AM', messages: [] }],
  m4: [{ dateLabel: '4/16/2026, 10:00 AM', messages: [] }],
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
  const { name, verified, photoKey } = route.params;
  const photo = userPhotos[photoKey]?.[0];

  const [groups, setGroups] = useState<MessageGroup[]>(
    MOCK_GROUPS[route.params.conversationId] ?? [{ dateLabel: '4/16/2026, 10:00 AM', messages: [] }]
  );
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

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

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const now = new Date();
    const label = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    setGroups((prev) => {
      const last = prev[prev.length - 1];
      const newMsg: ChatMessage = {
        id: String(Date.now()),
        text,
        isMine: true,
        liked: false,
      };
      if (last && last.messages.length === 0) {
        // update the last empty group
        return prev.slice(0, -1).concat({ dateLabel: label, messages: [newMsg] });
      }
      return [...prev, { dateLabel: label, messages: [newMsg] }];
    });

    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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
