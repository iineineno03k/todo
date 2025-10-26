[[README.md](./README.md) に戻る]

# Helmの導入

## なぜHelmが必要になるのか

### 現在の構成での問題点

現在、以下の7つのYAMLファイルを管理しています：

```
k8s/
├── backend-deployment.yaml
├── backend-service.yaml
├── frontend-deployment.yaml
├── frontend-service.yaml
├── postgres-deployment.yaml
├── postgres-service.yaml
└── ingress.yaml
```

**これで動いているが、実務では以下の問題が発生する：**

---

### 問題1: 環境ごとに設定が異なる

例えば、本番環境と開発環境で以下が違う：

| 項目 | 開発環境 | 本番環境 |
|---|---|---|
| **replicas** | 1 | 3-5 |
| **image tag** | latest | v1.2.3（固定） |
| **resources** | 制限なし | CPU/メモリ制限あり |
| **ingress host** | localhost | example.com |
| **DB password** | 平文 | Secret使用 |

**現在の方法だと**:
```bash
# 開発環境用と本番環境用で別々のYAMLを用意
k8s-dev/
  ├── backend-deployment.yaml  # replicas: 1
  └── ...

k8s-prod/
  ├── backend-deployment.yaml  # replicas: 3
  └── ...
```

→ **ファイルが2倍、3倍に増える**（staging環境も含めると3倍）

---

### 問題2: 値の変更が大変

例えば、イメージのバージョンを v1.2.3 → v1.2.4 に上げる場合：

**現在の方法**:
```yaml
# backend-deployment.yaml を編集
spec:
  containers:
  - image: todo-backend:v1.2.3  # ← ここを手動で v1.2.4 に変更
```

**複数ファイルで同じ作業**:
- frontend-deployment.yaml
- backend-deployment.yaml
- （同じイメージタグが複数箇所に散在）

→ **変更漏れのリスク**

---

### 問題3: デプロイコマンドが多い

```bash
# 7個のファイルを個別に適用
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

または：
```bash
kubectl apply -f k8s/  # 全部まとめて適用
```

**問題点**:
- 順序制御ができない（PostgreSQLが起動する前にバックエンドが起動してエラー）
- 一部だけ更新したい時に面倒
- ロールバックが手動

---

### 問題4: 再利用が困難

同じようなTODOアプリを別プロジェクトで使いたい場合：

1. k8s/ ディレクトリをコピー
2. 全ファイルを開いて名前を変更（todo-app → another-app）
3. Service名、ラベルなどを全部置換

→ **手作業でミスしやすい**

---

## Helmがこれらを解決する

### 解決策1: テンプレート化（環境差異を吸収）

**values-dev.yaml（開発環境）**:
```yaml
backend:
  replicas: 1
  image:
    tag: latest
  resources: {}

ingress:
  host: localhost
```

**values-prod.yaml（本番環境）**:
```yaml
backend:
  replicas: 3
  image:
    tag: v1.2.3
  resources:
    limits:
      cpu: 500m
      memory: 512Mi

ingress:
  host: example.com
```

**デプロイ**:
```bash
# 開発環境
helm install todo-app ./chart -f values-dev.yaml

# 本番環境
helm install todo-app ./chart -f values-prod.yaml
```

→ **1つのチャートで全環境に対応**

---

### 解決策2: 値の一元管理

**values.yaml**:
```yaml
version: v1.2.4  # ← ここだけ変更すればOK

backend:
  image:
    repository: todo-backend
    tag: "{{ .Values.version }}"

frontend:
  image:
    repository: todo-frontend
    tag: "{{ .Values.version }}"
```

または、デプロイ時に上書き:
```bash
helm upgrade todo-app ./chart --set version=v1.2.4
```

→ **1箇所の変更で全体に反映**

---

### 解決策3: 1コマンドデプロイ

```bash
# インストール
helm install todo-app ./chart

# アップグレード
helm upgrade todo-app ./chart --set backend.tag=v2.0.0

# ロールバック
helm rollback todo-app 1

# アンインストール
helm uninstall todo-app
```

→ **デプロイ、更新、ロールバックが簡単**

---

### 解決策4: パッケージ化して再利用

```bash
# チャートをパッケージ化
helm package ./todo-app-chart
# → todo-app-chart-1.0.0.tgz

