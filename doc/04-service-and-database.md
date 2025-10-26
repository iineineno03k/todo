[[README.md](./README.md) に戻る]

# Serviceとデータベース統合

---

## Q7: アーキテクチャ構成とServiceの設計

### 質問
バックエンドは外部公開すべきか？フロントエンドから叩かれる用途だが、どうまとめるべきか？

### 回答: 正しいアーキテクチャ

**重要な理解**:
- **フロントエンド**: 外部（ブラウザ）からアクセス → 外部公開必要
- **バックエンド**: フロントエンドからのみアクセス → **外部公開不要**
- **PostgreSQL**: バックエンドからのみアクセス → **外部公開不要**

**詳細な構成図とService種類の説明**: → **[architecture.md](./architecture.md) を参照**

### Service種類の使い分け（まとめ）

| サービス | Service種類 | 理由 |
|---|---|---|
| Frontend | NodePort (開発) / LoadBalancer (本番) | ユーザーがブラウザからアクセス |
| Backend | ClusterIP | フロントエンドからのみアクセス |
| PostgreSQL | ClusterIP | バックエンドからのみアクセス |

---

## Q8: Service作成とPostgreSQL統合

### 実施内容

#### 1. Backend Service（ClusterIP）の作成

**k8s/backend-service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  labels:
    app: backend
spec:
  type: ClusterIP  # Internal communication only
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 8080        # Service port (used by other pods)
    targetPort: 8080  # Container port (backend pod)
```

**ポイント**:
- `type: ClusterIP` → クラスタ内部通信のみ
- `selector: app: backend` → backend Deploymentの Podを対象
- `port: 8080` → 他のPodがアクセスするポート
- `targetPort: 8080` → バックエンドコンテナの実際のポート

#### 2. PostgreSQL Deployment + Service の作成

**k8s/postgres-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  labels:
    app: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: "tododb"
        - name: POSTGRES_USER
          value: "todouser"
        - name: POSTGRES_PASSWORD
          value: "todopass"  # In production, use Secret instead
```

**k8s/postgres-service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  labels:
    app: postgres
spec:
  type: ClusterIP
  selector:
    app: postgres
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
```

#### 3. バックエンドのPostgreSQL対応

**build.gradle に PostgreSQLドライバー追加**:
```gradle
dependencies {
    // ... existing dependencies
    runtimeOnly 'org.postgresql:postgresql'  // PostgreSQL driver
}
```

**application.properties を PostgreSQL用に変更**:
```properties
server.port=8080

# PostgreSQL configuration (for Kubernetes)
spring.datasource.url=jdbc:postgresql://postgres-service:5432/tododb
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=todouser
spring.datasource.password=todopass
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

**重要**: `postgres-service` というDNS名でPostgreSQLにアクセス

#### 4. Dockerイメージ再ビルド

```bash
# minikube環境でビルド
eval $(minikube docker-env)
docker build -t todo-backend:latest .
```

#### 5. マニフェスト適用

```bash
# PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# Backend（既存を削除して再作成）
kubectl delete deployment backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

#### 6. 動作確認

**Pod状態確認**:
```bash
kubectl get pods
# backend-xxx と postgres-xxx が Running になっていること

kubectl get services
# backend-service と postgres-service が ClusterIP で作成されていること
```

**ログ確認**（PostgreSQL接続成功を確認）:
```bash
kubectl logs <backend-pod-name>
# "HikariPool-1 - Start completed." が出ていればDB接続成功
```

**API疎通テスト**:
```bash
# ポートフォワード
kubectl port-forward service/backend-service 8080:8080

# 別ターミナルでテスト
curl http://localhost:8080/api/todos
# → []

curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task":"PostgreSQL接続テスト"}'

curl http://localhost:8080/api/todos
# → [{"id":1,"task":"PostgreSQL接続テスト",...}]
```

### 重要な学習ポイント

#### Q: KubernetesはどうやってDockerイメージとマニフェストを紐付けているのか？

**A: イメージ名とラベル（Label）で紐付けている**

**1. Dockerイメージ名で指定**:
```yaml
spec:
  template:
    spec:
      containers:
      - name: todo-backend
        image: todo-backend:latest  # ← このイメージを使う
```

**2. ラベルでPodとServiceを紐付け**:

Deployment側（Podにラベルを付ける）:
```yaml
spec:
  template:
    metadata:
      labels:
        app: backend  # ← Podに「app: backend」ラベル
```

Service側（ラベルで対象を選ぶ）:
```yaml
spec:
  selector:
    app: backend  # ← 「app: backend」のPodを対象
```

**重要**:
- ディレクトリ名（`backend-java/`）は**一切関係ない**
- `app: backend` という名前は任意（`app: hogehoge` でもOK）
- `selector.matchLabels` と `template.metadata.labels` が一致していればOK

#### 名前と役割の整理

| 要素 | 役割 | 例 | 一致の必要性 |
|---|---|---|---|
| **Dockerイメージ名** | どのコンテナを動かすか | `todo-backend:latest` | - |
| **ラベル** | PodとServiceの紐付け | `app: backend` | Deployment と Service で一致 |
| **Deployment名** | Deployment識別 | `name: backend` | 任意 |
| **Service名** | Service識別 | `name: backend-service` | 任意 |
| **ディレクトリ名** | **無関係** | `backend-java/` | - |

#### 具体例：別のバックエンドに入れ替える場合

```yaml
# backend-deployment.yaml
spec:
  template:
    metadata:
      labels:
        app: backend  # ← ラベルは同じまま
    spec:
      containers:
      - image: todo-backend-python:latest  # ← イメージだけ変更
```

→ Service側は変更不要（ラベル `app: backend` が同じなので）

### 現在のファイル構成

```
k8s-sample/
├── backend-java/
│   ├── Dockerfile
│   ├── build.gradle         (PostgreSQLドライバー追加済み)
│   └── src/main/resources/
│       └── application.properties  (PostgreSQL接続設定済み)
├── doc/
│   ├── kubernetes-learning.md  (このファイル)
│   └── architecture.md         (アーキテクチャ図)
└── k8s/
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── postgres-deployment.yaml
    └── postgres-service.yaml
```

### API仕様（curlテスト用）

#### エンドポイント

| Method | URL | 説明 | Body |
|---|---|---|---|
| GET | `/api/todos` | 全件取得 | - |
| GET | `/api/todos/{id}` | 1件取得 | - |
| POST | `/api/todos` | 新規作成 | `{"task": "タスク名"}` |
| PUT | `/api/todos/{id}` | 更新 | `{"task": "タスク名", "completed": true}` |
| DELETE | `/api/todos/{id}` | 削除 | - |

#### curlコマンド例

```bash
# 全件取得
curl http://localhost:8080/api/todos

# 新規作成
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task":"Kubernetes学習"}'

# 更新（完了にする）
curl -X PUT http://localhost:8080/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"task":"Kubernetes学習","completed":true}'

# 削除
curl -X DELETE http://localhost:8080/api/todos/1
```
