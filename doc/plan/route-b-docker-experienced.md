# ルートB: Docker経験者向け（8週間）

Dockerの知識を前提に、Kubernetesの実践的な運用スキルを習得する8週間プログラム

---

## 全体構成

```mermaid
graph LR
    A[Phase 1<br/>K8s基礎<br/>3週間] --> B[Phase 2<br/>実践<br/>3週間]
    B --> C[Phase 3<br/>応用<br/>2週間]

    A --> A1[Week 1: 基礎]
    A --> A2[Week 2: Service]
    A --> A3[Week 3: Config管理]

    B --> B1[Week 4: Helm]
    B --> B2[Week 5: ヘルスチェック]
    B --> B3[Week 6: Deploy戦略]

    C --> C1[Week 7: HPA]
    C --> C2[Week 8: 総合課題]

    style A fill:#4fc3f7,stroke:#0288d1,color:#000
    style B fill:#ffb74d,stroke:#f57c00,color:#000
    style C fill:#ce93d8,stroke:#8e24aa,color:#000
```

---

## Phase 1: Kubernetes基礎（Week 1-3）

### Week 1: 環境構築 + Pod/Deployment

#### 今週の目標

- DockerとKubernetesの違いを理解する
- Kubernetesの基本リソースが使える
- 既存Dockerアプリを移行できる

#### Docker vs Kubernetes

```mermaid
graph TB
    subgraph "Docker Compose"
        DC[docker-compose.yml]
        DC --> C1[Container 1]
        DC --> C2[Container 2]
        DC --> C3[Container 3]

        L1[限界1: 単一ホスト]
        L2[限界2: 手動スケール]
        L3[限界3: 自動回復なし]
    end

    subgraph "Kubernetes"
        K8S[Kubernetes Cluster]
        K8S --> D1[Deployment 1<br/>複数Pod]
        K8S --> D2[Deployment 2<br/>複数Pod]
        K8S --> D3[Deployment 3<br/>複数Pod]

        A1[✅ 複数ホスト対応]
        A2[✅ 自動スケール]
        A3[✅ 自動回復]
    end

    style DC fill:#ff8a65,stroke:#e64a19,color:#000
    style K8S fill:#a5d6a7,stroke:#43a047,color:#000
```

#### 課題

既存のDocker Composeアプリ（フロント+バック+DB）をKubernetesに移行

**成果物**:
- [ ] 3つの`deployment.yaml`作成
- [ ] 3つの`service.yaml`作成
- [ ] `kubectl apply -f`でデプロイ成功
- [ ] Docker ComposeとK8sの比較表作成

**比較表例**:
| 機能 | Docker Compose | Kubernetes |
|---|---|---|
| 起動コマンド | `docker-compose up` | `kubectl apply -f` |
| スケーリング | 手動 | 宣言的 |
| 自動回復 | なし | あり |
| 複数ホスト | 不可 | 可能 |

#### セッションで話すこと

- Kubernetesの必要性（DockerCompose超える規模）
- 宣言的管理 vs 命令的管理
- Pod/Deployment/ReplicaSetの関係
- ラベルセレクタの重要性

#### 確認ポイント

- ✅ YAMLが書けるか
- ✅ DockerとK8sの違いを説明できるか
- ✅ 移行の勘所を理解しているか

---

### Week 2: Service/Networking + Ingress

#### 今週の目標

- Service種類を使い分けられる
- Ingressでルーティングできる
- ネットワークポリシーを理解する

#### サービス全体像

```mermaid
graph TB
    Internet[Internet] -->|HTTPS| LB[LoadBalancer<br/>example.com]
    LB --> IG[Ingress Controller]

    IG -->|/| FS[Frontend Service<br/>ClusterIP]
    IG -->|/api| BS[Backend Service<br/>ClusterIP]

    FS --> FP1[Frontend Pod 1]
    FS --> FP2[Frontend Pod 2]
    FS --> FP3[Frontend Pod 3]

    BS --> BP1[Backend Pod 1]
    BS --> BP2[Backend Pod 2]

    BP1 --> PS[Postgres Service<br/>ClusterIP]
    BP2 --> PS

    PS --> PP[(Postgres Pod)]

    subgraph "外部公開"
        LB
        IG
    end

    subgraph "内部通信"
        FS
        BS
        PS
    end

    style LB fill:#ce93d8,stroke:#8e24aa,color:#000
    style IG fill:#ffcc80,stroke:#f57c00,color:#000
    style FS fill:#81d4fa,stroke:#1976d2,color:#000
    style BS fill:#81d4fa,stroke:#1976d2,color:#000
    style PS fill:#a5d6a7,stroke:#43a047,color:#000
```

