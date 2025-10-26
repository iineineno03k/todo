# Next.js TODO Application

A modern, feature-rich TODO application built with the latest Next.js technologies.

## 技術スタック

### Frontend Technologies
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with React Compiler support
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **SWR 2** - Data fetching and caching
- **Zod 4** - Runtime type validation
- **date-fns 4** - Modern date utilities

### Modern Features
- ✅ **App Router** - Next.js 最新のルーティングシステム
- ✅ **React Server Components** - サーバーサイドレンダリング最適化
- ✅ **React Compiler** - 自動メモ化による最適化
- ✅ **Turbopack** - 高速なビルドツール
- ✅ **Client Components** - インタラクティブUI
- ✅ **SWR** - 効率的なデータフェッチングとキャッシング
- ✅ **TypeScript** - 型安全な開発環境
- ✅ **Responsive Design** - モバイルフレンドリーなUI

## 機能

- ✨ タスクの追加
- ✏️ タスクの編集（インライン編集対応）
- ✅ タスクの完了/未完了の切り替え
- 🗑️ タスクの削除
- 🔍 フィルタリング（All / Active / Completed）
- 📊 タスク統計の表示
- 🎨 モダンなUI/UX
- ⚡ リアルタイムデータ同期
- 🎯 アニメーション付きインタラクション

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- バックエンドAPI（backend-typescript）が起動していること

### インストール

```bash
cd frontend-nextjs
npm install
```

### 環境変数

`.env.local` ファイルが既に設定されています：

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

必要に応じて、バックエンドAPIのURLを変更してください。

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

### ビルド

```bash
npm run build
npm start
```

## プロジェクト構造

```
frontend-nextjs/
├── src/
│   ├── app/                  # App Router ページ
│   │   ├── layout.tsx       # ルートレイアウト
│   │   ├── page.tsx         # ホームページ
│   │   └── globals.css      # グローバルスタイル
│   ├── components/          # Reactコンポーネント
│   │   ├── TodoList.tsx     # TODOリストコンテナ（Client Component）
│   │   ├── TodoItem.tsx     # 個別TODOアイテム（Client Component）
│   │   └── AddTodoForm.tsx  # TODO追加フォーム（Client Component）
│   ├── lib/                 # ユーティリティとヘルパー
│   │   ├── api.ts          # APIクライアント
│   │   └── utils.ts        # ユーティリティ関数
│   └── types/              # TypeScript型定義
│       └── todo.ts         # TODO型とZodスキーマ
├── .env.local              # 環境変数
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## API統合

このアプリケーションは、`backend-typescript` のREST APIに接続します。

### エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET     | /api/todos   | 全TODOを取得 |
| GET     | /api/todos/:id | 特定TODOを取得 |
| POST    | /api/todos   | 新規TODO作成 |
| PUT     | /api/todos/:id | TODO更新 |
| DELETE  | /api/todos/:id | TODO削除 |

### データモデル

```typescript
interface Todo {
  id: number;
  task: string;
  completed: boolean;
  createdAt: string; // ISO 8601 format
}
```

## 使用しているモダン技術の詳細

### React 19 & React Compiler
- 自動メモ化によるパフォーマンス最適化
- 不要な再レンダリングの削減

### App Router
- ファイルベースルーティング
- Server ComponentsとClient Componentsの混在
- 自動コード分割

### SWR
- 効率的なデータフェッチング
- 自動再検証
- 楽観的更新対応
- キャッシング戦略

### Zod
- ランタイム型検証
- APIレスポンスの型安全性保証
- フォーム入力のバリデーション

### Tailwind CSS 4
- ユーティリティファーストCSS
- JITモード
- カスタムデザインシステム
- レスポンシブデザイン

## 開発のポイント

### Client Components
`'use client'` ディレクティブを使用してクライアントコンポーネントを定義：
- インタラクティブなUI要素
- stateとhooksを使用
- ブラウザAPIへのアクセス

### useTransition
React 19の `useTransition` フックを使用して、UIの応答性を保ちながら非同期処理を実行。

### 楽観的更新
SWRの `mutate` 関数を使用して、サーバーレスポンスを待たずにUIを更新。

## トラブルシューティング

### バックエンドに接続できない場合

1. バックエンドが起動しているか確認：
   ```bash
   cd ../backend-typescript
   npm run start:dev
   ```

2. CORS設定を確認（`backend-typescript/src/main.ts`）

3. `.env.local` のAPI URLを確認

### ビルドエラー

```bash
# node_modulesとキャッシュをクリア
rm -rf node_modules .next
npm install
npm run dev
```

## パフォーマンス最適化

- React Compiler による自動最適化
- SWRによるデータキャッシング
- Turbopackによる高速ビルド
- 画像とフォントの最適化
- コード分割とLazy Loading

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