# 別のクラスタで使う
helm install my-todo todo-app-chart-1.0.0.tgz

# Helm Repositoryで共有
helm repo add myrepo https://charts.example.com
helm install todo-app myrepo/todo-app
```

→ **チーム全体で標準化されたデプロイ**

---

## Helm学習のステップ

### Step 1: Helmの基本概念を理解

| 用語 | 説明 | 例 |
|---|---|---|
| **Chart** | Kubernetesアプリケーションのパッケージ | `todo-app-chart/` |
| **Values** | チャートに渡すパラメータ | `values.yaml` |
| **Template** | YAMLのテンプレート（Go Template） | `{{ .Values.backend.replicas }}` |
| **Release** | インストールされたチャートのインスタンス | `helm install my-app ./chart` の `my-app` |
| **Repository** | チャートを配布する場所 | `helm repo add bitnami ...` |

---

### Step 2: Helmのインストール

**macOS**:
```bash
brew install helm
```

**バージョン確認**:
```bash
helm version
# version.BuildInfo{Version:"v3.xx.x", ...}
```

---

### Step 3: チャートの構造を理解

```
todo-app-chart/
├── Chart.yaml           # チャートのメタ情報
├── values.yaml          # デフォルト値
├── values-dev.yaml      # 開発環境用の値
├── values-prod.yaml     # 本番環境用の値
├── templates/           # YAMLテンプレート
│   ├── _helpers.tpl     # 再利用可能な関数
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   └── ingress.yaml
└── charts/              # 依存チャート（今回は空）
```

---

### Step 4: Chart.yaml を作成

```yaml
apiVersion: v2
name: todo-app
description: A Helm chart for TODO application
type: application
version: 1.0.0  # チャートのバージョン
appVersion: "1.0"  # アプリケーションのバージョン
```

**重要なフィールド**:
- `version`: チャート自体のバージョン（変更するたび上げる）
- `appVersion`: デプロイするアプリのバージョン

---

### Step 5: values.yaml を作成

```yaml
# デフォルト値（開発環境向け）
replicaCount: 1

backend:
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: Never  # minikube用
  service:
    type: ClusterIP
    port: 8080

frontend:
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never
  service:
    type: NodePort
    port: 3000
    nodePort: 30080

postgres:
  enabled: true
  image:
    repository: postgres
    tag: 15-alpine
  auth:
    database: tododb
    username: todouser
    password: todopass  # 本番ではSecretを使う
  service:
    port: 5432

ingress:
  enabled: true
  className: nginx
  host: localhost
```

---

### Step 6: テンプレート化（例：backend-deployment.yaml）

**元のYAML**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
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
        ports:
        - containerPort: 8080
```

**Helmテンプレート化**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "todo-app.fullname" . }}-backend
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
    app.kubernetes.io/component: backend
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: {{ include "todo-app.name" . }}
      app.kubernetes.io/component: backend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: {{ include "todo-app.name" . }}
        app.kubernetes.io/component: backend
    spec:
      containers:
      - name: todo-backend
        image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
        ports:
        - containerPort: {{ .Values.backend.service.port }}