#### 課題

Week 1のアプリにIngress追加 + パスベースルーティング

**成果物**:
- [ ] Service種類の使い分け（ClusterIP/NodePort/LoadBalancer）
- [ ] `ingress.yaml`作成
- [ ] パスルーティング設定（/, /api, /admin）
- [ ] TLS証明書設定（self-signed）

**発展課題**:
- [ ] Network Policyで通信制限
- [ ] Rate Limitingアノテーション

#### セッションで話すこと

- Service種類の実務での使い分け
- サービスメッシュの概念（軽く触れる）
- 本番でのセキュリティ（WAF、DDoS対策）

#### 確認ポイント

- ✅ Service種類を説明できるか
- ✅ Ingressが設定できるか
- ✅ 本番構成をイメージできるか

---

### Week 3: ConfigMap/Secret/Volume

#### 今週の目標

- 12-factor appを実践できる
- 環境別設定を管理できる
- データ永続化ができる

#### 設定管理パターン

```mermaid
graph TB
    subgraph "アプリケーション"
        POD[Pod<br/>App Container]
    end

    subgraph "設定"
        CM1[ConfigMap<br/>app-config<br/>平文設定]
        CM2[ConfigMap<br/>nginx-config<br/>設定ファイル]
    end

    subgraph "機密情報"
        S1[Secret<br/>db-credentials]
        S2[Secret<br/>api-keys]
        S3[Secret<br/>tls-cert]
    end

    subgraph "永続化"
        PVC[PersistentVolumeClaim<br/>data-storage]
        PV[PersistentVolume]
    end

    CM1 -.環境変数.-> POD
    CM2 -.ボリュームマウント.-> POD
    S1 -.環境変数.-> POD
    S2 -.環境変数.-> POD
    S3 -.ボリュームマウント.-> POD
    PVC -.ボリュームマウント.-> POD
    PVC -->|バインド| PV

    style CM1 fill:#81d4fa,stroke:#1976d2,color:#000
    style CM2 fill:#81d4fa,stroke:#1976d2,color:#000
    style S1 fill:#ff8a65,stroke:#e64a19,color:#000
    style S2 fill:#ff8a65,stroke:#e64a19,color:#000
    style S3 fill:#ff8a65,stroke:#e64a19,color:#000
    style PVC fill:#a5d6a7,stroke:#43a047,color:#000
```

#### 課題

Week 2のアプリを本番想定の設定に変更

**成果物**:
- [ ] ConfigMapで環境別設定（dev/stg/prod）
- [ ] Secretで全ての機密情報管理
- [ ] PVCでPostgreSQLデータ永続化
- [ ] 12-factor app準拠チェックリスト

**チェックリスト**:
- [ ] コードベース: 単一リポジトリ
- [ ] 依存関係: 明示的宣言
- [ ] 設定: 環境変数で管理
- [ ] バックエンドサービス: 接続可能なリソース
- [ ] ビルド、リリース、実行: 分離
- [ ] プロセス: ステートレス
- [ ] ポートバインディング: 自己完結
- [ ] 並行性: プロセスモデル
- [ ] 廃棄容易性: 高速起動、グレースフルシャットダウン
- [ ] 開発/本番一致: 環境を近づける
- [ ] ログ: イベントストリーム
- [ ] 管理プロセス: ワンオフプロセス

#### セッションで話すこと

- 12-factor appの各項目
- 環境変数 vs ボリュームマウントの使い分け
- Secretの暗号化（at-rest, in-transit）
- StatefulSet vs Deploymentの使い分け

#### 確認ポイント

- ✅ 設定外部化ができるか
- ✅ 12-factor appを実践できるか
- ✅ 本番想定の構成を理解しているか

---

## Phase 2: 実践（Week 4-6）

### Week 4: Helm

#### 今週の目標

- Helmの必要性を体感する
- チャート作成ができる
- 環境別デプロイができる

#### Helm活用パターン

