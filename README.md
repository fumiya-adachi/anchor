# anchor

筋トレ仲間を探すマッチングアプリ。React Native (Expo) + TypeScript で実装。

---

## 🎨 デザインシステム

- **テーマ**: ダークネイビー + シャンパンゴールドのプレミアムUI
- **タイポグラフィ**: Cormorant Garamond（Serif）+ Inter（Sans）
- **インスピレーション**: Tinder風カードスワイプ、ただし高級感のあるエディトリアル寄りの佇まい

---

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
cd anchor
npm install
```

> 初回のみ Expo SDK のセットアップに数分かかることがあります。

### 2. 開発サーバー起動

```bash
npm start
```

起動後、ターミナルに QR コードが表示されます。

### 3. 実機 / シミュレーターで確認

**実機で確認（おすすめ）**:
1. App Store / Google Play から「Expo Go」アプリをインストール
2. ターミナルの QR コードをカメラで読み取り
3. 即座にアプリが起動します

**iOS シミュレーター**:
```bash
npm run ios
```

**Android エミュレーター**:
```bash
npm run android
```

**Web（簡易プレビュー）**:
```bash
npm run web
```

---

## 📁 プロジェクト構造

```
anchor/
├── App.tsx                      # エントリポイント（フォント読込 + Navigation）
├── index.ts                     # ルート登録
├── app.json                     # Expo 設定
├── package.json
├── tsconfig.json
├── babel.config.js
└── src/
    ├── components/              # UI コンポーネント
    │   ├── Header.tsx           # ブランドロゴ + アイコン
    │   ├── FilterBar.tsx        # フィルターチップ
    │   ├── SwipeCard.tsx        # スワイプ可能なプロフィールカード
    │   └── ActionButtons.tsx    # Pass / Super Like / Like
    ├── screens/
    │   ├── DiscoverScreen.tsx   # メインのスワイプ画面
    │   ├── LikesScreen.tsx      # もらったいいね（WIP）
    │   ├── MessagesScreen.tsx   # メッセージ（WIP）
    │   └── ProfileScreen.tsx    # 自分のプロフィール（WIP）
    ├── navigation/
    │   └── RootNavigator.tsx    # ボトムタブナビゲーション
    ├── theme/                   # デザイントークン
    │   ├── colors.ts
    │   ├── typography.ts
    │   └── spacing.ts
    ├── types/
    │   └── user.ts              # ドメイン型定義
    └── data/
        └── mockUsers.ts         # 開発用モックデータ
```

---

## 🛠 主要技術

| 用途 | ライブラリ |
|---|---|
| フレームワーク | Expo SDK 51 |
| 言語 | TypeScript (strict) |
| ナビゲーション | React Navigation (Bottom Tabs) |
| ジェスチャー | react-native-gesture-handler |
| アニメーション | react-native-reanimated v3 |
| アイコン | react-native-svg |
| フォント | @expo-google-fonts |
| グラデーション | expo-linear-gradient |

---

## 📝 次のステップ（TODO）

- [ ] トレーニング記録機能（#001 アイデアメモ: 男性は1週間記録しないとスワイプ不可）
- [ ] プロフィール詳細画面（タップで展開）
- [ ] マッチ成立時のアニメーション
- [ ] バックエンド接続（Firebase / Supabase / 自前API）
- [ ] 認証フロー
- [ ] 画像アップロード
- [ ] メッセージング
- [ ] プッシュ通知

---

## 💡 ディレクトリ規約

- コンポーネントは `src/components/` に PascalCase で配置
- 画面は `src/screens/` に `XxxScreen.tsx` の命名
- ドメイン型は `src/types/` にまとめる
- `@/` は `src/` のエイリアス（tsconfig + babel で設定済み）

---

## 🎯 デザイン参照

- `UI_スワイプ画面.html` — デザインの元になった HTML プロトタイプ
- `マッチングアプリ_スワイプUI比較.html` — 他アプリとの比較調査
