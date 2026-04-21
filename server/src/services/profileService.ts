import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'anchor_dev',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

export type ProfileUpdatePayload = {
  bio?: string;
  location?: string;
  height?: number;
  weight?: number;
  experience_years?: number;
  frequency_per_week?: string;
  training_time?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  bench_press?: number;
  squat?: number;
  deadlift?: number;
  goals?: string[];
  tags?: Array<{ label: string; primary?: boolean }>;
  gym_name?: string;
  interest_ids?: number[];
};

const COMPLETION_FIELDS: Array<keyof ProfileUpdatePayload | 'profile_image_url'> = [
  'bio',
  'profile_image_url',
  'height',
  'weight',
  'experience_years',
  'frequency_per_week',
  'training_time',
  'level',
  'bench_press',
  'gym_name',
];

function calcCompletion(profile: Record<string, any>, interestCount: number): number {
  const total = COMPLETION_FIELDS.length + 2; // +2: goals, interests
  let filled = 0;
  for (const field of COMPLETION_FIELDS) {
    if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') filled++;
  }
  if (Array.isArray(profile.goals) && profile.goals.length > 0) filled++;
  if (interestCount > 0) filled++;
  return Math.round((filled / total) * 100);
}

const PROFILE_WITH_INTERESTS_QUERY = `
  SELECT
    u.id        AS user_id,
    u.email,
    p.*,
    COALESCE(
      json_agg(
        json_build_object('id', i.id, 'name', i.name, 'category', i.category)
      ) FILTER (WHERE i.id IS NOT NULL),
      '[]'
    ) AS interests
  FROM users u
  JOIN profiles p ON u.id = p.user_id
  LEFT JOIN profile_interests pi ON p.id = pi.profile_id
  LEFT JOIN interests i ON pi.interest_id = i.id
`;

export const getMyProfile = async (cognitoId: string): Promise<any> => {
  const result = await pool.query(
    `${PROFILE_WITH_INTERESTS_QUERY}
     WHERE u.cognito_id = $1
     GROUP BY u.id, u.email, p.id`,
    [cognitoId]
  );
  if (!result.rows[0]) return null;

  const profile = result.rows[0];
  const interests: any[] = profile.interests ?? [];
  return { ...profile, completion_percentage: calcCompletion(profile, interests.length) };
};

export const getProfileByUserId = async (userId: number): Promise<any> => {
  const result = await pool.query(
    `${PROFILE_WITH_INTERESTS_QUERY}
     WHERE u.id = $1
     GROUP BY u.id, u.email, p.id`,
    [userId]
  );
  if (!result.rows[0]) return null;

  const profile = result.rows[0];
  const interests: any[] = profile.interests ?? [];
  return { ...profile, completion_percentage: calcCompletion(profile, interests.length) };
};

export const updateMyProfile = async (
  cognitoId: string,
  payload: ProfileUpdatePayload
): Promise<any> => {
  const { interest_ids, ...fields } = payload;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // profiles テーブルの更新対象カラムを動的に構築
    const profileFields: Record<string, any> = {};
    const allowedColumns = [
      'bio', 'location', 'height', 'weight', 'experience_years',
      'frequency_per_week', 'training_time', 'level',
      'bench_press', 'squat', 'deadlift', 'goals', 'tags', 'gym_name',
    ] as const;

    for (const col of allowedColumns) {
      if (fields[col as keyof typeof fields] !== undefined) {
        profileFields[col] = fields[col as keyof typeof fields];
      }
    }

    if (Object.keys(profileFields).length > 0) {
      const setClauses = Object.keys(profileFields)
        .map((col, i) => `${col} = $${i + 2}`)
        .join(', ');
      const values = Object.values(profileFields);

      await client.query(
        `UPDATE profiles
         SET ${setClauses}, updated_at = NOW()
         WHERE user_id = (SELECT id FROM users WHERE cognito_id = $1)`,
        [cognitoId, ...values]
      );
    }

    // interests の差し替え（渡された場合のみ）
    if (interest_ids !== undefined) {
      await client.query(
        `DELETE FROM profile_interests
         WHERE profile_id = (
           SELECT p.id FROM profiles p
           JOIN users u ON u.id = p.user_id
           WHERE u.cognito_id = $1
         )`,
        [cognitoId]
      );

      if (interest_ids.length > 0) {
        const profileIdResult = await client.query(
          `SELECT p.id FROM profiles p
           JOIN users u ON u.id = p.user_id
           WHERE u.cognito_id = $1`,
          [cognitoId]
        );
        const profileId = profileIdResult.rows[0]?.id;

        if (profileId) {
          const insertValues = interest_ids
            .map((_, i) => `($1, $${i + 2})`)
            .join(', ');
          await client.query(
            `INSERT INTO profile_interests (profile_id, interest_id) VALUES ${insertValues}`,
            [profileId, ...interest_ids]
          );
        }
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getMyProfile(cognitoId);
};

export const getAllInterests = async (): Promise<any[]> => {
  const result = await pool.query(
    'SELECT id, name, category FROM interests ORDER BY category, name'
  );
  return result.rows;
};
