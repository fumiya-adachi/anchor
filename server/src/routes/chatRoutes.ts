import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { saveMessage, getMessages, markMessagesAsRead } from '../services/firebaseService';

const router = express.Router();

/**
 * POST /api/chats
 * メッセージを送信
 * Authorization: Bearer <Token> 必須
 * Body: { matchId, message }
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { matchId, message } = req.body;

    // バリデーション
    if (!matchId || !message) {
      return res.status(400).json({
        error: 'matchId と message は必須です',
      });
    }

    // メッセージを保存
    const messageId = await saveMessage(matchId, user.userId, message);

    res.status(201).json({
      message: 'メッセージを送信しました',
      data: {
        messageId,
        matchId,
        userId: user.userId,
        text: message,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('メッセージ送信エラー:', err);
    res.status(500).json({
      error: 'メッセージ送信に失敗しました',
      message: err.message,
    });
  }
});

/**
 * GET /api/chats/:matchId
 * チャット履歴を取得
 * Authorization: Bearer <Token> 必須
 */
router.get('/:matchId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { matchId } = req.params;
    const { limit = 50 } = req.query;

    // メッセージを取得
    const messages = await getMessages(parseInt(matchId), parseInt(limit as string));

    // 自分のメッセージ以外を既読にマーク
    await markMessagesAsRead(parseInt(matchId), user.userId);

    res.status(200).json({
      data: messages,
      count: messages.length,
    });
  } catch (err: any) {
    console.error('チャット取得エラー:', err);
    res.status(500).json({
      error: 'チャット履歴の取得に失敗しました',
      message: err.message,
    });
  }
});

export default router;
