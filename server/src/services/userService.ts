import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'anchor_dev',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

export const getUserIdByCognitoId = async (cognitoId: string): Promise<number> => {
  const result = await pool.query(
    'SELECT id FROM users WHERE cognito_id = $1',
    [cognitoId]
  );
  if (!result.rows[0]) throw new Error('ユーザーが見つかりません');
  return result.rows[0].id;
};
