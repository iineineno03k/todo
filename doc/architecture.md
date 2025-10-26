# TODOアプリ Kubernetesアーキテクチャ

## 全体構成図

```
┌─────────────────────────────────────────────────────────┐
│  外部（インターネット / ブラウザ）                         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ http://frontend.example.com
                          ↓
          ┌───────────────────────────────┐
          │ NodePort Service              │ ← 外部公開
          │ frontend-service              │
          │ Port: 30000 → 3000           │
          └───────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Kubernetes クラスタ（minikube）                          │
│                                                          │
│   ┌──────────────────────────────────────┐              │
│   │ Frontend Deployment                  │              │
│   │ (Next.js)                           │              │
│   │ Replicas: 1                         │              │
│   └──────────────────────────────────────┘              │
│                     │                                    │
│                     │ http://backend-service:8080/api   │
│                     ↓                                    │
│   ┌─────────────────────────────────┐                   │
│   │ ClusterIP Service               │ ← 内部通信のみ    │
│   │ backend-service                 │                   │
│   │ Port: 8080 → 8080              │                   │
│   └─────────────────────────────────┘                   │
│                     │                                    │
│                     ↓                                    │
│   ┌──────────────────────────────────────┐              │
│   │ Backend Deployment                   │              │
│   │ (Java/Spring Boot)                   │              │
│   │ Replicas: 1                          │              │
│   └──────────────────────────────────────┘              │
│                     │                                    │
│                     │ postgresql://postgres-service:5432│
│                     ↓                                    │
│   ┌─────────────────────────────────┐                   │
│   │ ClusterIP Service               │ ← 内部通信のみ    │
│   │ postgres-service                │                   │
│   │ Port: 5432 → 5432              │                   │
│   └─────────────────────────────────┘                   │
│                     │                                    │
│                     ↓                                    │
│   ┌──────────────────────────────────────┐              │
│   │ PostgreSQL Deployment                │              │
│   │ (Database)                           │              │
│   │ Replicas: 1                          │              │
│   └──────────────────────────────────────┘              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## コンポーネント一覧

| コンポーネント | Deployment | Service名 | Service種類 | ポート | 公開範囲 | 接続元 |
|---|---|---|---|---|---|---|
| **フロントエンド** | frontend | frontend-service | NodePort | 3000 | 外部 | ブラウザ |
| **バックエンド** | backend | backend-service | ClusterIP | 8080 | 内部のみ | フロントエンド |
| **データベース** | postgres | postgres-service | ClusterIP | 5432 | 内部のみ | バックエンド |

## Service種類の説明

### ClusterIP（内部通信用）
- クラスタ内部からのみアクセス可能
- 固定のIPアドレスとDNS名を提供
- DNS名: `<service-name>.<namespace>.svc.cluster.local`
- 短縮形: `<service-name>` (同じnamespace内)

**用途**: バックエンド、データベースなど内部サービス

### NodePort（外部公開用 - 開発環境）
- ノードのIPアドレス + ポート番号でアクセス
- ポート範囲: 30000-32767
- 本番環境では非推奨（LoadBalancerを使う）

**用途**: フロントエンドの外部公開（開発環境）

### LoadBalancer（外部公開用 - 本番環境）
- クラウドプロバイダーの外部LBを自動作成
- AWS ELB、GCP Load Balancer等
- minikubeでは使えない

**用途**: フロントエンドの外部公開（本番環境）

## DNS名による通信

Kubernetes内では、Service名をDNS名として使用できる：

```java
// バックエンド → PostgreSQL
spring.datasource.url=jdbc:postgresql://postgres-service:5432/tododb
```

```javascript
// フロントエンド → バックエンド
fetch('http://backend-service:8080/api/todos')
```

## セキュリティ設計

**最小権限の原則**:
- 必要最小限のサービスだけを外部公開
- 内部通信で済むものはClusterIPを使用
- 外部公開 = 攻撃対象となるため、フロントエンドのみ公開

## ファイル一覧

```
k8s/
├── backend-deployment.yaml    # バックエンドのPod定義
├── backend-service.yaml       # バックエンドの内部通信用Service (ClusterIP)
├── postgres-deployment.yaml   # PostgreSQLのPod定義
└── postgres-service.yaml      # PostgreSQLの内部通信用Service (ClusterIP)
```

## 今後の拡張

- [ ] フロントエンド（Next.js）の追加
- [ ] Ingress によるルーティング
- [ ] Secret による機密情報管理
- [ ] PersistentVolume による永続化
- [ ] HorizontalPodAutoscaler による自動スケーリング
