# Kubernetes学習メモ

Minikubeを使ったKubernetes学習の記録

---

## このドキュメントについて

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

### 学習者の理解レベル（随時更新）
- **Dockerの知識**: あり（Dockerfileの作成、マルチステージビルド理解済み）
- **Kubernetesの理解**: 学習中
  - オーケストレーションの概念: 理解済み
  - Pod/Deployment/Service: 学習中
  - 実務での適用範囲: 理解済み（オーバーエンジニアリングのリスク含む）

---

## Q1: Minikubeを使った学習手順とアプリの必要性について

### 質問
Kubernetesの学習を行いたい。とりあえずminikubeというのを使ってハンズオンやりたいが、どういう手順がいいか？また、アプリはあった方がいい？TODOアプリがあるのでそれを使うべきか？

### 回答

#### アプリについて

**TODOアプリを使うことを強く推奨**

理由：
1. **実践的な学習**: 単純なNginxイメージだけより、実際のアプリケーションをデプロイする方が実務に近い
2. **複数のリソース**: フロントエンド、バックエンド、データベースなど複数のコンポーネントで、Service、Deployment、ConfigMap、Secretなど色々なKubernetesリソースを学べる
3. **モチベーション**: 動くアプリの方が学習が楽しい

#### 学習ステップ

##### 1. 環境セットアップ

```bash
# Minikubeのインストール (Homebrewを使う場合)
brew install minikube

# 起動
minikube start

# kubectlが使えることを確認
kubectl get nodes
```

##### 2. 基礎から段階的に学習

**Phase 1: 単純なデプロイメント**
- TODOアプリの1コンポーネント(例: バックエンド)だけをDeployment化
- Podの概念を理解
- `kubectl logs`, `kubectl exec`でデバッグ

**Phase 2: サービス追加**
- ClusterIP Serviceでアプリ間通信
- NodePort/LoadBalancerで外部公開
- `minikube service`コマンドでアクセス

**Phase 3: データベース追加**
- StatefulSetまたはDeploymentでDB追加
- PersistentVolume/PersistentVolumeClaimでデータ永続化
- ConfigMapとSecretで設定管理

**Phase 4: フル構成**
- フロントエンド + バックエンド + DB
- Ingressでルーティング
- リソース制限、ヘルスチェック追加

##### 3. 実践的な操作を学ぶ
- スケーリング (`kubectl scale`)
- ローリングアップデート
- ロールバック
- ログ確認とトラブルシューティング

---

## Q2: `minikube start`で何が起きているのか？

### 質問
`minikube start`を実行したら色々なログが出たが、内部で何が起きているのか？

### 実行ログ
```
��  Darwin 15.5 (arm64) 上の minikube v1.37.0
✨  docker ドライバーが自動的に選択されました。他の選択肢: virtualbox, ssh
📌  root 権限を持つ Docker Desktop ドライバーを使用
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.48 ...
💾  ロード済み Kubernetes v1.34.0 をダウンロードしています...
    > preloaded-images-k8s-v18-v1...:  332.38 MiB / 332.38 MiB  100.00% 33.74 M
    > gcr.io/k8s-minikube/kicbase...:  450.06 MiB / 450.06 MiB  100.00% 10.90 M
🔥  Creating docker container (CPUs=2, Memory=4000MB) ...
🐳  Docker 28.4.0 で Kubernetes v1.34.0 を準備しています...
🔗  bridge CNI (コンテナーネットワークインターフェース) を設定中です...
��  Kubernetes コンポーネントを検証しています...
    ▪ gcr.io/k8s-minikube/storage-provisioner:v5 イメージを使用しています
🌟  有効なアドオン: storage-provisioner, default-storageclass
🏄  終了しました！kubectl がデフォルトで「minikube」クラスターと「default」ネームスペースを使用するよう設定されました
```

### 回答: 各ステップの解説

