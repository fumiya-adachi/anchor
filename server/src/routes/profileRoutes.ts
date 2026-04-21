import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getMyProfile,
  getProfileByUserId,
  updateMyProfile,
  getAllInterests,
} from '../services/profileService';

const router = express.Router();

// GET /api/profiles/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const profile = await getMyProfile(cognitoId);
    if (!profile) {
      return res.status(404).json({ error: 'プロフィールが見つかりません' });
    }
    res.json({ profile });
  } catch (err: any) {
    console.error('プロフィール取得エラー:', err);
    res.status(500).json({ error: 'プロフィールの取得に失敗しました', message: err.message });
  }
});

// PUT /api/profiles/me
router.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const profile = await updateMyProfile(cognitoId, req.body);
    res.json({ profile });
  } catch (err: any) {
    console.error('プロフィール更新エラー:', err);
    res.status(500).json({ error: 'プロフィールの更新に失敗しました', message: err.message });
  }
});

// GET /api/profiles/interests
router.get('/interests', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const interests = await getAllInterests();
    res.json({ interests });
  } catch (err: any) {
    console.error('インタレスト取得エラー:', err);
    res.status(500).json({ error: 'インタレストの取得に失敗しました', message: err.message });
  }
});

// GET /api/profiles/:userId  ※ /me・/interests より後に定義
router.get('/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: '無効なユーザーIDです' });
    }
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'プロフィールが見つかりません' });
    }
    res.json({ profile });
  } catch (err: any) {
    console.error('プロフィール取得エラー:', err);
    res.status(500).json({ error: 'プロフィールの取得に失敗しました', message: err.message });
  }
});

export default router;
