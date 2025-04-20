# TODOアプリケーション

Angularフロントエンド（frontend-angular）とSpring Bootバックエンド（backend-java）で構成されたシンプルなTODOアプリケーションです。

## 機能

- タスクの一覧表示
- 新規タスクの追加
- タスクの完了/未完了の切り替え
- タスクの削除

## 技術スタック

### フロントエンド
- Angular 19
- TypeScript
- RxJS
- SCSS

### バックエンド
- Java 17
- Spring Boot 3.2.3
- Spring Data JPA
- H2 Database
- Lombok

## 起動方法

### バックエンド

```bash
cd backend-java
./gradlew bootRun
```

バックエンドサーバーは http://localhost:8080 で起動します。

### フロントエンド

```bash
cd frontend-angular
npm install
npm start
```

フロントエンドアプリケーションは http://localhost:4200 で起動します。

## APIエンドポイント

| メソッド | エンドポイント | 説明 |
|----------|--------------|------|
| GET      | /api/todos   | 全てのタスクを取得 |
| GET      | /api/todos/{id} | 指定IDのタスクを取得 |
| POST     | /api/todos   | 新規タスクを作成 |
| PUT      | /api/todos/{id} | 指定IDのタスクを更新 |
| DELETE   | /api/todos/{id} | 指定IDのタスクを削除 | # todo
