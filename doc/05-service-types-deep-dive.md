[[README.md](./README.md) に戻る]

# Service種類の詳細

---

## Q10: Serviceの種類（ClusterIP / NodePort / LoadBalancer）の違い

### 質問
フロントエンドは外部公開する必要があるが、NodePortとLoadBalancerの違いが分からない。Serviceの種類について理解したい。

### 回答

KubernetesのServiceには主に3つの種類があります。それぞれ**どこからアクセスできるか**が異なります。

#### 全体像

```
┌─────────────────────────────────────────────────────────────┐
│ インターネット（外部）                                      │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          │        LoadBalancer (外部IP)          │
          │                   │                   │
          │        NodePort (Node IP:30000-32767) │
          │                   │                   │
          │        ClusterIP (内部のみ)           │
┌─────────┼───────────────────┼───────────────────┼─────────┐
│         │                   │                   │         │
│ Kubernetesクラスタ          │                   │         │
│         │                   ▼                   │         │
│         │              ┌─────────┐              │         │
│         │              │   Pod   │              │         │
│         │              └─────────┘              │         │
│         │                                       │         │
└─────────┴───────────────────────────────────────┴─────────┘
```

---

### 1. ClusterIP（内部通信専用）

**特徴**:
- **クラスタ内部でのみアクセス可能**
- 外部からは一切アクセスできない
- デフォルトのService種類

**アクセス方法**:
```
Pod A → Service DNS名 → Pod B
```

**具体例（今回のバックエンド）**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP  # ← 内部のみ
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
```

**使える場面**:
```
Frontend Pod → backend-service:8080 → Backend Pod ✅
Backend Pod → postgres-service:5432 → PostgreSQL Pod ✅
```

**使えない場面**:
```
ブラウザ → backend-service:8080 ❌（外部からアクセス不可）
```

**用途**:
- データベース（PostgreSQL）
- 内部API（バックエンド）
- キャッシュ（Redis）など

---

### 2. NodePort（開発・テスト用の外部公開）

**特徴**:
- **クラスタ外からアクセス可能**
- 各NodeのIPアドレス + 固定ポート（30000-32767）でアクセス
- minikubeでの開発に最適

**仕組み**:
```
ブラウザ
   ↓
Node IP:30080（外部からアクセス可能）
   ↓
NodePort Service
   ↓
Pod（コンテナポート 3000）
```

**具体例**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort  # ← 外部公開（開発用）
  selector:
    app: frontend
  ports:
  - port: 3000          # Service内部ポート
    targetPort: 3000    # Podのコンテナポート
    nodePort: 30080     # 外部アクセス用ポート（30000-32767の範囲）
```

**アクセス方法**:

**minikube の場合**:
```bash
# minikubeが自動でURLを開いてくれる
minikube service frontend-service

# 手動でアクセスする場合
minikube ip
# → 例: 192.168.49.2

# ブラウザで開く
open http://192.168.49.2:30080
```

**通常のKubernetesクラスタの場合**:
```bash
# NodeのIPアドレスを取得
kubectl get nodes -o wide
# → 例: 10.0.1.5

# ブラウザで開く
open http://10.0.1.5:30080
```

**メリット**:
- 設定が簡単
- すぐに外部公開できる
- minikubeとの相性が良い

**デメリット**:
- ポート番号が30000-32767の範囲に限定される
- 本番環境では推奨されない（直接NodeのIPを公開するのはセキュリティ的に良くない）
- ロードバランサーがない（複数Nodeがある場合、手動で振り分ける必要がある）

**用途**:
- 開発環境（minikube）
- テスト環境
- 内部ツールの公開

---

### 3. LoadBalancer（本番環境の外部公開）

**特徴**:
- **クラウドプロバイダーが外部IPを自動割り当て**
- 本番環境での外部公開に最適
- minikubeでは制限あり（後述）

