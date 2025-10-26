# ルートB: Docker経験者向け（最低限パターン・6週間）

Dockerの知識を前提に、Kubernetesの**実務で最低限必要なスキル**を習得する6週間プログラム

---

## 最低限 vs 最大パターン

| 項目 | 最低限（6週） | 最大（8週） |
|---|---|---|
| **到達目標** | 基礎固め、実務で使える | 本番運用レベル |
| **Pod/Service/Ingress** | ✅ | ✅ |
| **ConfigMap/Secret** | ✅ | ✅ |
| **Helm** | ✅ | ✅ |
| **ヘルスチェック** | ❌ | ✅ |
| **デプロイ戦略** | ❌ | ✅ |
| **HPA** | ❌ | ✅ |
| **マイクロサービス** | ❌ | ✅ |

**このパターンが向いている人**:
- まず基礎を確実に固めたい
- 週の学習時間が10時間以下
- 業務でシンプルなK8sデプロイができればOK

---

## 全体構成

```mermaid
graph LR
    A[Week 1<br/>基礎] --> B[Week 2<br/>Service]
    B --> C[Week 3<br/>Ingress]
    C --> D[Week 4<br/>Config管理]
    D --> E[Week 5<br/>Helm基礎]
    E --> F[Week 6<br/>Helm実践]

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff4e6
    style D fill:#fff4e6
    style E fill:#f3e5f5
    style F fill:#f3e5f5
```

---

## Week 1: 環境構築 + Pod/Deployment

### 今週の目標

- minikubeでクラスタを起動できる
- Pod/Deploymentの違いを理解する
- YAMLマニフェストが書ける

### システム構成

```mermaid
graph TB
    subgraph "Kubernetesクラスタ（minikube）"
        D[Deployment<br/>backend<br/>replicas: 2]
        D --> P1[Pod 1<br/>todo-backend]
        D --> P2[Pod 2<br/>todo-backend]
    end

    D -.自動回復.-> P1
    D -.自動回復.-> P2

    style D fill:#90caf9
    style P1 fill:#c8e6c9
    style P2 fill:#c8e6c9
```

### 課題

既存のlocalhostで動くアプリをDocker化。そしてDockerアプリ（バックエンド1つ）をKubernetesにデプロイ

**成果物**:
- [ ] minikube起動
- [ ] `backend-deployment.yaml`作成
- [ ] `kubectl apply -f`でデプロイ
- [ ] `kubectl get pods`で確認
- [ ] Podを削除して自動再起動を確認

**deployment.yaml雛形**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-backend:latest
        imagePullPolicy: Never  # minikube用
        ports:
        - containerPort: 8080
```

### セッションで話すこと

- DockerとKubernetesの違い
- Podとは何か
- Deploymentの役割（自動回復、レプリカ管理）
- YAMLの基本構造

### 確認ポイント

- ✅ minikubeが起動できるか
- ✅ YAMLが書けるか
- ✅ Podのライフサイクルを理解しているか

---

## Week 2: Service

### 今週の目標

- Serviceの役割を理解する
- ClusterIP/NodePortの違いを知る
- Pod間通信ができる

### Service種類（シンプル版）

```mermaid
graph TB
    subgraph "Kubernetes"
        subgraph "ClusterIP（内部通信）"
            S1[Service<br/>backend-service<br/>ClusterIP]
            S1 --> P1[Pod 1]
            S1 --> P2[Pod 2]
        end

        subgraph "NodePort（開発環境）"
            S2[Service<br/>frontend-service<br/>NodePort 30080]
            S2 --> P3[Pod 3]
        end
    end

    User[User] -->|localhost:30080| S2
    P3 -->|backend-service:8080| S1

    style S1 fill:#90caf9
    style S2 fill:#ffcc80
```

### 課題

フロントエンド + バックエンドの2層構成

**成果物**:
- [ ] frontend-deployment.yaml + service.yaml（NodePort）
- [ ] backend-deployment.yaml + service.yaml（ClusterIP）
- [ ] Pod間通信成功（frontend → backend）
- [ ] ブラウザで`localhost:30080`アクセス

**service.yaml例**:
```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080

# frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30080
```

### セッションで話すこと

- Serviceの役割（ロードバランサー、DNS）
- ClusterIP vs NodePort
- DNS名でのPod間通信
- ラベルセレクタの仕組み

### 確認ポイント

- ✅ Service YAMLが書けるか
- ✅ Pod間通信ができるか
- ✅ DNS名を理解しているか

---

## Week 3: Ingress

### 今週の目標

- Ingressの役割を理解する
- パスベースルーティングができる
- 1つのURLで全体にアクセスできる

### Ingress構成

```mermaid
graph TB
    User[User<br/>localhost:8080] -->|/| IG[Ingress]
    User -->|/api| IG

    IG -->|/| FS[frontend-service]
    IG -->|/api| BS[backend-service]

    FS --> FP[Frontend Pods]
    BS --> BP[Backend Pods]

    style IG fill:#ce93d8
    style FS fill:#90caf9
    style BS fill:#ffcc80
```

### 課題

Ingressでパスベースルーティング

**成果物**:
- [ ] Ingress Controller有効化（`minikube addons enable ingress`）
- [ ] `ingress.yaml`作成
- [ ] `/` → frontend
- [ ] `/api` → backend
- [ ] `kubectl port-forward`でアクセス確認

**ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

### セッションで話すこと

- Ingress Controllerとは
- パスベースルーティング
- **本番ではLoadBalancerを使う**（minikubeでは疑似的）
- 今後の発展（TLS、認証）

### 確認ポイント

- ✅ Ingressが設定できるか
- ✅ パスルーティングを理解しているか
- ✅ 本番との違いを知っているか

---

## Week 4: ConfigMap/Secret + PostgreSQL

### 今週の目標

- 設定と機密情報を分離できる
- データベースを追加できる
- 環境変数の扱いを学ぶ

### 3層構成

```mermaid
graph TB
    subgraph "Application"
        FE[Frontend] --> BE[Backend]
        BE --> DB[(PostgreSQL)]
    end

    subgraph "設定管理"
        CM[ConfigMap<br/>API_URL]
        SE[Secret<br/>DB_PASSWORD]
    end

    CM -.環境変数.-> FE
    SE -.環境変数.-> BE

    style CM fill:#90caf9
    style SE fill:#ffccbc
    style DB fill:#c8e6c9
```

### 課題

PostgreSQL追加 + 設定外部化

**成果物**:
- [ ] postgres-deployment.yaml + service.yaml
- [ ] postgres-secret.yaml（DB認証情報）
- [ ] バックエンドの環境変数をConfigMap/Secretから注入
- [ ] フロントエンド → バックエンド → DB の疎通確認

**secret.yaml例**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_USER: todouser
  POSTGRES_PASSWORD: todopass
  POSTGRES_DB: tododb
```

**Deploymentでの使用例**:
```yaml
env:
- name: POSTGRES_PASSWORD
  valueFrom:
    secretKeyRef:
      name: postgres-secret
      key: POSTGRES_PASSWORD
```

### セッションで話すこと

- ConfigMapとSecretの違い
- 環境変数 vs ボリュームマウント
- **本番ではSecretを暗号化** (Sealed Secrets, Vault)
- 12-factor app（設定の外部化）

### 確認ポイント

- ✅ ConfigMap/Secretが作成できるか
- ✅ 機密情報の扱いを理解しているか
- ✅ 3層構成が動作するか

---

## Week 5: Helm基礎

### 今週の目標

- Helmの必要性を理解する
- 既存YAMLをHelmチャート化できる
- values.yamlで値を管理できる

### Helm構成

```mermaid
graph TB
    subgraph "Helmチャート"
        C[Chart.yaml]
        V[values.yaml]
        T[templates/<br/>7個のYAML]
    end

    subgraph "デプロイ"
        H[helm install]
    end

    subgraph "Kubernetes"
        K[マニフェスト適用]
    end

    C --> H
    V --> H
    T --> H
    H --> K

    style C fill:#ce93d8
    style V fill:#90caf9
    style T fill:#ffcc80
    style K fill:#c8e6c9
```