#### 1. 環境検出
```
��  Darwin 15.5 (arm64) 上の minikube v1.37.0
✨  docker ドライバーが自動的に選択されました
```
- macOS (ARM64アーキテクチャ) を検出
- 仮想化ドライバとしてDockerを自動選択（他にVirtualBox, SSHも選択可）
- Dockerドライバは、Dockerコンテナ内にKubernetesクラスタを構築する方式

#### 2. イメージのダウンロード
```
🚜  Pulling base image v0.0.48 ...
💾  Kubernetes v1.34.0 をダウンロードしています...
    > preloaded-images-k8s-v18-v1...:  332.38 MiB
    > gcr.io/k8s-minikube/kicbase...:  450.06 MiB
```
- **kicbase (Kubernetes in Container base)**: Kubernetes実行環境のベースイメージ
- **preloaded-images**: Kubernetes本体と基本コンポーネント
  - kube-apiserver (KubernetesのAPIサーバー)
  - kube-scheduler (Podのスケジューリング)
  - kube-controller-manager (各種コントローラー)
  - etcd (クラスタの状態を保存する分散KVS)
  - CoreDNS (クラスタ内DNS)
  - kube-proxy (ネットワークルーティング)

#### 3. 仮想マシン（コンテナ）作成
```
🔥  Creating docker container (CPUs=2, Memory=4000MB) ...
```
- Dockerコンテナとして仮想的なKubernetesノードを作成
- デフォルト割り当て:
  - **CPU**: 2コア
  - **メモリ**: 4GB
- このコンテナがKubernetesの「ノード」として機能する

#### 4. Kubernetesクラスタのセットアップ
```
🐳  Docker 28.4.0 で Kubernetes v1.34.0 を準備しています...
🔗  bridge CNI (コンテナーネットワークインターフェース) を設定中です...
```
- **コンテナランタイム**: Docker 28.4.0を初期化
  - Pod内のコンテナを実際に動かすのがコンテナランタイムの役割
- **CNI (Container Network Interface)**: Pod間のネットワーク通信を可能にする
  - bridge CNI: 基本的なネットワークブリッジ設定
  - Pod間通信、Service経由の通信を実現

#### 5. コンポーネントの検証と起動
```
��  Kubernetes コンポーネントを検証しています...
    ▪ gcr.io/k8s-minikube/storage-provisioner:v5 イメージを使用しています
🌟  有効なアドオン: storage-provisioner, default-storageclass
```
- Kubernetes必須コンポーネントが正常起動したか確認
  - kube-apiserver: 起動確認
  - etcd: データストア準備
  - scheduler, controller-manager: 起動確認
- **Minikubeアドオン**:
  - **storage-provisioner**: PersistentVolumeClaimを作成すると自動でPersistentVolumeを作成してくれる
  - **default-storageclass**: デフォルトのストレージクラス（標準のボリューム設定）

#### 6. kubectl設定
```
🏄  終了しました！kubectl がデフォルトで「minikube」クラスターと「default」ネームスペースを使用するよう設定されました
```
- `~/.kube/config`に接続情報を書き込み
  - クラスタのAPIサーバーのアドレス
  - 認証情報（証明書など）
  - コンテキスト（どのクラスタ・どのユーザー・どのnamespaceを使うか）
- これにより`kubectl`コマンドがminikubeクラスタを操作できるようになる

### 警告について

```
🧯  Docker はほとんどディスクがいっぱいで、デプロイが失敗する原因になりかねません！(容量の 93%)
💡  提案: docker system prune
```

ディスク容量が逼迫している状態（93%使用中）。Kubernetesイメージのダウンロードや、アプリケーションのデプロイに失敗する可能性がある。

**対処方法**:
```bash
# 使用していないDockerリソースをクリーンアップ
docker system prune -a

# または、Docker Desktopの設定でディスクサイズを増やす
# Docker icon > Preferences > Resources > Disk Image Size
```

### まとめ: minikube startの全体像

1. **環境準備**: システム情報を検出し、適切なドライバを選択
2. **イメージ取得**: Kubernetes実行に必要なイメージをダウンロード
3. **ノード作成**: Dockerコンテナとして仮想ノードを作成
4. **クラスタ構築**: Kubernetesの各コンポーネントを起動・設定
5. **ネットワーク設定**: Pod間通信のためのCNI設定
6. **kubectl連携**: ローカルのkubectlから操作できるよう設定