**仕組み**:
```
インターネット
   ↓
外部ロードバランサー（AWS ELB / GCP Load Balancer / Azure LB）
   ↓
複数のNode（自動で振り分け）
   ↓
LoadBalancer Service
   ↓
複数のPod（自動で振り分け）
```

**具体例**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: LoadBalancer  # ← 外部公開（本番用）
  selector:
    app: frontend
  ports:
  - port: 80           # 外部アクセス用ポート
    targetPort: 3000   # Podのコンテナポート
```

**アクセス方法**:

**クラウド環境（AWS/GCP/Azure）の場合**:
```bash
kubectl get service frontend-service
# NAME               TYPE           EXTERNAL-IP      PORT(S)
# frontend-service   LoadBalancer   34.123.45.67     80:30123/TCP

# ブラウザで開く
open http://34.123.45.67
```

**minikubeの場合（制限あり）**:
```bash
# minikubeはクラウドではないので外部IPは割り当てられない
kubectl get service frontend-service
# NAME               TYPE           EXTERNAL-IP   PORT(S)
# frontend-service   LoadBalancer   <pending>     80:30123/TCP
                                   # ↑ ずっとpendingのまま

# minikube tunnelコマンドで疑似的にLoadBalancerを使える
minikube tunnel
# （別ターミナルで）
kubectl get service frontend-service
# NAME               TYPE           EXTERNAL-IP   PORT(S)
# frontend-service   LoadBalancer   127.0.0.1     80:30123/TCP

# アクセス
open http://127.0.0.1
```

**メリット**:
- 外部IPが自動で割り当てられる
- 複数Nodeへの負荷分散が自動
- HTTPSの終端（SSL証明書の設定）が可能
- 本番環境に適している

**デメリット**:
- クラウド環境が必要（AWSなどで課金が発生）
- minikubeでは `minikube tunnel` が必要で、少し手間

**用途**:
- 本番環境のWebアプリケーション
- 外部APIの公開
- 商用サービス

---

### Service種類の比較表

| 種類 | 外部公開 | アクセス方法 | ポート範囲 | 用途 | minikube |
|---|---|---|---|---|---|
| **ClusterIP** | ❌ | Service DNS名（内部のみ） | 任意 | DB、内部API | ✅ |
| **NodePort** | ✅ | Node IP:30000-32767 | 30000-32767 | 開発・テスト | ✅ |
| **LoadBalancer** | ✅ | 外部IP（自動割り当て） | 任意（通常80/443） | 本番環境 | △（tunnel必要） |

---

### 今回の選択：NodePort（minikube用）

**理由**:
1. **開発環境**: minikubeでの学習なので、NodePortが最適
2. **シンプル**: `minikube service` コマンドで簡単にアクセス可能
3. **追加設定不要**: `minikube tunnel` などの追加コマンド不要

**構成**:
```
ブラウザ
   ↓
minikube IP:30080（NodePort）
   ↓
frontend-service（NodePort）
   ↓
frontend Pod（Next.js）
   ↓
backend-service:8080（ClusterIP）← Kubernetes内部通信
   ↓
backend Pod（Java）
   ↓
postgres-service:5432（ClusterIP）← Kubernetes内部通信
   ↓
postgres Pod（PostgreSQL）
```

---

### 補足：実際の本番環境ではどうするか？

本番環境では通常、以下の構成を使います：

**パターン1: LoadBalancer のみ**
```
インターネット → LoadBalancer → Frontend Pod
```

**パターン2: Ingress（より高度）**
```
インターネット
   ↓
Ingress Controller（Nginx/Traefik）
   ↓
frontend-service（ClusterIP）→ Frontend Pod
   ↓
