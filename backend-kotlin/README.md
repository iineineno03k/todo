# Todo API - Kotlin版

Spring Boot 3.2とKotlin 2.0を使用したTodoアプリケーションのバックエンドです。
OpenAPI Generatorを使用してAPI仕様からインターフェースを自動生成しています。

## 技術スタック

- **Kotlin**: 2.0.0（最新安定版）
- **Spring Boot**: 3.2.3
- **Spring Data JPA**: データベースアクセス
- **H2/PostgreSQL**: データベース
- **OpenAPI Generator**: API仕様からのコード生成
- **Gradle**: ビルドツール

## プロジェクト構成

```
backend-kotlin/
├── openapi/
│   └── openapi.yaml          # OpenAPI仕様書
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/example/todo/
│   │   │       ├── TodoApplication.kt      # メインアプリケーション
│   │   │       ├── controller/
│   │   │       │   └── TodoController.kt   # REST APIコントローラー
│   │   │       ├── service/
│   │   │       │   └── TodoService.kt      # ビジネスロジック
│   │   │       ├── repository/
│   │   │       │   └── TodoRepository.kt   # データアクセス層
│   │   │       └── model/
│   │   │           └── Todo.kt             # エンティティモデル
│   │   └── resources/
│   │       └── application.yml             # アプリケーション設定
│   └── test/
├── build.gradle.kts                        # Gradleビルド設定
├── settings.gradle.kts
└── Dockerfile
```

## OpenAPI自動生成の仕組み

### 1. OpenAPI仕様書の定義

`openapi/openapi.yaml`にAPI仕様を定義しています。この仕様に基づいて、以下が自動生成されます：

- APIインターフェース（`com.example.todo.api.TodosApi`）
- データモデル（`com.example.todo.api.model.*`）

### 2. ビルド時の自動生成

`build.gradle.kts`でOpenAPI Generatorプラグインを設定しており、Kotlinコンパイル前に自動的に実行されます：

```kotlin
openApiGenerate {
    generatorName.set("kotlin-spring")
    inputSpec.set("$projectDir/openapi/openapi.yaml")
    outputDir.set(layout.buildDirectory.dir("generated").get().asFile.path)
    apiPackage.set("com.example.todo.api")
    modelPackage.set("com.example.todo.api.model")
    configOptions.set(
        mapOf(
            "dateLibrary" to "java8",
            "interfaceOnly" to "true",
            "useTags" to "true",
            "useSpringBoot3" to "true"
        )
    )
}
```

### 3. 生成されたインターフェースの実装

`TodoController.kt`が生成された`TodosApi`インターフェースを実装しています：

```kotlin
@RestController
class TodoController(
    private val todoService: TodoService
) : TodosApi {
    // APIメソッドの実装
}
```

## セットアップと実行

### 前提条件

- JDK 17以上
- Gradle 8.5以上（またはGradle Wrapper使用）

### ローカル実行

```bash
# OpenAPI仕様からコード生成とビルド
./gradlew build

# アプリケーション起動
./gradlew bootRun
```

アプリケーションは `http://localhost:8080` で起動します。

### Docker実行

```bash
# Dockerイメージのビルド
docker build -t todo-kotlin .

# コンテナ起動
docker run -p 8080:8080 todo-kotlin
```

## API仕様の確認

アプリケーション起動後、以下のURLでAPI仕様を確認できます：

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## APIエンドポイント

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/todos` | 全てのTodoを取得 |
| GET | `/api/todos/{id}` | 指定IDのTodoを取得 |
| POST | `/api/todos` | 新しいTodoを作成 |
| PUT | `/api/todos/{id}` | 指定IDのTodoを更新 |
| DELETE | `/api/todos/{id}` | 指定IDのTodoを削除 |

## 使用例

### Todoの作成

```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task": "Buy groceries", "completed": false}'
```

### 全Todoの取得

```bash
curl http://localhost:8080/api/todos
```

### Todoの更新

```bash
curl -X PUT http://localhost:8080/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"task": "Buy groceries", "completed": true}'
```

## OpenAPI仕様の変更方法

1. `openapi/openapi.yaml`を編集
2. `./gradlew clean build`を実行して再生成
3. 必要に応じて`TodoController`の実装を更新

## データベース

### 開発環境（H2）

- **URL**: `jdbc:h2:mem:tododb`
- **Console**: http://localhost:8080/h2-console
- **Username**: `sa`
- **Password**: （空）

### 本番環境（PostgreSQL）

`application.yml`を編集してPostgreSQLに切り替え：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tododb
    username: your_username
    password: your_password
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

## Java版との違い

### 主な改善点

1. **Kotlin言語の利用**
   - Null安全性
   - データクラスによる簡潔なモデル定義
   - 拡張関数の活用

2. **OpenAPI Generatorの導入**
   - API仕様が常にコードと同期
   - 型安全なAPI実装
   - ドキュメント自動生成

3. **モダンな設定**
   - Kotlin DSL（build.gradle.kts）
   - YAML形式の設定ファイル

## ライセンス

MIT License
