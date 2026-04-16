import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { SwipeCard, SwipeDirection } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';
import { mockUsers } from '@/data/mockUsers';
import { User } from '@/types/user';
import { colors, spacing } from '@/theme';
import { RootStackParamList } from '@/types/navigation';

type NavProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

// 右スワイプでマッチが成立する確率（デモ用: 常に成立 = 1.0）
const MATCH_PROBABILITY = 1.0;

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [index, setIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    const swiped = mockUsers[index];
    console.log(`[anchor] Swipe ${direction} on user:`, swiped?.id);

    if (direction === 'right' && Math.random() < MATCH_PROBABILITY) {
      // モーダル表示はカードのフライアウトアニメーション後
      setTimeout(() => setMatchedUser(swiped), 350);
    }

    setIndex((prev) => (prev + 1) % mockUsers.length);
  }, [index]);

  const handleSendMessage = useCallback(() => {
    if (!matchedUser) return;
    setMatchedUser(null);
    navigation.navigate('Chat', {
      conversationId: matchedUser.id,
      name: matchedUser.name,
      verified: matchedUser.verified,
      photoKey: matchedUser.id,
    });
  }, [matchedUser, navigation]);

  const handleKeepSwiping = useCallback(() => {
    setMatchedUser(null);
  }, []);

  const currentUser = mockUsers[index];
  const nextUser    = mockUsers[(index + 1) % mockUsers.length];
  const thirdUser   = mockUsers[(index + 2) % mockUsers.length];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Header />
        <FilterBar />

        <View style={styles.cardArea}>
          <SwipeCard user={thirdUser} onSwipe={() => {}} isTop={false} index={2} />
          <SwipeCard user={nextUser}  onSwipe={() => {}} isTop={false} index={1} />
          <SwipeCard
            key={currentUser.id + '_' + index}
            user={currentUser}
            onSwipe={handleSwipe}
            isTop={true}
          />
        </View>
      </View>

      <MatchModal
        visible={matchedUser !== null}
        matchedUser={matchedUser}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    flex: 1,
  },
  cardArea: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
  },
});