### 課題

Week 4のアプリをHelmチャート化

**成果物**:
- [ ] `helm create todo-app-chart`
- [ ] 既存の7個のYAMLをtemplates/にコピー
- [ ] `Chart.yaml`編集
- [ ] `values.yaml`作成（最低限）
- [ ] `helm install todo-app ./todo-app-chart`成功

**最低限のvalues.yaml**:
```yaml
backend:
  image:
    repository: todo-backend
    tag: latest
  replicas: 2

frontend:
  image:
    repository: todo-frontend
    tag: latest
  replicas: 1

postgres:
  enabled: true
```

### セッションで話すこと

- なぜHelmが必要か（DRY、バージョン管理）
- Chart/Values/Templateの関係
- **次週でテンプレート化を進める**

### 確認ポイント

- ✅ Helmの必要性を理解しているか
- ✅ チャートが作成できるか
- ✅ helm installができるか

---

## Week 6: Helm実践 + 総まとめ

### 今週の目標

- YAMLをテンプレート化できる
- 値を一元管理できる
- 自走してKubernetesアプリをデプロイできる

### テンプレート化

```mermaid
graph LR
    subgraph "Before（Week 5）"
        Y1[backend-deployment.yaml<br/>replicas: 2<br/>image: todo-backend:latest]
    end

    subgraph "After（Week 6）"
        T1[backend-deployment.yaml<br/>replicas: {{ .Values.backend.replicas }}<br/>image: {{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}]
        V1[values.yaml<br/>backend:<br/>  replicas: 2<br/>  image:<br/>    repository: todo-backend<br/>    tag: latest]
    end

    Y1 -.テンプレート化.-> T1
    V1 --> T1

    style Y1 fill:#ffccbc
    style T1 fill:#c8e6c9
    style V1 fill:#90caf9
```

### 課題

Week 5のチャートをテンプレート化 + 総合課題

**成果物**:
- [ ] 主要な値を`{{ .Values.xxx }}`に置き換え
  - replicas
  - image repository/tag
  - service ports
- [ ] `helm upgrade`でアップグレード成功
- [ ] `helm rollback`でロールバック成功
- [ ] GitHubリポジトリ作成
- [ ] README.md作成（セットアップ手順）

**テンプレート化の例**:
```yaml
# templates/backend-deployment.yaml
spec:
  replicas: {{ .Values.backend.replicas }}
  template:
    spec:
      containers:
      - name: backend
        image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        ports:
        - containerPort: {{ .Values.backend.service.port }}
```

### セッションで話すこと

- Go Templateの基本構文
- `helm upgrade`と`helm rollback`
- **6週間の振り返り**
- 次のステップ（選択肢）

### 確認ポイント

- ✅ テンプレート化ができるか
- ✅ helm upgrade/rollbackができるか
- ✅ 基礎が身についているか

---

## 修了後の選択肢

### Week 6修了時点でできること

```mermaid
graph LR
    subgraph "✅ Week 6修了時点"
        A1[基本的なデプロイ<br/>Pod/Service/Ingress]
        A2[3層アプリ構築<br/>Frontend/Backend/DB]
        A3[設定の外部化<br/>ConfigMap/Secret]
        A4[Helmでの管理<br/>インストール/アップグレード]
    end

    style A1 fill:#a5d6a7,stroke:#43a047,color:#000
    style A2 fill:#a5d6a7,stroke:#43a047,color:#000
    style A3 fill:#a5d6a7,stroke:#43a047,color:#000
    style A4 fill:#a5d6a7,stroke:#43a047,color:#000
```

### 実務適用するとぶつかる壁