```mermaid
graph TB
    subgraph "Helmチャート構成"
        C[Chart.yaml<br/>メタ情報]
        T[templates/<br/>YAMLテンプレート]
        H[_helpers.tpl<br/>共通関数]
        VB[values.yaml<br/>ベース設定]
    end

    subgraph "環境別設定"
        VD[values-dev.yaml<br/>開発環境]
        VS[values-stg.yaml<br/>ステージング]
        VP[values-prod.yaml<br/>本番環境]
    end

    subgraph "デプロイ"
        D1[helm install my-app<br/>-f values-dev.yaml]
        D2[helm install my-app<br/>-f values-stg.yaml]
        D3[helm install my-app<br/>-f values-prod.yaml]
    end

    C --> T
    T --> H
    H --> VB

    VB --> VD
    VB --> VS
    VB --> VP

    VD --> D1
    VS --> D2
    VP --> D3

    style C fill:#ce93d8,stroke:#8e24aa,color:#000
    style VB fill:#81d4fa,stroke:#1976d2,color:#000
    style VD fill:#ffcc80,stroke:#f57c00,color:#000
    style VS fill:#ffcc80,stroke:#f57c00,color:#000
    style VP fill:#ff8a65,stroke:#e64a19,color:#000
```

#### 課題

Week 3のアプリをHelmチャート化

**成果物**:
- [ ] `helm create`でチャート作成
- [ ] 既存YAMLをテンプレート化
- [ ] `values-dev.yaml`, `values-stg.yaml`, `values-prod.yaml`作成
- [ ] `helm template`でレンダリング確認
- [ ] `helm install`で3環境デプロイ
- [ ] Helm Chart設計ドキュメント

**テンプレート化の例**:
```yaml
# Before
replicas: 3
image: myapp:v1.0.0

# After
replicas: {{ .Values.replicaCount }}
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

#### セッションで話すこと

- なぜHelmが必要か（DRY、環境管理）
- Go Templateの基本構文
- `_helpers.tpl`の活用
- Chart Hooksの使い方
- Helm Repositoryでの共有

#### 確認ポイント

- ✅ Helmチャートが作成できるか
- ✅ テンプレート構文が理解できているか
- ✅ 環境別管理ができるか

---

### Week 5: ヘルスチェック/リソース制限

#### 今週の目標

- Liveness/Readiness Probeが設定できる
- リソース制限の重要性を理解する
- 自動回復する堅牢なアプリを作れる

#### ヘルスチェックフロー

```mermaid
sequenceDiagram
    participant K as Kubelet
    participant P as Pod
    participant A as App

    Note over K,A: Startup Probe（起動確認）
    K->>P: Startup Probe
    P->>A: HTTP GET /health
    A-->>P: 200 OK
    P-->>K: 起動完了

    Note over K,A: Readiness Probe（トラフィック受信可能か）
    K->>P: Readiness Probe
    P->>A: HTTP GET /ready
    A-->>P: 200 OK
    P-->>K: トラフィック受信可能
    K->>P: Serviceに追加

    Note over K,A: Liveness Probe（生存確認）
    loop 定期的に実行
        K->>P: Liveness Probe
        P->>A: HTTP GET /health
        alt 正常
            A-->>P: 200 OK
            P-->>K: 正常稼働中
        else 異常
            A-->>P: 500 Error
            P-->>K: 異常検知
            K->>P: Pod再起動
        end
    end
```

#### 課題

Week 4のアプリにヘルスチェックとリソース制限を追加

**成果物**:
- [ ] Startup/Liveness/Readiness Probe設定
- [ ] リソース制限（requests/limits）設定
- [ ] Podの自動再起動確認
- [ ] リソース不足時の挙動確認
- [ ] メトリクス収集設定

**Probe設定例**:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

#### セッションで話すこと

- Startup/Liveness/Readinessの違い
- リソース requests vs limits
- QoS Class（Guaranteed, Burstable, BestEffort）
- OOMKillerの仕組み
- メトリクスサーバーの導入

#### 確認ポイント

- ✅ ヘルスチェックが設定できるか
- ✅ リソース制限の重要性を理解しているか
- ✅ 本番運用を意識した設定ができるか

---

### Week 6: ローリングアップデート/Rollback

#### 今週の目標

- デプロイ戦略を理解する
- ゼロダウンタイムデプロイができる
- ロールバックができる

#### デプロイ戦略比較

```mermaid
graph TB
    subgraph "Recreate（全停止）"
        R1[Old v1 Pod] -.Delete.-> R2[⏸ ダウンタイム]
        R2 --> R3[New v2 Pod]
    end

    subgraph "Rolling Update（段階的）"
        O1[v1 Pod 1]
        O2[v1 Pod 2]
        O3[v1 Pod 3]

        O1 -.Delete.-> N1[v2 Pod 1]
        N1 --> O2
        O2 -.Delete.-> N2[v2 Pod 2]
        N2 --> O3
        O3 -.Delete.-> N3[v2 Pod 3]
    end

    subgraph "Blue/Green（切り替え）"
        B[Blue v1<br/>3 Pods] --> BG[Service切り替え]
        G[Green v2<br/>3 Pods] --> BG
    end

    subgraph "Canary（段階公開）"
        CA1[v1 Pods: 90%]
        CA2[v2 Pods: 10%]
        CA1 --> CA3[問題なければ<br/>v2を100%に]
        CA2 --> CA3
    end

    style R2 fill:#ff8a65,stroke:#e64a19,color:#000
    style O2 fill:#a5d6a7,stroke:#43a047,color:#000
    style BG fill:#81d4fa,stroke:#1976d2,color:#000
    style CA3 fill:#ffcc80,stroke:#f57c00,color:#000
