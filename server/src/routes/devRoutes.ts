import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { authenticateToken } from '../middleware/auth';
import { getUserIdByCognitoId } from '../services/userService';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'anchor_dev',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

const router = Router();

// DEV ONLY: reset swipe history for the authenticated user
router.delete('/reset-swipes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const userId = await getUserIdByCognitoId(cognitoId);
    await pool.query('DELETE FROM likes WHERE from_user_id = $1 OR to_user_id = $1', [userId]);
    await pool.query('DELETE FROM skips WHERE from_user_id = $1', [userId]);
    await pool.query('DELETE FROM matches WHERE user_a_id = $1 OR user_b_id = $1', [userId]);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
