# NestJS TypeScript Todo API

NestJSを使用したTodoアプリケーションのバックエンドAPIです。

## 技術スタック

- NestJS
- TypeScript
- SQLite（ローカル開発用）
- PostgreSQL（本番環境用）
- Prisma ORM
- Zod (バリデーション)
- tRPC (型安全なAPI)
- Pino (ロギング)
- Jest (テスト)

## 機能

- RESTful APIエンドポイント: `/api/todos`
- tRPC API: `/trpc`
- Todo項目のCRUD操作
- バリデーション
- データベースとの連携
- ログ出力
- テスト

## 開発環境のセットアップ

1. 必要なパッケージをインストールします。

```bash
npm install
```

2. `.env`ファイルを確認し、データベース接続情報が設定されていることを確認します。
   デフォルトでは、ローカル開発用にSQLiteを使用しています。

```
DATABASE_URL="file:./dev.db"
```

3. Prismaを使用してデータベーススキーマを生成します。

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. シードデータを投入します。

```bash
npm run prisma:seed
```

5. 開発サーバーを起動します。

```bash
npm run start:dev
```

または、以下のコマンドで全てを一度に実行できます。

```bash
npm run start:sqlite
```

## テスト

ユニットテストを実行するには:

```bash
npm run test
```

E2Eテストを実行するには:

```bash
npm run test:e2e
```

## Docker

本番環境用にDockerを使用して環境全体を起動するには:

```bash
docker-compose up -d
```

## API エンドポイント

### REST API

- `GET /api/todos` - 全てのTodoを取得
- `GET /api/todos/:id` - 指定したIDのTodoを取得
- `POST /api/todos` - 新しいTodoを作成
- `PUT /api/todos/:id` - 指定したIDのTodoを更新
- `DELETE /api/todos/:id` - 指定したIDのTodoを削除

### tRPC API

- `todos.findAll` - 全てのTodoを取得
- `todos.findById` - 指定したIDのTodoを取得
- `todos.create` - 新しいTodoを作成
- `todos.update` - 指定したIDのTodoを更新
- `todos.delete` - 指定したIDのTodoを削除 