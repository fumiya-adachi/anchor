import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getDiscoverUsers } from '../services/discoverService';
import { getUserIdByCognitoId } from '../services/userService';

const router = express.Router();

// GET /api/discover
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const userId = await getUserIdByCognitoId(cognitoId);
    const users = await getDiscoverUsers(userId, { limit });
    res.json({ users });
  } catch (err: any) {
    console.error('Discover取得エラー:', err);
    res.status(500).json({ error: 'ユーザー一覧の取得に失敗しました', message: err.message });
  }
});

export default router;
