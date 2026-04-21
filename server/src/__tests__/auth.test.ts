import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

// --- Mocks ---

const mockVerify = jest.fn();
jest.mock('aws-jwt-verify/cognito-verifier', () => ({
  CognitoJwtVerifier: {
    create: () => ({ verify: mockVerify }),
  },
}));

const mockQuery = jest.fn();
const mockConnect = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    connect: mockConnect,
  })),
}));

import authRoutes from '../routes/authRoutes';

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// 有効なCognitoトークンペイロード
const validPayload = { sub: 'cognito-user-123', email: 'test@example.com', name: 'テストユーザー' };

// DBクライアントのモック（トランザクション用）
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockConnect.mockResolvedValue(mockClient);
});

// ─── POST /api/auth/signup ───────────────────────────────────────

describe('POST /api/auth/signup', () => {
  const profileBody = { name: '田中太郎', gender: '男性', birthdate: '1995-04-01' };

  test('正常系: ユーザーを作成して201を返す', async () => {
    mockVerify.mockResolvedValue(validPayload);
    mockQuery.mockResolvedValueOnce({ rows: [] }); // userExists → false
    mockClient.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 1, cognito_id: validPayload.sub, email: validPayload.email }] }) // INSERT users
      .mockResolvedValueOnce({ rows: [] }) // INSERT profiles
      .mockResolvedValueOnce(undefined); // COMMIT

    const res = await request(app)
      .post('/api/auth/signup')
      .set('Authorization', 'Bearer validtoken')
      .send(profileBody);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('ユーザーが作成されました');
    expect(res.body.user.cognito_id).toBe(validPayload.sub);
  });

  test('異常系: Authorizationヘッダーなし → 401', async () => {
    const res = await request(app).post('/api/auth/signup').send(profileBody);
    expect(res.status).toBe(401);
  });

  test('異常系: 無効なトークン → 403', async () => {
    mockVerify.mockRejectedValue(new Error('Invalid token'));
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Authorization', 'Bearer invalidtoken')
      .send(profileBody);
    expect(res.status).toBe(403);
  });

  test('異常系: プロフィールフィールド不足 → 400', async () => {
    mockVerify.mockResolvedValue(validPayload);
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Authorization', 'Bearer validtoken')
      .send({ name: '田中太郎' }); // gender, birthdate なし
    expect(res.status).toBe(400);
  });

  test('異常系: 既存ユーザー → 400', async () => {
    mockVerify.mockResolvedValue(validPayload);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // userExists → true

    const res = await request(app)
      .post('/api/auth/signup')
      .set('Authorization', 'Bearer validtoken')
      .send(profileBody);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ユーザーは既に存在します');
  });
});

// ─── POST /api/auth/signin ───────────────────────────────────────

describe('POST /api/auth/signin', () => {
  test('正常系: 既存ユーザーの情報を返す', async () => {
    mockVerify.mockResolvedValue(validPayload);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // userExists → true
      .mockResolvedValueOnce({ rows: [{ id: 1, cognito_id: validPayload.sub, email: validPayload.email, name: '田中太郎' }] }); // getUser

    const res = await request(app)
      .post('/api/auth/signin')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('ログインしました');
    expect(res.body.user).toBeDefined();
  });

  test('異常系: Authorizationヘッダーなし → 401', async () => {
    const res = await request(app).post('/api/auth/signin');
    expect(res.status).toBe(401);
  });

  test('異常系: DBに存在しないユーザー → 404', async () => {
    mockVerify.mockResolvedValue(validPayload);
    mockQuery.mockResolvedValueOnce({ rows: [] }); // userExists → false

    const res = await request(app)
      .post('/api/auth/signin')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(404);
  });
});

// ─── GET /api/auth/me ────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  test('正常系: 認証済みユーザーの情報を返す', async () => {
    mockVerify.mockResolvedValue(validPayload);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, cognito_id: validPayload.sub, email: validPayload.email, name: '田中太郎' }],
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer validtoken');

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  test('異常系: Authorizationヘッダーなし → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('異常系: 無効なトークン → 403', async () => {
    mockVerify.mockRejectedValue(new Error('Invalid token'));
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(403);
  });
});
