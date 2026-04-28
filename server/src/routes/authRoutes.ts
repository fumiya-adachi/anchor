import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth';
import { userExists, createUser, getUser } from '../services/authService';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// POST /api/auth/signup
// Cognito で登録後、バックエンド側でもユーザーを作成
// Authorization: Bearer <CognitoIdToken> が必須
// Body: { name, gender, birthdate }
router.post('/signup', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId, email } = (req as any).user;
  const { name, gender, birthdate } = req.body;

  if (!name || !gender || !birthdate) {
    return res.status(400).json({ error: 'name, gender, birthdate は必須です' });
  }

  const exists = await userExists(cognitoId);
  if (exists) {
    return res.status(400).json({ error: 'ユーザーは既に存在します' });
  }

  const user = await createUser(cognitoId, email, { name, gender, birthdate });
  res.status(201).json({ message: 'ユーザーが作成されました', user });
}));

// POST /api/auth/signin
// Cognito でログイン後、バックエンド側のユーザーを返す
// Authorization: Bearer <CognitoIdToken> が必須
router.post('/signin', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;

  const exists = await userExists(cognitoId);
  if (!exists) {
    return res.status(404).json({ error: 'ユーザーが見つかりません。先にサインアップしてください。' });
  }

  const user = await getUser(cognitoId);
  res.status(200).json({ message: 'ログインしました', user });
}));

// GET /api/auth/me
// 認証済みユーザーの情報を取得
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'ユーザー情報がありません' });
  }

  const userData = await getUser(user.cognitoId);
  res.status(200).json({ user: userData });
}));

// GET /api/auth/firebase-token
// Cognito 認証済みユーザーに Firebase Custom Token を発行
router.get('/firebase-token', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const firebaseToken = await admin.auth().createCustomToken(cognitoId);
  res.json({ firebaseToken });
}));

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'ログアウトしました' });
});

export default router;
