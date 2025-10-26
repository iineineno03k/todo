# Kubernetes学習プロジェクト - 現在の状態

## プロジェクト概要

Spring Boot（Java）のTODOアプリをKubernetes（minikube）にデプロイする学習プロジェクト。

## 現在の達成状況

### ✅ 完了していること

1. **バックエンド（Spring Boot + PostgreSQL）のKubernetesデプロイ**
   - Deployment作成完了
   - ClusterIP Service作成完了
   - PostgreSQL統合完了
   - API疎通確認完了

2. **作成済みリソース**
   ```
   kubectl get all

   Pods:
   - backend-xxx (Spring Boot)
   - postgres-xxx (PostgreSQL 15)

   Services:
   - backend-service (ClusterIP)
   - postgres-service (ClusterIP)

   Deployments:
   - backend
   - postgres
   ```

3. **動作確認済み**
   - バックエンド → PostgreSQL 接続成功
   - CRUD API動作確認済み（curl経由）

### 📋 未完了（次のステップ）

- [ ] フロントエンド（Next.js）の追加
- [ ] Ingress によるルーティング
- [ ] Secret による機密情報管理
- [ ] PersistentVolume による永続化（現在DBデータは再起動で消える）

## ドキュメント構成

| ファイル | 内容 |
|---|---|
| [kubernetes-learning.md](./kubernetes-learning.md) | 学習ログ（Q&A形式、全8問） |
| [architecture.md](./architecture.md) | アーキテクチャ図とService種類の説明 |
| [README.md](./README.md) | このファイル（現在の状態サマリー） |

## ファイル構成

```
k8s-sample/
├── backend-java/
│   ├── Dockerfile                  # マルチステージビルド
│   ├── build.gradle               # PostgreSQLドライバー追加済み
│   ├── src/main/
│   │   ├── java/
│   │   │   └── com/example/todo/
│   │   │       ├── TodoApplication.java
│   │   │       ├── controller/TodoController.java
│   │   │       ├── model/Todo.java
│   │   │       ├── repository/TodoRepository.java
│   │   │       └── service/TodoService.java
│   │   └── resources/
│   │       └── application.properties  # PostgreSQL接続設定
│   └── (build artifacts)
├── doc/
│   ├── README.md                  # このファイル
│   ├── kubernetes-learning.md     # 学習ログ
│   └── architecture.md            # アーキテクチャ図
└── k8s/
    ├── backend-deployment.yaml    # バックエンドDeployment
    ├── backend-service.yaml       # バックエンドService (ClusterIP)
    ├── postgres-deployment.yaml   # PostgreSQL Deployment
    └── postgres-service.yaml      # PostgreSQL Service (ClusterIP)
```

## 現在のアーキテクチャ

詳細は [architecture.md](./architecture.md) を参照。

```
Kubernetes クラスタ（minikube）
  │
  ├─ Backend Deployment
  │    └─ Pod: todo-backend:latest (Java/Spring Boot)
  │         ↓
  │    ClusterIP Service: backend-service (8080)
  │
  └─ PostgreSQL Deployment
       └─ Pod: postgres:15-alpine
            ↓
       ClusterIP Service: postgres-service (5432)
```

## クイックスタート（既存環境の再現）

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
cd backend-java
docker build -t todo-backend:latest .

# 3. マニフェスト適用
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 4. 状態確認
kubectl get pods
kubectl get services

# 5. API疎通テスト
kubectl port-forward service/backend-service 8080:8080
# 別ターミナルで:
curl http://localhost:8080/api/todos
```

## API仕様

### エンドポイント

| Method | URL | 説明 | Body |
|---|---|---|---|
| GET | `/api/todos` | 全件取得 | - |
| GET | `/api/todos/{id}` | 1件取得 | - |
| POST | `/api/todos` | 新規作成 | `{"task": "タスク名"}` |
| PUT | `/api/todos/{id}` | 更新 | `{"task": "タスク名", "completed": true}` |
| DELETE | `/api/todos/{id}` | 削除 | - |

### curlテスト例

```bash
# TODO作成
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task":"Kubernetes学習"}'

# 全件取得
curl http://localhost:8080/api/todos

# 更新
curl -X PUT http://localhost:8080/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"task":"Kubernetes学習","completed":true}'

# 削除
curl -X DELETE http://localhost:8080/api/todos/1
```

## 学習者の理解レベル

詳細は [kubernetes-learning.md](./kubernetes-learning.md) の冒頭を参照。

**理解済み**:
- Dockerの基礎（Dockerfile、マルチステージビルド）
- Kubernetesの基礎（Pod、Deployment、Service）
- ラベルによる紐付け（selector、matchLabels）
- DNS名による通信（Service名でアクセス）
- ClusterIP（内部通信用Service）
- PostgreSQL統合

**未学習**:
- NodePort / LoadBalancer（外部公開）
- Ingress
- Secret
- PersistentVolume
- HorizontalPodAutoscaler

## よくある操作

### Pod状態確認
```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Podに入る
```bash
kubectl exec -it <pod-name> -- sh
```

### リソース削除
```bash
# 特定のリソース削除
kubectl delete deployment backend
kubectl delete service backend-service

# 全リソース削除
kubectl delete all --all
```

### イメージ再ビルド後の更新
```bash
# 1. minikube環境でビルド
eval $(minikube docker-env)
docker build -t todo-backend:latest .

# 2. Deploymentを再作成
kubectl delete deployment backend
kubectl apply -f k8s/backend-deployment.yaml
```

## トラブルシューティング

### Podが起動しない
```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Imageが見つからない
```bash
# imagePullPolicy: Never になっているか確認
# minikube Docker環境でビルドしたか確認
eval $(minikube docker-env)
docker images | grep todo-backend
```

### DB接続エラー
```bash
# PostgreSQL Podが起動しているか
kubectl get pods | grep postgres

# バックエンドのログ確認
kubectl logs <backend-pod-name>

# application.propertiesのURL確認
# jdbc:postgresql://postgres-service:5432/tododb
```

## 参考リンク

- [Kubernetes公式ドキュメント - Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes公式ドキュメント - Service](https://kubernetes.io/docs/concepts/services-networking/service/)
- [minikube公式ドキュメント](https://minikube.sigs.k8s.io/docs/)
