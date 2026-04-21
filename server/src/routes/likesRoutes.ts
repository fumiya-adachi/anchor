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

const router = express.Router();

// POST /api/likes  — いいねを送る
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const { to_user_id } = req.body;
    if (!to_user_id) return res.status(400).json({ error: 'to_user_id は必須です' });

    const fromUserId = await getUserIdByCognitoId(cognitoId);
    const result = await sendLike(fromUserId, Number(to_user_id));
    res.status(201).json(result);
  } catch (err: any) {
    console.error('いいね送信エラー:', err);
    res.status(500).json({ error: 'いいねの送信に失敗しました', message: err.message });
  }
});

// DELETE /api/likes/:toUserId  — いいね取り消し
router.delete('/:toUserId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const toUserId = parseInt(req.params.toUserId, 10);
    if (isNaN(toUserId)) return res.status(400).json({ error: '無効なユーザーIDです' });

    const fromUserId = await getUserIdByCognitoId(cognitoId);
    await deleteLike(fromUserId, toUserId);
    res.status(204).send();
  } catch (err: any) {
    console.error('いいね取り消しエラー:', err);
    res.status(500).json({ error: 'いいねの取り消しに失敗しました', message: err.message });
  }
});

// GET /api/likes/received  — 自分へのいいね一覧
router.get('/received', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const userId = await getUserIdByCognitoId(cognitoId);
    const likes = await getReceivedLikes(userId);
    res.json({ likes });
  } catch (err: any) {
    console.error('いいね取得エラー:', err);
    res.status(500).json({ error: 'いいね一覧の取得に失敗しました', message: err.message });
  }
});

// GET /api/likes/sent  — 自分が送ったいいね一覧
router.get('/sent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const userId = await getUserIdByCognitoId(cognitoId);
    const likes = await getSentLikes(userId);
    res.json({ likes });
  } catch (err: any) {
    console.error('いいね取得エラー:', err);
    res.status(500).json({ error: '送信済みいいね一覧の取得に失敗しました', message: err.message });
  }
});

// POST /api/likes/skip  — 左スワイプ（スキップ）
router.post('/skip', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const { to_user_id } = req.body;
    if (!to_user_id) return res.status(400).json({ error: 'to_user_id は必須です' });

    const fromUserId = await getUserIdByCognitoId(cognitoId);
    await recordSkip(fromUserId, Number(to_user_id));
    res.status(204).send();
  } catch (err: any) {
    console.error('スキップエラー:', err);
    res.status(500).json({ error: 'スキップの記録に失敗しました', message: err.message });
  }
});

// GET /api/likes/matches  — マッチ一覧
router.get('/matches', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const userId = await getUserIdByCognitoId(cognitoId);
    const matches = await getMatches(userId);
    res.json({ matches });
  } catch (err: any) {
    console.error('マッチ取得エラー:', err);
    res.status(500).json({ error: 'マッチ一覧の取得に失敗しました', message: err.message });
  }
});

// DELETE /api/likes/matches/:matchId  — マッチ解除
router.delete('/matches/:matchId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId } = (req as any).user;
    const matchId = parseInt(req.params.matchId, 10);
    if (isNaN(matchId)) return res.status(400).json({ error: '無効なマッチIDです' });

    const userId = await getUserIdByCognitoId(cognitoId);
    await deleteMatch(userId, matchId);
    res.status(204).send();
  } catch (err: any) {
    console.error('マッチ解除エラー:', err);
    res.status(500).json({ error: 'マッチの解除に失敗しました', message: err.message });
  }
});

export default router;
