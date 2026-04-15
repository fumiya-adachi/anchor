import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { SwipeCard, SwipeDirection } from '@/components/SwipeCard';
import { ActionButtons } from '@/components/ActionButtons';
import { mockUsers } from '@/data/mockUsers';
import { colors, spacing } from '@/theme';

export const DiscoverScreen: React.FC = () => {
  const [index, setIndex] = useState(0);

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    console.log(`[anchor] Swipe ${direction} on user:`, mockUsers[index]?.id);
    // TODO: API call to record like/pass
    setIndex((prev) => (prev + 1) % mockUsers.length);
  }, [index]);

  const handleAction = (dir: SwipeDirection) => () => handleSwipe(dir);

  // 現在のカードと次のカード（背景用）
  const currentUser = mockUsers[index];
  const nextUser = mockUsers[(index + 1) % mockUsers.length];
  const thirdUser = mockUsers[(index + 2) % mockUsers.length];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Header />
        <FilterBar />

        <View style={styles.cardArea}>
          <SwipeCard user={thirdUser} onSwipe={() => {}} isTop={false} index={2} />
          <SwipeCard user={nextUser} onSwipe={() => {}} isTop={false} index={1} />
          <SwipeCard
            key={currentUser.id + '_' + index}
            user={currentUser}
            onSwipe={handleSwipe}
            isTop={true}
          />
        </View>

        <ActionButtons
          onPass={handleAction('left')}
          onSuperLike={() => console.log('[anchor] Super Like')}
          onLike={handleAction('right')}
        />
      </View>
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
