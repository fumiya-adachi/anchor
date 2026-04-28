import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { saveMessage, getMessages, markMessagesAsRead } from '../services/firebaseService';
import { getUserIdByCognitoId } from '../services/userService';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// POST /api/chats — メッセージを送信
// Authorization: Bearer <Token> 必須
// Body: { matchId, message }
router.post('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const { matchId, message } = req.body;

  if (!matchId || !message) {
    return res.status(400).json({ error: 'matchId と message は必須です' });
  }

  const userId = await getUserIdByCognitoId(cognitoId);
  const messageId = await saveMessage(matchId, userId, message);

  res.status(201).json({
    message: 'メッセージを送信しました',
    data: { messageId, matchId, userId, text: message, timestamp: new Date().toISOString() },
  });
}));

// GET /api/chats/:matchId — チャット履歴を取得
// Authorization: Bearer <Token> 必須
router.get('/:matchId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const { matchId } = req.params;
  const { limit = 50 } = req.query;

  const userId = await getUserIdByCognitoId(cognitoId);
  const messages = await getMessages(parseInt(matchId), parseInt(limit as string));
  await markMessagesAsRead(parseInt(matchId), userId);

  res.status(200).json({
    data: messages,
    count: messages.length,
  });
}));

export default router;
