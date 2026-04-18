import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { userExists, createUser, getUser } from '../services/authService';

const router = express.Router();

// POST /api/auth/signup
// Cognito で登録後、バックエンド側でもユーザーを作成
// Authorization: Bearer <CognitoIdToken> が必須
// Body: { name, gender, birthdate }
router.post('/signup', authenticateToken, async (req: Request, res: Response) => {
  try {
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
  } catch (err: any) {
    console.error('サインアップエラー:', err);
    res.status(500).json({ error: 'サインアップに失敗しました', message: err.message });
  }
});

// POST /api/auth/signin
// Cognito でログイン後、バックエンド側のユーザーを返す（初回は自動作成）
// Authorization: Bearer <CognitoIdToken> が必須
router.post('/signin', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cognitoId, email } = (req as any).user;

    const exists = await userExists(cognitoId);
    if (!exists) {
      return res.status(404).json({ error: 'ユーザーが見つかりません。先にサインアップしてください。' });
    }

    const user = await getUser(cognitoId);

    res.status(200).json({ message: 'ログインしました', user });
  } catch (err: any) {
    console.error('サインインエラー:', err);
    res.status(500).json({ error: 'サインインに失敗しました', message: err.message });
  }
});

// GET /api/auth/me
// 認証済みユーザーの情報を取得
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'ユーザー情報がありません',
      });
    }

    const userData = await getUser(user.cognitoId);

    res.status(200).json({
      user: userData,
    });
  } catch (err: any) {
    console.error('ユーザー情報取得エラー:', err);
    res.status(500).json({
      error: 'ユーザー情報の取得に失敗しました',
      message: err.message,
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  try {
    // バックエンド側では特に処理なし
    // フロント側で Cognito のセッション削除とトークン削除を行う

    res.status(200).json({
      message: 'ログアウトしました',
    });
  } catch (err: any) {
    console.error('ログアウトエラー:', err);
    res.status(500).json({
      error: 'ログアウトに失敗しました',
      message: err.message,
    });
  }
});

export default router;
