# Kubernetes学習ドキュメント

Minikubeを使ったKubernetes学習の記録

## このドキュメント群について

### 目的
このドキュメントは単なる学習メモではなく、**学習者（ユーザー）の理解度を記録するためのもの**です。

### 使用方法
- **将来の別コンテキスト（別のClaudeインスタンス）への引き継ぎ資料**
- 学習者がどこまで理解しているかを把握するための記録
- どのレベルで説明すべきか、どこから始めるべきかを判断する材料

### 記録内容
- 学習者が実際にした質問（思考プロセス、疑問点）
- その質問に対する回答（理解に必要だった情報）
- 理解度の確認（正しく理解していること、補足が必要だったこと）
- 実施した作業内容（Dockerイメージ作成、マニフェスト作成など）

## 学習者の理解レベル（随時更新）

### Dockerの知識
- ✅ Dockerfileの作成
- ✅ マルチステージビルド理解済み
- ✅ イメージビルドと実行

### Kubernetesの理解

#### 基礎概念
- ✅ オーケストレーションの概念
- ✅ Pod/Deployment
- ✅ Service（ClusterIP, NodePort, LoadBalancer）
- ✅ ラベルによる紐付け
- ✅ DNS名による通信
- ✅ 実務での適用範囲（オーバーエンジニアリングのリスク含む）

#### 実装完了
- ✅ PostgreSQL統合（バックエンド→DB接続確認済み）
- ✅ API疎通確認（kubectl port-forward経由でCRUD操作成功）
- ✅ フロントエンドデプロイ（Next.js）
- ✅ Ingress構築（パスベースルーティング）
- ✅ CORS設定
- ✅ バリデーション調整

## ドキュメント構成

各ドキュメントは学習の順序に沿って構成されています：

### 1. [Minikubeのセットアップ](./01-minikube-setup.md)
- Minikubeのインストールと起動
- `minikube start`で何が起きているか
- 基本的なkubectlコマンド

### 2. [Kubernetesの基本概念](./02-kubernetes-concepts.md)
- Pod、Container、Deploymentの関係
- アプリケーション構成の考え方
- Kubernetesの適用範囲とオーバーエンジニアリング

### 3. [バックエンドのデプロイメント](./03-backend-deployment.md)
- Dockerイメージの作成
- Deploymentマニフェストの作成
- Podの動作確認
- イメージとラベルの紐付け

### 4. [Serviceとデータベース統合](./04-service-and-database.md)
- Serviceの役割とアーキテクチャ
- ClusterIP Serviceの作成
- PostgreSQL Deployment + Service
- バックエンドのDB接続設定

### 5. [Service種類の詳細](./05-service-types-deep-dive.md)
- ClusterIP、NodePort、LoadBalancerの違い
- なぜ本番環境ではLoadBalancerが必要か
- セキュリティとユーザビリティの観点

### 6. [フロントエンドのデプロイメント](./06-frontend-deployment.md)
- Next.jsのDockerイメージ作成
- standalone buildによる最適化
- 環境変数の扱い
- フロントエンドマニフェストの作成

### 7. [Ingressと問題解決](./07-ingress-and-troubleshooting.md)
- Ingress Controllerのセットアップ
- パスベースルーティング
- CORS設定の調整
- Zodバリデーションのトラブルシューティング

### 8. [Helmの導入](./08-helm-introduction.md) ⭐ 推奨
- なぜHelmが必要になるのか（複数環境での課題）
- Helmの基本概念（Chart、Values、Template、Release）
- 現在のYAMLをHelmチャート化する手順
- 環境別のvalues.yamlの使い分け
- 実務での拡張性を持たせる方法

## 現在のシステム構成

```
Kubernetesクラスタ（minikube）
  │
  ├─ Ingress (todo-ingress)
  │    ├─ / → frontend-service
  │    └─ /api → backend-service
  │
  ├─ Deployment: frontend
  │    └─ Pod (todo-frontend:latest - Next.js)
  │         └─ Service: frontend-service (NodePort 30080)
  │
  ├─ Deployment: backend
  │    └─ Pod (todo-backend:latest - Java)
  │         └─ Service: backend-service (ClusterIP 8080)
  │
  └─ Deployment: postgres
       └─ Pod (postgres:15-alpine)
            └─ Service: postgres-service (ClusterIP 5432)
```

## ファイル構成

```
sample/
├── backend-java/
│   ├── Dockerfile
│   ├── build.gradle
│   └── src/
├── frontend-nextjs/
│   ├── Dockerfile
│   ├── next.config.ts
│   └── src/
├── k8s/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
└── doc/
    ├── README.md (このファイル)
    ├── architecture.md
    ├── 01-minikube-setup.md
    ├── 02-kubernetes-concepts.md
    ├── 03-backend-deployment.md
    ├── 04-service-and-database.md
    ├── 05-service-types-deep-dive.md
    ├── 06-frontend-deployment.md
    ├── 07-ingress-and-troubleshooting.md
    └── 08-helm-introduction.md
```

## クイックスタート

### 前提条件
- Docker Desktop インストール済み
- minikube インストール済み
- kubectl インストール済み

### 手順

```bash
# 1. minikube起動
minikube start

# 2. minikube Docker環境でイメージビルド
eval $(minikube docker-env)

# バックエンド
cd backend-java
docker build -t todo-backend:latest .

# フロントエンド
cd ../frontend-nextjs
docker build -t todo-frontend:latest .

eval $(minikube docker-env -u)

# 3. Ingress Controller有効化
minikube addons enable ingress

# 4. マニフェスト適用
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml

# 5. 状態確認
kubectl get pods
kubectl get services
kubectl get ingress

# 6. アクセス
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80
# ブラウザで http://localhost:8080
```

## 次のステップ

### 実務的な拡張
- [ ] **Helmチャート化**（複数環境に対応） → [08-helm-introduction.md](./08-helm-introduction.md)
- [ ] ConfigMapによる設定管理
- [ ] Secretによる機密情報管理
- [ ] PersistentVolumeによる永続化

### 運用・監視
- [ ] ヘルスチェックとリソース制限
- [ ] スケーリングとローリングアップデート
- [ ] ログ収集と監視