```

#### 課題

Week 5のアプリで各種デプロイ戦略を実践

**成果物**:
- [ ] Rolling Updateでイメージ更新
- [ ] Rollbackで前バージョンに戻す
- [ ] Blue/Green デプロイ実装
- [ ] Canary デプロイ実装（手動）
- [ ] デプロイ戦略比較レポート

**Rolling Update設定**:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # 同時に作成できる超過Pod数
    maxUnavailable: 0  # 同時に停止できるPod数
```

#### セッションで話すこと

- デプロイ戦略の使い分け
- `kubectl rollout`コマンド
- Helm Releaseのロールバック
- ArgoCD/Fluxによる継続的デプロイ（紹介）
- 本番でのデプロイフロー

#### 確認ポイント

- ✅ ゼロダウンタイムデプロイができるか
- ✅ ロールバックができるか
- ✅ デプロイ戦略を説明できるか

---

## Phase 3: 応用（Week 7-8）

### Week 7: HPA（Horizontal Pod Autoscaler）

#### 今週の目標

- オートスケーリングを実装できる
- メトリクスベースの自動化を理解する
- スケーリング戦略を設計できる

#### HPAの仕組み

```mermaid
sequenceDiagram
    participant MS as Metrics Server
    participant HPA as HPA Controller
    participant D as Deployment
    participant P as Pods

    Note over MS,P: 1. メトリクス収集
    P->>MS: CPU/メモリ使用率
    MS->>MS: メトリクス集約

    Note over MS,P: 2. スケーリング判定
    HPA->>MS: メトリクス取得
    MS-->>HPA: CPU 80%（閾値超過）
    HPA->>HPA: スケールアウト判定

    Note over MS,P: 3. Podスケール
    HPA->>D: replicas: 3 → 5
    D->>P: 新しいPod作成
    P-->>D: Pod起動完了

    Note over MS,P: 4. 負荷低下後
    HPA->>MS: メトリクス取得
    MS-->>HPA: CPU 40%（閾値以下）
    HPA->>D: replicas: 5 → 3
    D->>P: Pod削除
```

#### 課題

Week 6のアプリにHPAを追加 + 負荷テスト

**成果物**:
- [ ] Metrics Server導入
- [ ] HPA設定（CPU/メモリベース）
- [ ] 負荷テストツール導入（Apache Bench / K6）
- [ ] スケールアウト/スケールインの確認
- [ ] カスタムメトリクス（Prometheus）によるスケーリング

**HPA設定例**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### セッションで話すこと

- HPAとVPAの違い
- メトリクスの種類（Resource, Pods, Object, External）
- Cluster Autoscalerとの連携
- スケーリングのベストプラクティス
- コスト最適化

#### 確認ポイント

- ✅ HPAが設定できるか
- ✅ 負荷テストができるか
- ✅ スケーリング戦略を説明できるか

---

### Week 8: 総合課題 + 次のステップ

#### 今週の目標

- 学んだことを統合できる
- マイクロサービスアプリを構築できる
- 次のステップを理解している

#### 理想的なアーキテクチャ