```mermaid
flowchart TB
    Start[Week 6修了<br/>基本デプロイ成功] --> Wall1{実務で使おうとすると...}

    Wall1 -->|壁1| P1[アプリが落ちても<br/>自動復旧しない]
    Wall1 -->|壁2| P2[デプロイが手動で<br/>時間がかかる]
    Wall1 -->|壁3| P3[アプリが落ちたことに<br/>気づかない]
    Wall1 -->|壁4| P4[アクセス急増で<br/>パンクする]

    P1 --> S1[解決策:<br/>ヘルスチェック]
    P2 --> S2[解決策:<br/>CI/CD]
    P3 --> S3[解決策:<br/>監視・ロギング]
    P4 --> S4[解決策:<br/>オートスケーリング]

    S1 --> Level{学習の優先度}
    S2 --> Level
    S3 --> Level
    S4 --> Level

    Level -->|必須| L1[Week 7-8<br/>ヘルスチェック+リソース制限]
    Level -->|推奨| L2[+2週<br/>CI/CD or 監視]
    Level -->|応用| L3[+2週<br/>HPA/マイクロサービス]

    style P1 fill:#e57373,stroke:#d32f2f,color:#000
    style P2 fill:#e57373,stroke:#d32f2f,color:#000
    style P3 fill:#e57373,stroke:#d32f2f,color:#000
    style P4 fill:#e57373,stroke:#d32f2f,color:#000
    style S1 fill:#ffb74d,stroke:#f57c00,color:#000
    style S2 fill:#ffb74d,stroke:#f57c00,color:#000
    style S3 fill:#ffb74d,stroke:#f57c00,color:#000
    style S4 fill:#ffb74d,stroke:#f57c00,color:#000
    style L1 fill:#81d4fa,stroke:#1976d2,color:#000
    style L2 fill:#ce93d8,stroke:#8e24aa,color:#000
    style L3 fill:#ffcc80,stroke:#f57c00,color:#000
```

### 推奨学習パス

#### パターンA: 実務ですぐ使う（推奨）

```mermaid
gantt
    title 実務適用パターン
    dateFormat YYYY-MM-DD
    section 必須追加学習
    ヘルスチェック習得     :a1, 2025-01-06, 1w
    リソース制限設定       :a2, after a1, 1w
    section 実務適用
    既存アプリK8s化        :b1, after a2, 2w
    本番デプロイ           :b2, after b1, 1w
    section 運用改善
    CI/CD導入（任意）      :c1, after b2, 2w
    監視導入（任意）       :c2, after c1, 2w
```

**Week 7（追加学習1週目）**:
- **課題**: TODOアプリにヘルスチェック追加
- **学ぶこと**: Liveness/Readiness Probe、再起動ポリシー
- **成果**: アプリが自動復旧するようになる

**Week 8（追加学習2週目）**:
- **課題**: リソース制限を設定
- **学ぶこと**: requests/limits、OOMKiller
- **成果**: リソース枯渇を防げる

**Week 9〜（実務適用）**:
- 業務の既存アプリをKubernetes化
- 学んだことを実践
- 詰まったら都度学習

**期間**: 2週間の追加学習 + 実務適用1〜2ヶ月

---

#### パターンB: 最大パターン完走（体系的に学びたい人向け）

