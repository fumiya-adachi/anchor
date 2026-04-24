import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  sendLike,
  deleteLike,
  getReceivedLikes,
  getSentLikes,
  getMatches,
  deleteMatch,
  recordSkip,
} from '../services/likesService';
import { getUserIdByCognitoId } from '../services/userService';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// POST /api/likes — いいねを送る
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const { to_user_id } = req.body;
  if (!to_user_id) return res.status(400).json({ error: 'to_user_id は必須です' });

  const fromUserId = await getUserIdByCognitoId(cognitoId);
  const result = await sendLike(fromUserId, Number(to_user_id));
  res.status(201).json(result);
}));

// DELETE /api/likes/:toUserId — いいね取り消し
router.delete('/:toUserId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const toUserId = parseInt(req.params.toUserId, 10);
  if (isNaN(toUserId)) return res.status(400).json({ error: '無効なユーザーIDです' });

  const fromUserId = await getUserIdByCognitoId(cognitoId);
  await deleteLike(fromUserId, toUserId);
  res.status(204).send();
}));

// GET /api/likes/received — 自分へのいいね一覧
router.get('/received', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const userId = await getUserIdByCognitoId(cognitoId);
  const likes = await getReceivedLikes(userId);
  res.json({ likes });
}));

// GET /api/likes/sent — 自分が送ったいいね一覧
router.get('/sent', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const userId = await getUserIdByCognitoId(cognitoId);
  const likes = await getSentLikes(userId);
  res.json({ likes });
}));

// POST /api/likes/skip — 左スワイプ（スキップ）
router.post('/skip', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const { to_user_id } = req.body;
  if (!to_user_id) return res.status(400).json({ error: 'to_user_id は必須です' });

  const fromUserId = await getUserIdByCognitoId(cognitoId);
  await recordSkip(fromUserId, Number(to_user_id));
  res.status(204).send();
}));

// GET /api/likes/matches — マッチ一覧
router.get('/matches', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const userId = await getUserIdByCognitoId(cognitoId);
  const matches = await getMatches(userId);
  res.json({ matches });
}));

// DELETE /api/likes/matches/:matchId — マッチ解除
router.delete('/matches/:matchId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const matchId = parseInt(req.params.matchId, 10);
  if (isNaN(matchId)) return res.status(400).json({ error: '無効なマッチIDです' });

  const userId = await getUserIdByCognitoId(cognitoId);
  await deleteMatch(userId, matchId);
  res.status(204).send();
}));

export default router;
