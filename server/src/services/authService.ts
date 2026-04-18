import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'anchor_dev',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

// ユーザーが存在するか確認
export const userExists = async (cognitoId: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE cognito_id = $1',
      [cognitoId]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('ユーザー確認エラー:', err);
    throw err;
  }
};

type ProfileData = {
  name: string;
  gender: string;
  birthdate: string;
};

// ユーザーとプロフィールをトランザクションで作成
export const createUser = async (
  cognitoId: string,
  email: string,
  profile: ProfileData
): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      'INSERT INTO users (cognito_id, email) VALUES ($1, $2) RETURNING *',
      [cognitoId, email]
    );
    const user = userResult.rows[0];
    await client.query(
      'INSERT INTO profiles (user_id, name, gender, birthdate) VALUES ($1, $2, $3, $4)',
      [user.id, profile.name, profile.gender, profile.birthdate]
    );
    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ユーザー作成エラー:', err);
    throw err;
  } finally {
    client.release();
  }
};

// ユーザー情報を取得
export const getUser = async (cognitoId: string): Promise<any> => {
  try {
    const result = await pool.query(
      'SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.cognito_id = $1',
      [cognitoId]
    );
    return result.rows[0];
  } catch (err) {
    console.error('ユーザー取得エラー:', err);
    throw err;
  }
};

// データベース接続テスト
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT NOW()');
    return true;
  } catch (err) {
    console.error('データベース接続エラー:', err);
    return false;
  }
};