[Week 7-8の詳細は最大パターンを参照](./route-b-docker-experienced.md#phase-3-応用week-7-8)

**Week 7: 本番運用の基礎**
- ヘルスチェック（Liveness/Readiness Probe）
- リソース制限（requests/limits）
- ローリングアップデート戦略

**Week 8: 総合課題**
- HPA（オートスケーリング）
- マイクロサービス構築
- Helmでの環境別管理（dev/stg/prod）

**こんな人におすすめ**:
- 体系的に学びたい
- 週15〜20時間の学習時間が取れる
- 実務適用前に一通りマスターしたい

**期間**: +2週間

---

#### パターンC: 特定領域を深掘り（興味に応じて）

##### C-1: CI/CDを構築したい

**やること**:
1. GitHub Actions導入（1週目）
   - Dockerイメージのビルド・プッシュ
   - テスト自動化
2. ArgoCD導入（2週目）
   - GitOpsフロー構築
   - 自動デプロイ

**ゴール**: コードをpushしたら自動でKubernetesにデプロイされる

**期間**: 2〜3週間

##### C-2: 監視・ロギングを構築したい

**やること**:
1. Prometheus + Grafana導入（1〜2週目）
   - メトリクス収集
   - ダッシュボード作成
   - アラート設定
2. ログ収集（2〜3週目）
   - Loki or ELK Stack導入
   - ログ可視化

**ゴール**: アプリの状態を可視化し、障害に気づける

**期間**: 2〜3週間

---

### 迷ったら？ 推奨フロー

```mermaid
flowchart TD
    Start[Week 6修了] --> Q1{すぐ実務で<br/>使う予定は？}

    Q1 -->|はい| A1[パターンA<br/>必須追加学習2週間]
    Q1 -->|いいえ| Q2{週15時間以上<br/>学習時間ある？}

    Q2 -->|はい| B1[パターンB<br/>最大パターン完走]
    Q2 -->|いいえ| Q3{特に興味ある<br/>分野は？}

    Q3 -->|CI/CD| C1[パターンC-1<br/>GitOps構築]
    Q3 -->|監視| C2[パターンC-2<br/>Observability]
    Q3 -->|なし| A1

    A1 --> End1[本番運用レベル達成]
    B1 --> End1
    C1 --> End2[専門性獲得]
    C2 --> End2

    style A1 fill:#81d4fa,stroke:#1976d2,color:#000
    style B1 fill:#ffcc80,stroke:#f57c00,color:#000
    style C1 fill:#ce93d8,stroke:#8e24aa,color:#000
    style C2 fill:#ce93d8,stroke:#8e24aa,color:#000
    style End1 fill:#a5d6a7,stroke:#43a047,color:#000
    style End2 fill:#a5d6a7,stroke:#43a047,color:#000
```

**結論**: 迷ったら**パターンA（実務適用）**推奨。ヘルスチェックとリソース制限だけ追加学習して、あとは実務で学ぶのが最も効率的。

---

## 最低限パターンで到達できるレベル

### ✅ できること

- Kubernetesの基本リソース（Pod/Deployment/Service/Ingress）が使える
- YAMLマニフェストが書ける
- Helmチャートが作成・管理できる
- 3層アプリケーションがデプロイできる
- 設定を外部化できる

### ⚠️ まだできないこと

- 本番運用レベルの設定（ヘルスチェック、リソース制限）
- デプロイ戦略（Blue/Green、Canary）
- オートスケーリング
- 監視・ロギング
- CI/CDパイプライン

### 💡 実務で困らないために

最低限パターン修了後、**実務で使う前に**以下を追加学習推奨：

1. **ヘルスチェック**（必須）
   - Liveness/Readiness Probe
   - 自動回復の仕組み

2. **リソース制限**（必須）
   - requests/limits
   - OOMKillerを避ける

3. **Secret管理**（本番なら必須）
   - Sealed Secrets or Vault
   - 平文Secretは危険

---

## 最低限 vs 最大の比較表

| 項目 | 最低限（6週） | 最大（8週） |
|---|---|---|
| **学習時間/週** | 5~10時間 | 15~20時間 |
| **到達レベル** | 基礎固め | 本番運用可能 |
| **Pod/Service/Ingress** | ✅ | ✅ |
| **ConfigMap/Secret** | ✅ | ✅ |
| **Helm** | ✅ 基礎 | ✅ 実践 |
| **ヘルスチェック** | ❌ | ✅ |
| **リソース制限** | ❌ | ✅ |
| **デプロイ戦略** | ❌ | ✅ |
| **HPA** | ❌ | ✅ |
| **総合課題** | シンプルアプリ | マイクロサービス |
| **実務適用** | 基本的なデプロイ | 本番運用 |

---

## よくある質問

**Q: 最低限パターンで実務は大丈夫？**

A: シンプルなアプリなら大丈夫。ただし、**本番運用前にヘルスチェックとリソース制限は必須**。

**Q: 途中から最大パターンに切り替えられる？**

A: 可能。Week 6修了後、Week 7-8を追加すればOK。

**Q: 6週間で終わらなかったら？**

A: 無理に進めず、理解を優先。Week 4-6を2週ずつにしてもOK（8週間に延長）。

**Q: minikubeだけで十分？**

A: 学習には十分。本番はEKS/GKE/AKSを使うが、基本は同じ。

---