```

**ポイント**:
- `{{ .Values.xxx }}` で値を参照
- `{{ include "関数名" . }}` でヘルパー関数を呼び出し
- `{{- ... | nindent 4 }}` でインデント調整

---

### Step 7: _helpers.tpl を作成（共通関数）

```yaml
{{/*
アプリ名を生成
*/}}
{{- define "todo-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
フルネームを生成（Release名 + Chart名）
*/}}
{{- define "todo-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
共通ラベル
*/}}
{{- define "todo-app.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "todo-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

---

### Step 8: 環境別の values.yaml を作成

**values-dev.yaml**:
```yaml
replicaCount: 1

backend:
  image:
    tag: latest
    pullPolicy: Never
  resources: {}

frontend:
  image:
    tag: latest
    pullPolicy: Never

ingress:
  host: localhost
```

**values-prod.yaml**:
```yaml
replicaCount: 3

backend:
  image:
    tag: v1.2.3
    pullPolicy: IfNotPresent
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi

frontend:
  image:
    tag: v1.2.3
    pullPolicy: IfNotPresent
  resources:
    limits:
      cpu: 200m
      memory: 256Mi

ingress:
  host: example.com
  tls:
    enabled: true
    secretName: todo-app-tls
```

---

## 実習: 現在のYAMLをHelmチャート化

### ステップ1: チャートの雛形を作成

```bash
cd /Users/mynameis/Documents/Cursor/sample

# Helmチャートの雛形を生成
helm create todo-app-chart

# 不要なファイルを削除
cd todo-app-chart
rm -rf templates/*  # デフォルトのテンプレートを削除
```

### ステップ2: Chart.yaml を編集

```yaml
apiVersion: v2
name: todo-app
description: A Helm chart for TODO application with Next.js frontend, Java backend, and PostgreSQL
type: application
version: 1.0.0
appVersion: "1.0"
```

### ステップ3: 既存のYAMLをtemplates/にコピー

```bash
# 既存のYAMLをコピー
cp ../k8s/*.yaml templates/
```

### ステップ4: 1つずつテンプレート化

**優先順位**:
1. まず動かす（コピーしただけの状態で helm install）
2. 変数化したい部分を特定（replicas, image tag など）
3. 段階的にテンプレート化

**最初のステップ**（そのままコピーで動作確認）:
```bash
helm install todo-app ./todo-app-chart --dry-run --debug
# エラーがなければOK

helm install todo-app ./todo-app-chart
kubectl get pods
```

**次のステップ**（image tagを変数化）:
```yaml
# templates/backend-deployment.yaml
spec:
  containers:
  - image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
```

```yaml
# values.yaml
backend:
  image:
    repository: todo-backend
    tag: latest
```

---

## よく使うHelmコマンド

```bash
# チャートの文法チェック
helm lint ./todo-app-chart

# 実際に適用される内容を確認（dry-run）
helm install todo-app ./todo-app-chart --dry-run --debug

# インストール
helm install todo-app ./todo-app-chart

# インストール済みのリリース一覧
helm list

# アップグレード
helm upgrade todo-app ./todo-app-chart

# 値を上書きしてアップグレード
helm upgrade todo-app ./todo-app-chart --set backend.image.tag=v2.0.0

# 環境別の values.yaml を使う
helm upgrade todo-app ./todo-app-chart -f values-prod.yaml

# ロールバック
helm rollback todo-app 1

# リリースの履歴
helm history todo-app

# アンインストール
helm uninstall todo-app

# テンプレートの展開結果を確認
helm template todo-app ./todo-app-chart
```

---

## Helmチャート化のメリット（まとめ）

| 項目 | 素のYAML | Helm |
|---|---|---|
| **ファイル数** | 環境ごとに7個×N環境 | 1チャート + N個のvalues.yaml |
| **値の変更** | 全YAMLを手動編集 | values.yamlの1箇所を変更 |
| **デプロイ** | kubectl apply -f を7回 | helm install 1回 |
| **環境切り替え** | ディレクトリごと分ける | values-xxx.yaml で切り替え |
| **バージョン管理** | Git | Helm Release（自動） |
| **ロールバック** | 手動で前のYAMLを適用 | helm rollback |
| **再利用** | コピー&置換 | helm package |

---

## 次のステップ

1. [ ] Helmをインストール
2. [ ] `helm create` でチャートの雛形を作成
3. [ ] 既存のYAMLをtemplates/にコピー
4. [ ] Chart.yamlとvalues.yamlを編集
5. [ ] `helm install --dry-run` で動作確認
6. [ ] 1つずつテンプレート化（image tag → replicas → resources）
7. [ ] values-dev.yaml と values-prod.yaml を作成
8. [ ] 環境ごとにデプロイして動作確認

**学習のポイント**:
- 最初から完璧なテンプレートを作らない
- 「動く→変数化→拡張」の順で段階的に進める
- `helm template` でレンダリング結果を常に確認

---

## 参考リンク

- [Helm公式ドキュメント](https://helm.sh/docs/)
- [Helm Charts Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Artifact Hub（公式チャート検索）](https://artifacthub.io/)
