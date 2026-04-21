import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'anchor_dev',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

// いいねを送る。相互いいねの場合はマッチを作成し matched: true を返す
export const sendLike = async (
  fromUserId: number,
  toUserId: number
): Promise<{ matched: boolean; matchId?: number }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 既にいいね済みなら何もしない
    const existing = await client.query(
      'SELECT 1 FROM likes WHERE from_user_id = $1 AND to_user_id = $2',
      [fromUserId, toUserId]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return { matched: false };
    }

    await client.query(
      'INSERT INTO likes (from_user_id, to_user_id) VALUES ($1, $2)',
      [fromUserId, toUserId]
    );

    // 相互いいね確認
    const mutual = await client.query(
      'SELECT 1 FROM likes WHERE from_user_id = $2 AND to_user_id = $1',
      [fromUserId, toUserId]
    );

    if (mutual.rows.length === 0) {
      await client.query('COMMIT');
      return { matched: false };
    }

    // マッチ作成（user_a_id < user_b_id 制約に合わせる）
    const [userA, userB] = fromUserId < toUserId
      ? [fromUserId, toUserId]
      : [toUserId, fromUserId];

    const matchResult = await client.query(
      `INSERT INTO matches (user_a_id, user_b_id)
       VALUES ($1, $2)
       ON CONFLICT (user_a_id, user_b_id) DO NOTHING
       RETURNING id`,
      [userA, userB]
    );

    await client.query('COMMIT');
    const matchId = matchResult.rows[0]?.id;
    return { matched: true, matchId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// いいねを取り消す
export const deleteLike = async (
  fromUserId: number,
  toUserId: number
): Promise<void> => {
  await pool.query(
    'DELETE FROM likes WHERE from_user_id = $1 AND to_user_id = $2',
    [fromUserId, toUserId]
  );
};

// 自分へのいいね一覧（LikesScreen用）
export const getReceivedLikes = async (userId: number): Promise<any[]> => {
  const result = await pool.query(
    `SELECT
       l.id,
       l.created_at,
       u.id   AS from_user_id,
       p.name,
       p.birthdate,
       p.profile_image_url,
       p.gym_name,
       p.level,
       -- すでにマッチ済みかどうか
       EXISTS (
         SELECT 1 FROM matches m
         WHERE (m.user_a_id = LEAST($1, u.id) AND m.user_b_id = GREATEST($1, u.id))
       ) AS is_matched
     FROM likes l
     JOIN users u ON u.id = l.from_user_id
     JOIN profiles p ON p.user_id = u.id
     WHERE l.to_user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// 自分が送ったいいね一覧
export const getSentLikes = async (userId: number): Promise<any[]> => {
  const result = await pool.query(
    `SELECT
       l.id,
       l.created_at,
       u.id   AS to_user_id,
       p.name,
       p.birthdate,
       p.profile_image_url,
       p.gym_name,
       p.level
     FROM likes l
     JOIN users u ON u.id = l.to_user_id
     JOIN profiles p ON p.user_id = u.id
     WHERE l.from_user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// マッチ一覧（MessagesScreen用）
export const getMatches = async (userId: number): Promise<any[]> => {
  const result = await pool.query(
    `SELECT
       m.id          AS match_id,
       m.matched_at,
       u.id          AS partner_user_id,
       p.name,
       p.birthdate,
       p.profile_image_url,
       p.gym_name
     FROM matches m
     JOIN users u ON u.id = CASE
       WHEN m.user_a_id = $1 THEN m.user_b_id
       ELSE m.user_a_id
     END
     JOIN profiles p ON p.user_id = u.id
     WHERE m.user_a_id = $1 OR m.user_b_id = $1
     ORDER BY m.matched_at DESC`,
    [userId]
  );
  return result.rows;
};

// マッチ解除
export const deleteMatch = async (
  userId: number,
  matchId: number
): Promise<void> => {
  await pool.query(
    `DELETE FROM matches
     WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)`,
    [matchId, userId]
  );
};

// 左スワイプ（スキップ）を記録
export const recordSkip = async (
  fromUserId: number,
  toUserId: number
): Promise<void> => {
  await pool.query(
    `INSERT INTO skips (from_user_id, to_user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [fromUserId, toUserId]
  );
};
