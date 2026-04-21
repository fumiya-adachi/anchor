import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'anchor_dev',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

type DiscoverFilters = {
  limit?: number;
};

// スワイプ候補一覧
// 除外条件: 自分自身 / いいね済み / スキップ済み / マッチ済み
export const getDiscoverUsers = async (
  userId: number,
  filters: DiscoverFilters = {}
): Promise<any[]> => {
  const limit = filters.limit ?? 20;

  const result = await pool.query(
    `SELECT
       u.id AS user_id,
       p.name,
       p.birthdate,
       p.bio,
       p.profile_image_url,
       p.gym_name,
       p.level,
       p.experience_years,
       p.frequency_per_week,
       p.training_time,
       p.bench_press,
       p.squat,
       p.deadlift,
       p.goals,
       p.tags,
       COALESCE(
         json_agg(
           json_build_object('id', i.id, 'name', i.name, 'category', i.category)
         ) FILTER (WHERE i.id IS NOT NULL),
         '[]'
       ) AS interests
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     LEFT JOIN profile_interests pi ON pi.profile_id = p.id
     LEFT JOIN interests i ON i.id = pi.interest_id
     WHERE u.id != $1
       -- いいね済み除外
       AND NOT EXISTS (
         SELECT 1 FROM likes l
         WHERE l.from_user_id = $1 AND l.to_user_id = u.id
       )
       -- スキップ済み除外
       AND NOT EXISTS (
         SELECT 1 FROM skips s
         WHERE s.from_user_id = $1 AND s.to_user_id = u.id
       )
       -- マッチ済み除外
       AND NOT EXISTS (
         SELECT 1 FROM matches m
         WHERE (m.user_a_id = LEAST($1, u.id) AND m.user_b_id = GREATEST($1, u.id))
       )
     GROUP BY u.id, p.id
     ORDER BY RANDOM()
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
};
