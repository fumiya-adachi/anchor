import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify/cognito-verifier';

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

const getVerifier = () => {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID || '',
      tokenUse: 'id',
      clientId: process.env.COGNITO_CLIENT_ID || '',
    });
  }
  return verifier;
};

// Cognito 認証ミドルウェア
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'トークンがありません' });
    }

    const payload = await getVerifier().verify(token, {
      clientId: process.env.COGNITO_CLIENT_ID || '',
    });

    // req にユーザー情報を追加
    (req as any).user = {
      cognitoId: payload['sub'],
      email: payload['email'],
      name: payload['name'],
    };

    next();
  } catch (err: any) {
    console.error('トークン検証エラー:', err);
    res.status(403).json({ error: 'トークンが無効です' });
  }
};
