# Todo API - Python/FastAPI Backend

FastAPIを使用したTodoアプリケーションのバックエンドAPI実装です。

## 技術スタック

- **Framework**: FastAPI 0.109.1
- **ORM**: SQLAlchemy 2.0.25
- **Database**: PostgreSQL (開発時はH2/SQLiteも対応可能)
- **Validation**: Pydantic 2.6.0
- **Server**: Uvicorn

## プロジェクト構成

```
backend-python/
├── src/
│   ├── models/          # データベースモデル
│   │   ├── __init__.py
│   │   └── todo.py
│   ├── repositories/    # データアクセス層
│   │   ├── __init__.py
│   │   └── todo_repository.py
│   ├── services/        # ビジネスロジック層
│   │   ├── __init__.py
│   │   └── todo_service.py
│   ├── routers/         # APIエンドポイント
│   │   ├── __init__.py
│   │   └── todo_router.py
│   ├── database.py      # データベース設定
│   ├── schemas.py       # Pydanticスキーマ
│   └── main.py          # アプリケーションエントリポイント
├── tests/               # テストコード
├── Dockerfile
├── requirements.txt
└── README.md
```

## API エンドポイント

### GET /api/todos
全てのTodoを取得

### GET /api/todos/{id}
指定されたIDのTodoを取得

### POST /api/todos
新しいTodoを作成

**リクエストボディ**:
```json
{
  "task": "タスクの内容",
  "completed": false
}
```

### PUT /api/todos/{id}
指定されたIDのTodoを更新

**リクエストボディ**:
```json
{
  "task": "更新されたタスクの内容",
  "completed": true
}
```

### DELETE /api/todos/{id}
指定されたIDのTodoを削除

## セットアップ

### ローカル開発

1. 依存関係のインストール:
```bash
pip install -r requirements.txt
```

2. 環境変数の設定（オプション）:
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tododb"
```

3. アプリケーションの起動:
```bash
uvicorn src.main:app --reload --port 8080
```

4. APIドキュメントへのアクセス:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### Docker

1. イメージのビルド:
```bash
docker build -t todo-python-backend .
```

2. コンテナの起動:
```bash
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/tododb" \
  todo-python-backend
```

## データベース

デフォルトでPostgreSQLを使用します。`DATABASE_URL`環境変数で接続先を設定できます。

```
DATABASE_URL=postgresql://user:password@host:port/database
```

## CORS設定

以下のオリジンからのアクセスを許可しています：
- http://localhost:4200 (Angular)
- http://localhost:3000 (Next.js)
- http://localhost:8080

## アーキテクチャ

レイヤードアーキテクチャを採用しています：

1. **Router Layer**: HTTP リクエストの受け取りとレスポンスの返却
2. **Service Layer**: ビジネスロジックの実装
3. **Repository Layer**: データベースアクセス
4. **Model Layer**: データベーステーブルとのマッピング

## 開発

### コードフォーマット

```bash
pip install black isort
black src/
isort src/
```

### テスト

テストの実行:
```bash
pytest
```

カバレッジレポート付きでテストを実行:
```bash
pytest --cov=src --cov-report=term-missing --cov-report=html
```

テスト構成:
- `tests/test_repositories.py`: リポジトリ層のユニットテスト
- `tests/test_services.py`: サービス層のユニットテスト
- `tests/test_api.py`: APIエンドポイントの統合テスト
- `tests/conftest.py`: pytest フィクスチャ（テスト用DB設定など）

全てのテストはインメモリSQLiteデータベースを使用するため、PostgreSQLサーバーは不要です。
