[[README.md](./README.md) に戻る]

# フロントエンドのデプロイメント

---

## Q9: フロントエンド（Next.js）のDockerイメージ作成

### 実施内容

#### 1. next.config.ts の設定

**standalone buildを有効化**（Dockerでの軽量化）:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone build for Docker optimization
  output: 'standalone',
};

export default nextConfig;
```

**ポイント**:
- `output: 'standalone'` → ビルド時に `.next/standalone` ディレクトリが生成される
- 必要最小限のファイルのみ含まれた軽量な実行環境
- 通常のビルドより大幅にイメージサイズを削減

#### 2. Dockerfile の作成

**frontend-nextjs/Dockerfile**:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js
CMD ["node", "server.js"]
```

**ポイント**:
- **マルチステージビルド**: ビルド環境（builder）と実行環境（runner）を分離
- **セキュリティ**: 非rootユーザー（nextjs）で実行
- **軽量化**: standalone buildにより、node_modulesの大部分を除外
- **ポート**: 3000番ポートを公開

#### 3. .dockerignore の作成

```
# Dependencies
node_modules
npm-debug.log*

# Next.js build output
.next
out

# Environment files
.env*.local
.env

# Git
.git
.gitignore

# IDE
.vscode
.idea

# OS
.DS_Store
Thumbs.db
```

**ポイント**:
- ビルドに不要なファイルを除外 → ビルド高速化
- `.env*.local` を除外 → 環境変数はKubernetesで設定

#### 4. イメージビルド & 動作確認

**ローカル環境でビルド**:
```bash
cd frontend-nextjs
docker build -t todo-frontend:latest .
```

**ローカルでテスト実行**:
```bash
# バックエンドに接続できるよう環境変数を設定
docker run -d -p 3001:3000 \
  --name todo-frontend \
  -e NEXT_PUBLIC_API_URL=http://host.docker.internal:8081/api \
  todo-frontend:latest

# ログ確認
docker logs todo-frontend
# → ▲ Next.js 16.0.0
#    - Local:        http://localhost:3000
#    ✓ Ready in 30ms

# アクセス確認
curl http://localhost:3001
# → HTMLが返ってくればOK
```

**minikube環境でビルド**:
```bash
# minikubeのDocker環境に切り替え
eval $(minikube docker-env)

# イメージビルド
docker build -t todo-frontend:latest .

# 元に戻す
eval $(minikube docker-env -u)
```

### 学習ポイント

#### Next.js の standalone build とは？

**通常のビルド**:
```
.next/
├── cache/
├── server/
├── static/
└── ...
+ node_modules/  ← すべての依存関係（数百MB）
```

**standalone build**:
```
.next/standalone/
├── server.js          ← エントリーポイント
├── package.json
└── node_modules/      ← 実行に必要な最小限のみ（数十MB）
```

→ イメージサイズが大幅削減（通常 500MB → standalone 150MB）

#### 環境変数の扱い

**Next.js の環境変数ルール**:
1. **NEXT_PUBLIC_** で始まる変数 → ブラウザに公開される
2. ビルド時に値が埋め込まれる（動的に変更できない）

**今回の設計**:
```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
```

- 開発時: `.env.local` で `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- Kubernetes: Deploymentマニフェストで設定（次のステップで実施）

#### バックエンドとの接続設定

**ローカル開発**: `http://localhost:8080/api`
**Kubernetes環境**: `http://backend-service:8080/api` （ServiceのDNS名）

→ 環境ごとに異なる値を設定する必要がある

### 現在のファイル構成

```
k8s-sample/
├── backend-java/
│   ├── Dockerfile
│   └── ...
├── frontend-nextjs/
│   ├── Dockerfile              ← 新規作成
│   ├── .dockerignore           ← 新規作成
│   ├── next.config.ts          ← standalone設定追加
│   ├── src/
│   │   └── lib/api.ts
│   └── package.json
├── doc/
│   ├── kubernetes-learning.md
│   └── architecture.md
└── k8s/
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── postgres-deployment.yaml
    └── postgres-service.yaml
```

---

## Q12: フロントエンドのKubernetesマニフェスト作成

### 実施内容

#### 1. frontend-deployment.yaml の作成

**k8s/frontend-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: todo-frontend
        image: todo-frontend:latest
        imagePullPolicy: Never  # Use local image (for minikube)
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://backend-service:8080/api"
```

**重要なポイント**:
- **replicas: 1**: 学習用なので1台で十分
- **imagePullPolicy: Never**: minikube内のローカルイメージを使用
- **env**: 環境変数でバックエンドのService DNS名を指定
  - `http://backend-service:8080/api` ← Kubernetes内部DNS

**環境変数の仕組み**:
```
ビルド時（Dockerイメージ作成時）:
  NEXT_PUBLIC_API_URL は未設定 → デフォルト値 "http://localhost:8080/api"

実行時（Kubernetes Pod起動時）:
  env で上書き → "http://backend-service:8080/api"
```

**注意**: Next.jsの `NEXT_PUBLIC_` 環境変数は通常ビルド時に埋め込まれますが、今回はランタイムで設定しています。これが動作するのは、`process.env.NEXT_PUBLIC_API_URL` を実行時に参照しているためです。

#### 2. frontend-service.yaml の作成

**k8s/frontend-service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  labels:
    app: frontend
spec:
  type: NodePort  # External access (development environment)
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 3000        # Service port (used by other pods)
    targetPort: 3000  # Container port (frontend pod)
    nodePort: 30080   # External access port (30000-32767 range)
```

**ポイント**:
- **type: NodePort**: 外部公開（開発環境用）
- **nodePort: 30080**: ブラウザからアクセスするポート
- **port: 3000**: Service内部のポート（今回は使わないが慣例で設定）
- **targetPort: 3000**: フロントエンドPodのコンテナポート

**アクセスフロー**:
```
ブラウザ
   ↓
minikube IP:30080（NodePort）
   ↓
frontend-service
   ↓
frontend Pod（ポート3000）
```