この後、`kubectl get nodes`などのコマンドで、作成されたKubernetesクラスタを操作できるようになります。

---

## Q3: Pod、Container、Deploymentの関係とアプリケーション構成

### 質問
フロントエンド（Next.js）とバックエンド（Java）を追加する場合、これらは1つのDeploymentに混在するのか？それとも別々のDeploymentを作るのか？Podとコンテナの関係についても理解を深めたい。

### 回答

#### 基本原則：アプリケーションごとにDeploymentを分ける

**❌ 間違い：1つのDeploymentにJavaとNext.jsを混在**
```
Deployment（バックエンド+フロント？）
  └─ Pod
       ├─ Javaコンテナ
       └─ Next.jsコンテナ
```

**✅ 正解：アプリケーションごとにDeploymentを分ける**
```
Deployment（バックエンド）          Deployment（フロントエンド）
  └─ Pod                            └─ Pod
       └─ Javaコンテナ                   └─ Next.jsコンテナ
```

#### なぜ分けるのか？

**1. 独立したライフサイクル**
- バックエンドだけアップデート → Javaの Deploymentだけ更新
- フロントだけスケール → Next.jsのreplicas を3に増やす
- バックエンドが落ちても → フロントエンドは動き続ける

**2. スケーリングの柔軟性**
```yaml
# バックエンドは負荷高いので3台
Deployment（backend）
  replicas: 3

# フロントは軽いので1台
Deployment（frontend）
  replicas: 1
```

**3. 責任の分離（マイクロサービス原則）**
- 1 Deployment = 1サービス（責務）
- Java = API提供
- Next.js = UI提供
- PostgreSQL = データ保存

#### 全体構成イメージ

```
Kubernetesクラスタ（minikube）
  │
  ├─ Deployment: backend-deployment
  │    └─ Pod（replicas: 2）
  │         └─ Container: todo-backend:latest (Java)
  │
  ├─ Deployment: frontend-deployment
  │    └─ Pod（replicas: 1）
  │         └─ Container: todo-frontend:latest (Next.js)
  │
  └─ Deployment: postgres-deployment
       └─ Pod（replicas: 1）
            └─ Container: postgres:15
```

各Podは **Service** という別のリソースで通信します（後述）。

#### リソースの階層構造

```
クラスタ
  └─ Deployment（同じ種類のPodを管理）
       └─ Pod（コンテナをまとめる最小単位）
            └─ Container（実際のアプリケーション）
```

**重要なポイント**:
- **通常は 1 Pod = 1 Container** で使う
- 1つのPodに複数コンテナを入れるのは特殊ケース（下記参照）

#### 例外：1つのPodに複数コンテナを入れるケース（サイドカーパターン）

これは稀ですが、以下のような場合に使います：

```yaml
Pod（サイドカーパターン）
  ├─ メインコンテナ（Javaアプリ）
  └─ サイドカーコンテナ（ログをクラウドに送信）
```

**条件**：
- 必ず一緒に動く必要がある
- 同じライフサイクル（一緒に起動・停止）
- ローカルホスト（localhost）で通信
- 同じボリュームを共有

**具体例**：
- メインアプリ + ログ収集（Fluentd）
- メインアプリ + プロキシ（Envoy）
- メインアプリ + 初期化処理（Init Container）

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

## Q5: Kubernetesの適用範囲とオーバーエンジニアリング

### 質問
結局、やりたいことは冗長構成を入れることなのか？基本的にDeploymentの下のPodは1つでいいのではないか？Podを複数レプリカで用意するのは、大規模なサービスや可用性を重視するサービス向けではないか？軽い1個のコンテナで動かせるようなものにKubernetesはオーバーエンジニアリングになりがちではないか？

### 理解度の確認

**✅ 正しく理解していること**

1. **冗長構成が主な目的の1つ**
   - `replicas: 3` → 同じPodが3台動く → 1台落ちても2台が稼働継続