backend-service（ClusterIP）→ Backend Pod
```

Ingressを使うと：
- 複数のServiceを1つの外部IPで公開できる
- パスベースのルーティング（`/` → frontend、`/api` → backend）
- HTTPS対応が簡単
- より柔軟なトラフィック制御

→ これは次のステップで学ぶ予定

---

## Q11: なぜ本番環境ではLoadBalancerが必要なのか？

### 質問
NodePortでも外部公開できるのに、なぜ本番環境ではLoadBalancerが必要なのか？L7のヘルスチェックや監視ができるから？リクエスト数が少ないなら分散の利点もないのでは？

### 回答

**結論から**: ユーザーの理解は部分的に正しいが、LoadBalancerが必要な理由は**ヘルスチェックや負荷分散以上に、セキュリティとユーザビリティの問題**です。

---

### NodePortの本番環境での問題点

#### 1. ポート番号がユーザーフレンドリーでない

**NodePortの制約**:
```
http://example.com:30080  ← ポート30080を指定する必要がある
https://example.com:30443 ← HTTPSも30000番台
```

**ユーザーが期待するURL**:
```
http://example.com        ← ポート80（デフォルト）
https://example.com       ← ポート443（デフォルト）
```

→ **ポート番号を明示する必要がある**のはユーザー体験として良くない

**LoadBalancerの場合**:
```yaml
spec:
  type: LoadBalancer
  ports:
  - port: 80           # ← 標準的なHTTPポート
    targetPort: 3000   # ← コンテナは3000番で動いている
```
→ `http://example.com` で直接アクセス可能

---

#### 2. セキュリティ上のリスク（最大の理由）

**NodePortの場合、NodeのIPアドレスを直接公開する必要がある**:

```
ユーザー
   ↓
Node IP: 10.0.1.5:30080  ← Nodeを直接公開
   ↓
Kubernetes Node（VM）
```

**問題点**:
- **攻撃対象の増加**: Node自体が外部に露出
- **Nodeへの直接攻撃**: SSHポート22、kubeletポート10250なども同じIPアドレス
- **セキュリティグループの設定が複雑**: 全NodeのIPに対してポート30080を開放する必要がある
- **Node追加時の手動対応**: 新しいNodeを追加するたびに、ファイアウォールやDNSを更新する必要がある

**LoadBalancerの場合**:

```
ユーザー
   ↓
LoadBalancer IP: 34.123.45.67  ← 専用の外部IP
   ↓
内部ネットワーク（非公開）
   ↓
Kubernetes Node（隠蔽されている）
```

**メリット**:
- **Nodeは内部ネットワークに隠蔽**: Nodeに直接アクセスできない
- **攻撃対象の最小化**: LoadBalancerのIPのみ公開
- **Node障害時も外部IPは不変**: Nodeが入れ替わってもユーザーには影響なし

---

#### 3. Node障害時の自動フェイルオーバー

**NodePortの問題**:

例えば、DNS設定が以下の場合：
```
example.com → 10.0.1.5:30080（Node 1のIP）
```

Node 1が落ちたら：
```
❌ example.com → 10.0.1.5:30080（アクセス不可）
```

→ **手動でDNSを別のNodeのIPに変更する必要がある**（数分〜数時間のダウンタイム）

**LoadBalancerの場合**:

```
example.com → LoadBalancer IP（固定）
   ↓
LoadBalancerが自動で健全なNodeに振り分け
   ↓
Node 1 ❌（落ちている）
Node 2 ✅（正常）← 自動でこちらに振り分け
Node 3 ✅（正常）
```

→ **自動フェイルオーバー、ダウンタイムなし**

---

#### 4. 複数Node環境での課題

**小規模アプリでも、可用性のためにNodeは通常3台構成**:

```
Node 1: 10.0.1.5
Node 2: 10.0.1.6
Node 3: 10.0.1.7
```

**NodePortの場合、どのNodeのIPを公開するか？**

**パターンA: 1台のNodeのIPだけ公開**
```
example.com → 10.0.1.5:30080
```
→ Node 1が落ちたらサービス全体が止まる（単一障害点）

**パターンB: 全NodeのIPを公開し、DNSラウンドロビン**
```
example.com → 10.0.1.5:30080
example.com → 10.0.1.6:30080
example.com → 10.0.1.7:30080
```
→ ユーザーのDNSキャッシュにより、落ちたNodeにアクセスし続ける可能性
→ ブラウザが自動でリトライしない