```mermaid
graph TB
    subgraph "外部"
        User[User]
        LB[LoadBalancer]
    end

    subgraph "Ingress Layer"
        IG[Ingress Controller<br/>+ TLS Termination]
    end

    subgraph "Application Layer"
        FE[Frontend<br/>HPA: 2-10<br/>Health Checks]
        API[API Gateway<br/>HPA: 3-15]
        AUTH[Auth Service<br/>HPA: 2-5]
        PROD[Product Service<br/>HPA: 3-10]
        ORDER[Order Service<br/>HPA: 2-8]
    end

    subgraph "Data Layer"
        REDIS[(Redis<br/>StatefulSet)]
        PG[(PostgreSQL<br/>StatefulSet<br/>+ PVC)]
    end

    subgraph "Monitoring"
        PROM[Prometheus]
        GRAF[Grafana]
    end

    User --> LB
    LB --> IG
    IG --> FE
    FE --> API
    API --> AUTH
    API --> PROD
    API --> ORDER

    AUTH --> REDIS
    PROD --> PG
    ORDER --> PG

    FE -.metrics.-> PROM
    API -.metrics.-> PROM
    AUTH -.metrics.-> PROM
    PROD -.metrics.-> PROM
    ORDER -.metrics.-> PROM
    PROM --> GRAF

    style IG fill:#ce93d8,stroke:#8e24aa,color:#000
    style FE fill:#81d4fa,stroke:#1976d2,color:#000
    style API fill:#ffcc80,stroke:#f57c00,color:#000
    style PG fill:#a5d6a7,stroke:#43a047,color:#000
    style PROM fill:#ff8a65,stroke:#e64a19,color:#000
```

#### 課題

マイクロサービスアプリケーションの完全構築

**要件**:
- [ ] 3つ以上のマイクロサービス
- [ ] Helmチャート（環境別設定）
- [ ] ヘルスチェック + リソース制限
- [ ] HPA設定
- [ ] Ingress + TLS
- [ ] ConfigMap/Secret管理
- [ ] データ永続化
- [ ] 監視（Prometheus + Grafana）
- [ ] CI/CDパイプライン（GitHub Actions）
- [ ] ドキュメント完備

**成果物**:
- [ ] GitHubリポジトリ
- [ ] アーキテクチャ図
- [ ] セットアップガイド
- [ ] 運用手順書
- [ ] 振り返りレポート

#### セッションで話すこと

- 8週間の振り返り
- 実務でのKubernetes活用
- 次のステップ候補:
  - **CI/CD**: ArgoCD, Flux, Tekton
  - **Service Mesh**: Istio, Linkerd
  - **Observability**: ELK Stack, Jaeger（分散トレーシング）
  - **Security**: Falco, OPA/Gatekeeper
  - **本番環境**: EKS/GKE/AKS
- キャリアパス

#### 確認ポイント

- ✅ 実務レベルのアプリが構築できるか
- ✅ ベストプラクティスに従っているか
- ✅ 自走できるか

---

## 修了後の推奨学習パス

```mermaid
mindmap
  root((Week 8修了))
    CI/CD
      GitOps
        ArgoCD
        Flux CD
      Pipeline
        Tekton
        GitHub Actions
        GitLab CI
    Observability
      Metrics
        Prometheus
        Grafana
        VictoriaMetrics
      Logging
        ELK Stack
        Loki
      Tracing
        Jaeger
        Zipkin
    Advanced
      Service Mesh
        Istio
        Linkerd
        Consul
      Security
        Falco
        OPA
        Vault
      Multi-cluster
        Cluster API
        KubeFed
    Production
      Cloud Managed K8s
        EKS AWS
        GKE Google
        AKS Azure
      Cost Optimization
        Karpenter
        KEDA
      Disaster Recovery
        Velero
        Backup Strategy
```

---

## 実務適用チェックリスト

### アーキテクチャ設計

- [ ] マイクロサービス分割戦略
- [ ] API Gateway選定
- [ ] データベース戦略（1 DB per service）
- [ ] キャッシュ戦略
- [ ] 非同期通信（Message Queue）

### セキュリティ

- [ ] RBAC設定
- [ ] Network Policy
- [ ] Pod Security Standards
- [ ] Secret管理（Vault/Sealed Secrets）
- [ ] Image Scanning

### 監視・ロギング

- [ ] Prometheus + Grafana
- [ ] アラート設定
- [ ] ログ集約
- [ ] 分散トレーシング
- [ ] SLI/SLO/SLA定義

### 運用

- [ ] GitOps（ArgoCD/Flux）
- [ ] バックアップ戦略
- [ ] Disaster Recovery
- [ ] コスト監視
- [ ] ドキュメント整備

---
