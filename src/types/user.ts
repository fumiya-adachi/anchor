/**
 * anchor — ユーザー関連の型定義
 */

export type TrainingGoal =
  | 'hypertrophy'       // 筋肥大
  | 'cutting'           // 減量
  | 'powerlifting'      // パワリフ
  | 'bodybuilding'      // ボディビル
  | 'strength'          // ストレングス
  | 'general_fitness';  // 健康維持

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrainingTime =
  | 'early_morning'  // 5-7
  | 'morning'        // 7-10
  | 'daytime'        // 10-17
  | 'evening'        // 17-20
  | 'night';         // 20-23

export interface BigThree {
  bench: number;   // kg
  squat: number;
  deadlift: number;
}

export interface Gym {
  id: string;
  name: string;
  distanceKm?: number;
}

export interface User {
  id: string;
  initial: string;          // アバター用のイニシャル
  name: string;             // 表示名
  age: number;
  gender: 'male' | 'female' | 'other';
  verified: boolean;

  gym: Gym;
  experienceYears: number;
  frequencyPerWeek: string; // "4–5"
  trainingTime: string;     // "Morning 6–8"
  level: TrainingLevel;
  goals: TrainingGoal[];

  bigThree: BigThree;

  tags: Array<{ label: string; primary?: boolean }>;

  photos?: string[];        // URLリスト（将来的に）
  bio?: string;
}
