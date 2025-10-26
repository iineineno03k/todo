# TODOアプリケーション

様々な技術スタックで実装されたTODOアプリケーションのコレクションです。同じAPI仕様を共有する複数のバックエンドとフロントエンドの実装を提供しています。

## プロジェクト構成

### バックエンド
- **backend-java** - Spring Boot + Java実装
- **backend-typescript** - NestJS + TypeScript実装

### フロントエンド
- **frontend-angular** - Angular 19実装
- **frontend-nextjs** - Next.js 16実装（最新のApp Router、React 19対応）

## 機能

- ✨ タスクの一覧表示
- ➕ 新規タスクの追加
- ✏️ タスクの編集
- ✅ タスクの完了/未完了の切り替え
- 🗑️ タスクの削除
- 🔍 フィルタリング（frontend-nextjsのみ）

## 技術スタック

### フロントエンド

#### Angular (frontend-angular)
- Angular 19
- TypeScript
- RxJS
- SCSS

#### Next.js (frontend-nextjs) ⭐ 最新
- Next.js 16 (App Router)
- React 19 (React Compiler対応)
- TypeScript 5
- Tailwind CSS 4
- SWR 2
- Zod 4

### バックエンド

#### Spring Boot (backend-java)
- Java 17
- Spring Boot 3.2.3
- Spring Data JPA
- H2 Database
- Lombok

#### NestJS (backend-typescript) ⭐ 推奨
- NestJS 10
- TypeScript 5
- Prisma ORM
- SQLite
- Zod

## 起動方法

### バックエンド

#### backend-java
```bash
cd backend-java
./gradlew bootRun
```

#### backend-typescript（推奨）
```bash
cd backend-typescript
npm install
npm run start:dev
```

バックエンドサーバーは http://localhost:8080 で起動します。

### フロントエンド

#### frontend-angular
```bash
cd frontend-angular
npm install
npm start
```
フロントエンドは http://localhost:4200 で起動します。

#### frontend-nextjs（最新）
```bash
cd frontend-nextjs
npm install
npm run dev
```
フロントエンドは http://localhost:3000 で起動します。

## APIエンドポイント

全てのバックエンド実装で共通のAPI仕様を使用しています。

| メソッド | エンドポイント | 説明 |
|----------|--------------|------|
| GET      | /api/todos   | 全てのタスクを取得 |
| GET      | /api/todos/{id} | 指定IDのタスクを取得 |
| POST     | /api/todos   | 新規タスクを作成 |
| PUT      | /api/todos/{id} | 指定IDのタスクを更新 |
| DELETE   | /api/todos/{id} | 指定IDのタスクを削除 |

### データモデル

```typescript
{
  id: number;
  task: string;
  completed: boolean;
  createdAt: string; // ISO 8601 format
}
```

## 推奨構成

モダンな開発体験には以下の組み合わせを推奨します：

- **バックエンド**: backend-typescript（NestJS + Prisma）
- **フロントエンド**: frontend-nextjs（Next.js 16 + React 19）

この組み合わせは、最新の技術スタックとベストプラクティスを採用しており、型安全性とDX（開発者体験）が優れています。

## 各実装の詳細

各ディレクトリには詳細なREADMEが含まれています：

- [backend-java/README.md](./backend-java/README.md)
- [backend-typescript/README.md](./backend-typescript/README.md)
- [frontend-angular/README.md](./frontend-angular/README.md)
- [frontend-nextjs/README.md](./frontend-nextjs/README.md)

## ライセンス

MIT
