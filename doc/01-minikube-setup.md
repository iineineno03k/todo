[[README.md](./README.md) に戻る]

# Minikubeのセットアップ

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
  Darwin 15.5 (arm64) 上の minikube v1.37.0
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
  Kubernetes コンポーネントを検証しています...
    ▪ gcr.io/k8s-minikube/storage-provisioner:v5 イメージを使用しています
🌟  有効なアドオン: storage-provisioner, default-storageclass
🏄  終了しました！kubectl がデフォルトで「minikube」クラスターと「default」ネームスペースを使用するよう設定されました
```

### 回答: 各ステップの解説

#### 1. 環境検出
```
  Darwin 15.5 (arm64) 上の minikube v1.37.0
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
  Kubernetes コンポーネントを検証しています...
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