2. **大規模・高可用性サービス向け**
   - Google、Netflix、Uberなどが本番利用
   - マイクロサービスが10個、100個あるような環境

3. **小規模アプリにはオーバーエンジニアリング**
   - シンプルなブログサイト1つ → Docker Composeで十分
   - 個人プロジェクト → Kubernetesは過剰

### 回答

#### 単一Pod（replicas: 1）でも価値がある場面

**1. 自動再起動・自己修復**
```
Pod が落ちる → Kubernetes が自動で再起動
コンテナがクラッシュ → 自動で立ち上げ直す
```
Docker単体だと手動でやる必要がある。

**2. 宣言的管理（Infrastructure as Code）**
```yaml
# 「あるべき姿」を宣言
replicas: 1
image: todo-backend:v2
```
- YAMLで状態を定義 → 環境が統一される
- Git管理 → インフラのバージョン管理

**3. ローリングアップデート**
```bash
# v1 → v2 へ無停止更新
kubectl set image deployment/backend todo-backend=todo-backend:v2
```
- 1台ずつ順番に入れ替え
- ダウンタイムなし（replicas: 1でも新旧並行稼働の瞬間がある）

**4. 環境の統一**
- 開発環境（minikube）
- ステージング（クラウドKubernetes）
- 本番（同じYAMLで動く）

#### Kubernetesが真価を発揮する場面

**✅ 向いている場面**
- **複数のマイクロサービス**（フロント+バック+DB）
- **スケーラビリティ重視**（トラフィック増加時に自動スケール）
- **高可用性必須**（24/365稼働、ダウンタイム許されない）
- **複雑なデプロイ要件**（カナリアリリース、Blue-Greenデプロイ）
- **マルチクラウド戦略**（AWS/GCP/Azureどれでも動く）

**❌ オーバーエンジニアリング**
- **静的サイト**（Netlify/Vercelで十分）
- **シンプルなWebアプリ1つ**（Docker Composeが楽）
- **個人プロジェクト**（学習目的以外）
- **小規模スタートアップ初期**（まず動かすことが優先）

#### 技術選択の指針

```
シンプル                                    複雑
  │                                          │
  ├─ Docker単体（1コンテナ）
  │    例: シンプルなAPI、バッチ処理
  │
  ├─ Docker Compose（数個のコンテナ）
  │    例: 小規模Webアプリ（フロント+バック+DB）
  │
  ├─ Kubernetes（マイクロサービス、本番環境）
  │    例: 複数サービス、スケーリング必須
  │
  └─ Kubernetes + Service Mesh（超大規模）
       例: 数百のマイクロサービス、複雑なトラフィック制御
```

#### 今回のTODOアプリでの学習価値

**現実的には「オーバーエンジニアリング」だが、学習には最適**：
- フロント + バック + DB → 複数サービスの連携学習
- 本番環境を想定した構成を体験
- 将来大規模サービスを作る時のベースになる
- 小さく始めて、必要になったらスケールできる設計を学ぶ

#### まとめ

**Kubernetesを選ぶべきか？** の判断基準：
1. サービスが複数に分かれているか？
2. 高可用性が必須か？（少しのダウンタイムも許されない）
3. 将来的にスケールする可能性があるか？
4. 複数環境（開発/ステージング/本番）で同じ構成を使いたいか？

→ **YES が多い → Kubernetes**
→ **NO が多い → Docker Compose で十分**

**学習者の洞察（重要）**：
「軽い1個のコンテナで動かせるものにKubernetesはオーバーエンジニアリングになりがち」という理解は非常に正確。実務では、**必要になってから導入する**のが賢明。ただし、学習目的では小規模構成でも価値がある。

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

## 次のステップ

- [x] TODOアプリのDockerイメージを準備
- [x] 最初のDeploymentマニフェストを作成
- [ ] Backend用ClusterIP Serviceを作成
- [ ] PostgreSQL Deployment + Serviceを作成
- [ ] バックエンド設定をPostgreSQL接続に変更
- [ ] 動作確認
