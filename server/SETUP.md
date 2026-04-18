# Anchor Backend - ローカル開発セットアップガイド

## 📋 前提条件

- Node.js v18+
- PostgreSQL 15+
- npm または yarn

## 🚀 セットアップ手順

### Step 1：リポジトリをクローン＆ server ディレクトリへ移動

```bash
cd /Users/fumiya/dev/anchor/server
```

### Step 2：npm install を実行

```bash
npm install
```

### Step 3：PostgreSQL をローカルで起動

**Mac (Homebrew)**
```bash
# PostgreSQL サービス起動
brew services start postgresql@15

# またはバックグラウンドで実行
pg_ctl -D /usr/local/var/postgres start
```

**Linux**
```bash
sudo systemctl start postgresql
```

**Windows (pgAdmin または PostgreSQL のコントロールパネル)**

### Step 4：PostgreSQL に ユーザー・データベース作成

```bash
# psql に接続（マスターユーザーで）
psql postgres

# 以下のコマンドを実行
CREATE USER postgres WITH PASSWORD 'your_secure_password';
ALTER ROLE postgres SUPERUSER;

# schema.sql を実行
psql -U postgres -f sql/schema.sql
```

### Step 5：.env ファイルを作成

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

**`.env` を編集：**

```
PORT=3000
NODE_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=anchor_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password

COGNITO_REGION=ap-northeast-1
COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxx
```

Cognito の値は前のステップで作成した User Pool ID と Client ID を入力。

### Step 6：ローカルサーバーを起動

```bash
npm run dev
```

**成功した場合：**
```
🚀 Anchor backend running on http://localhost:3000
📝 Environment: development
```

### Step 7：ヘルスチェック

別のターミナルで実行：

```bash
curl http://localhost:3000/api/health
```

**レスポンス例：**
```json
{
  "status": "ok",
  "message": "Anchor backend is running",
  "timestamp": "2026-04-18T12:00:00.000Z"
}
```

✅ **セットアップ完了！**

---

## 📝 主要ファイル構成

```
server/
  ├── src/
  │   └── index.ts           # メインサーバーファイル
  ├── sql/
  │   └── schema.sql         # PostgreSQL スキーマ
  ├── .env                   # 環境変数（.gitignore）
  ├── .env.example           # .env テンプレート
  ├── package.json           # npm 依存関係
  ├── tsconfig.json          # TypeScript 設定
  └── SETUP.md               # このファイル
```

---

## 🔧 よくあるトラブル

### PostgreSQL に接続できない

```bash
# PostgreSQL が起動しているか確認
ps aux | grep postgres

# 起動していない場合
brew services start postgresql@15
```

### npm install でエラーが出る

```bash
# node_modules をクリアして再実行
rm -rf node_modules package-lock.json
npm install
```

### ポート 3000 が既に使用されている

```bash
# 別のポートを使用（.env で PORT=3001 に変更）
# または既存プロセスを終了
lsof -i :3000
kill -9 <PID>
```

---

## 📚 次のステップ

1. **認証 API 実装** - `/api/auth/signup`, `/api/auth/signin` など
2. **Cognito 連携** - JWT Token 検証
3. **プロフィール API** - `/api/profiles`
4. **いいね・マッチング API** - `/api/likes`, `/api/matches`
5. **フロントエンド統合テスト**

---

## 🔐 環境変数について

- `.env` ファイルは絶対に Git にコミットしないこと
- `.env.example` には本番値を入れないこと
- 本番環境では EC2 / AWS Parameter Store で管理

---

**質問やエラーが発生したら、このドキュメントを確認してください！**