**LoadBalancerの場合**:
```
example.com → LoadBalancer IP（1つ）
   ↓
LoadBalancerが3台のNodeに自動で振り分け
   ↓
Node 1, 2, 3（全て活用）
```
→ シンプルで確実

---

### 負荷分散について（ユーザーの指摘は正しい）

**ユーザーの理解**: 「リクエスト数が少ないなら利点にならない」

→ **完全に正しい**。

小規模サービス（月間数千〜数万リクエスト）では：
- LoadBalancerの負荷分散機能は過剰
- 1台のNodeで十分処理できる

**ただし、負荷分散以外の理由（セキュリティ、ポート番号、フェイルオーバー）でLoadBalancerは有用**

---

### ヘルスチェックについて

**ユーザーの理解**: 「L7でのヘルスチェックや監視ができるから」

→ **部分的に正しいが、正確にはL4とL7を分けて考える必要がある**

#### LoadBalancer自体はL4（Transport層）

通常のKubernetes LoadBalancerサービスは：
- **L4 (TCP/UDPレベル)** でヘルスチェック
- ポートが開いているか？接続できるか？をチェック
- HTTPステータスコードやレスポンス内容は見ない

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
```

→ TCPポート3000に接続できるかをチェック

#### L7ヘルスチェックはIngress or ALB

**L7（Application層）のヘルスチェック**を行うには：

**パターン1: Ingress**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
spec:
  rules:
  - http:
      paths:
      - path: /
        backend:
          service:
            name: frontend-service
            port: 3000
```

**パターン2: AWS ALB (Application Load Balancer)**
```yaml
metadata:
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    alb.ingress.kubernetes.io/healthcheck-path: "/health"
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: "15"
```

→ `/health` エンドポイントにHTTP GETして、200 OKが返るかチェック

**まとめ**:
- **LoadBalancer = L4ヘルスチェック**（ポート開放チェック）
- **Ingress/ALB = L7ヘルスチェック**（HTTPレスポンスチェック）

---

### 実際の本番環境での構成（小規模サービスの場合）

**小規模サービス（リクエスト少ない）でも、セキュリティとユーザビリティのためにLoadBalancerを使う**:

```
インターネット
   ↓
LoadBalancer（ポート80/443）← セキュリティ、固定IP、標準ポート
   ↓
frontend-service (ClusterIP)
   ↓
frontend Pod (replicas: 1)  ← 負荷分散は不要でも1台で十分
```

**利点**:
1. ✅ ポート80でアクセス可能（ユーザビリティ）
2. ✅ Nodeが隠蔽される（セキュリティ）
3. ✅ Node障害時も自動フェイルオーバー（可用性）
4. ❌ 負荷分散は活用されない（リクエスト少ないため）← これはOK

→ **負荷分散は副次的なメリット。主な目的はセキュリティと可用性**

---

### NodePortが適している場面

以下の場合はNodePortでも問題ない：

1. **開発環境**: minikube、kind、学習用
2. **内部ツール**: 社内のみアクセス、ポート番号は気にしない
3. **テスト環境**: 一時的な検証用
4. **コスト最優先**: LoadBalancerの課金を避けたい（ただしセキュリティリスクあり）

---

### まとめ

| 要素 | NodePort | LoadBalancer |
|---|---|---|
| **ポート番号** | 30000-32767（不便） | 80/443（標準） |
| **セキュリティ** | Node IP公開（リスク） | Node隠蔽（安全） |
| **フェイルオーバー** | 手動DNS変更 | 自動 |
| **負荷分散** | 手動 | 自動（小規模では過剰） |
| **ヘルスチェック** | なし | L4レベルであり |
| **用途** | 開発・テスト | 本番環境 |

**結論**:
- **負荷分散やヘルスチェックは副次的なメリット**
- **本質的な理由は、セキュリティ（Node隠蔽）とユーザビリティ（標準ポート）**
- 小規模サービスでも、これらの理由でLoadBalancerが推奨される
