[[README.md](./README.md) に戻る]

# バックエンドのデプロイメント

---

## Q4: Dockerイメージの作成とローカル動作確認

### 実施内容

#### 1. Dockerfileの作成

マルチステージビルドで最適化したDockerfileを作成：

**backend-java/Dockerfile**
```dockerfile
# Build stage
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Copy gradle files for dependency caching
COPY build.gradle ./
COPY gradle ./gradle
COPY gradlew ./

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build application
RUN gradle bootJar --no-daemon

# Runtime stage
FROM amazoncorretto:17-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**ポイント**:
- **マルチステージビルド**: ビルド環境とランタイム環境を分離
- **レイヤーキャッシュ**: 依存関係のダウンロードを先に実行し、ソースコード変更時のビルドを高速化
- **軽量イメージ**: Alpine Linuxベースで最小限のサイズ

#### 2. イメージビルド & コンテナ起動

```bash
# イメージビルド
cd backend-java
docker build -t todo-backend:latest .

# コンテナ起動（ポート8081で公開）
docker run -d -p 8081:8080 --name todo-backend todo-backend:latest

# ログ確認
docker logs todo-backend
```

#### 3. API動作確認

```bash
# 全TODO取得 (初期状態は空)
curl http://localhost:8081/api/todos
# → []

# TODO作成
curl -X POST http://localhost:8081/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task":"Kubernetes学習"}'
# → {"id":1,"task":"Kubernetes学習","completed":false,"createdAt":"2025-10-26T05:46:30.825018"}

# 再度取得（作成されたTODO表示）
curl http://localhost:8081/api/todos
# → [{"id":1,"task":"Kubernetes学習","completed":false,"createdAt":"2025-10-26T05:46:30.825018"}]
```

**結果**: http://localhost:8081 でTODO APIが正常稼働

---

## Q6: Deploymentの作成と動作確認

### 実施内容

#### 1. マニフェストファイルの配置
```
k8s-sample/
  ├─ backend-java/
  ├─ doc/
  └─ k8s/                          ← 新規作成
       └─ backend-deployment.yaml
```

#### 2. backend-deployment.yaml の作成

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: todo-backend
        image: todo-backend:latest
        imagePullPolicy: Never  # Use local image (for minikube)
        ports:
        - containerPort: 8080
```

**重要なポイント**:
- `imagePullPolicy: Never` → minikube内のローカルイメージを使用
- `replicas: 1` → まずは1台のPodで動作確認

#### 3. minikube内でイメージビルド

**理由**: minikubeは独自のDocker環境を持っている

```bash
# minikubeのDocker環境に切り替え
eval $(minikube docker-env)

# イメージビルド
docker build -t todo-backend:latest .

# 元に戻す
eval $(minikube docker-env -u)
```

#### 4. Deploymentの適用

```bash
kubectl apply -f k8s/backend-deployment.yaml
# → deployment.apps/backend created
```

#### 5. 動作確認

```bash
# Deploymentの確認
kubectl get deployments
# NAME      READY   UP-TO-DATE   AVAILABLE   AGE
# backend   1/1     1            1           11s

# Podの確認
kubectl get pods
# NAME                      READY   STATUS    RESTARTS   AGE
# backend-7fb74b94c-l4n52   1/1     Running   0          11s

# ログ確認
kubectl logs backend-7fb74b94c-l4n52

# ポートフォワードでアクセス確認
kubectl port-forward pod/backend-7fb74b94c-l4n52 8080:8080
# 別ターミナルで: curl localhost:8080/api/todos
```

### 学習ポイント

**Pod名の命名規則**:
```
backend-7fb74b94c-l4n52
  ↑       ↑        ↑
  |       |        ランダムID
  |       ReplicaSetのハッシュ
  Deployment名
```

**port-forwardの仕組み**:
- 開発用の一時的なアクセス方法
- ターミナルがトンネルとして機能
- 本番環境では使わない（次はServiceを使う）
