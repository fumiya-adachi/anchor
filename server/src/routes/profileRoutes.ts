import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getMyProfile,
  getProfileByUserId,
  updateMyProfile,
  getAllInterests,
} from '../services/profileService';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// GET /api/profiles/me
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const profile = await getMyProfile(cognitoId);
  if (!profile) {
    return res.status(404).json({ error: 'プロフィールが見つかりません' });
  }
  res.json({ profile });
}));

// PUT /api/profiles/me
router.put('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const profile = await updateMyProfile(cognitoId, req.body);
  res.json({ profile });
}));

// GET /api/profiles/interests
router.get('/interests', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  const interests = await getAllInterests();
  res.json({ interests });
}));

// GET /api/profiles/:userId  ※ /me・/interests より後に定義
router.get('/:userId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: '無効なユーザーIDです' });
  }
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return res.status(404).json({ error: 'プロフィールが見つかりません' });
  }
  res.json({ profile });
}));

export default router;
