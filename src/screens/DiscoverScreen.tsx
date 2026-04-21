import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { SwipeCard, SwipeDirection } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';
import { User } from '@/types/user';
import { colors, fonts, spacing } from '@/theme';
import { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { discoverApi, likesApi } from '@/services/api';

type NavProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

const calcAge = (birthdate?: string): number => {
  if (!birthdate) return 0;
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// APIレスポンスを SwipeCard / MatchModal が期待する User 型にマッピング
const apiToUser = (apiUser: any): User => ({
  id: String(apiUser.user_id),
  initial: apiUser.name?.[0]?.toUpperCase() ?? '?',
  name: apiUser.name ?? '–',
  age: calcAge(apiUser.birthdate),
  gender: apiUser.gender ?? 'other',
  verified: false,
  gym: { id: 'gym_0', name: apiUser.gym_name ?? '–' },
  experienceYears: apiUser.experience_years ?? 0,
  frequencyPerWeek: apiUser.frequency_per_week ?? '–',
  trainingTime: apiUser.training_time ?? '–',
  level: apiUser.level ?? 'beginner',
  goals: apiUser.goals ?? [],
  bigThree: {
    bench: apiUser.bench_press ?? 0,
    squat: apiUser.squat ?? 0,
    deadlift: apiUser.deadlift ?? 0,
  },
  tags: apiUser.tags ?? [],
  interests: (apiUser.interests ?? []).map((i: any) => i.name),
  bio: apiUser.bio,
  height: apiUser.height,
  weight: apiUser.weight,
});

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user: authUser } = useAuth();

  const [queue, setQueue] = useState<User[]>([]);
  // user.id (string) → API の数値 user_id のマップ
  const userIdMap = useRef<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!authUser?.idToken) return;
    try {
      const { users } = await discoverApi.getUsers(authUser.idToken, 20);
      const mapped = users.map(apiToUser);
      users.forEach((u, i) => {
        userIdMap.current[mapped[i].id] = u.user_id;
      });
      setQueue(mapped);
    } catch (err) {
      console.error('[Discover] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.idToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSwipe = useCallback(async (direction: SwipeDirection) => {
    const swiped = queue[0];
    if (!swiped || !authUser?.idToken) return;

    // 先にキューから取り除く
    setQueue(prev => prev.slice(1));

    const apiUserId = userIdMap.current[swiped.id];
    if (!apiUserId) return;

    if (direction === 'right') {
      try {
        const result = await likesApi.send(authUser.idToken, apiUserId);
        if (result.matched) {
          setTimeout(() => setMatchedUser(swiped), 350);
        }
      } catch (err) {
        console.error('[Discover] like error:', err);
      }
    } else {
      try {
        await likesApi.skip(authUser.idToken, apiUserId);
      } catch (err) {
        console.error('[Discover] skip error:', err);
      }
    }

    // 残り3枚以下になったら追加取得
    if (queue.length <= 4) {
      fetchUsers();
    }
  }, [queue, authUser?.idToken, fetchUsers]);

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

  const [current, next, third] = queue;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Header />
        <FilterBar />

        <View style={styles.cardArea}>
          {loading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : queue.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>近くにスワイプできる相手がいません。</Text>
              <Text style={styles.emptySubText}>条件を広げてみませんか？</Text>
            </View>
          ) : (
            <>
              {third && <SwipeCard user={third} onSwipe={() => {}} isTop={false} index={2} />}
              {next  && <SwipeCard user={next}  onSwipe={() => {}} isTop={false} index={1} />}
              {current && (
                <SwipeCard
                  key={current.id}
                  user={current}
                  onSwipe={handleSwipe}
                  isTop={true}
                />
              )}
            </>
          )}
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
  loader: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.white,
    letterSpacing: 0.5,
  },
  emptySubText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
  },
});
