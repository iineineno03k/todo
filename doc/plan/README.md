# Kubernetes学習プラン（メンター用）

週1回のメンタリングセッションで進める、課題ベースのKubernetes学習プログラム

## 📋 目次

- [事前確認（第0週）](#事前確認第0週)
- [ルート選択フロー](#ルート選択フロー)
- [ルートA: Docker未経験者向け（12週間）](./route-a-docker-beginner.md)
- **ルートB: Docker経験者向け**
  - [最低限パターン（6週間）](./route-b-minimum.md) ← 基礎固め
  - [最大パターン（8週間）](./route-b-docker-experienced.md) ← 本番運用レベル
- [メンタリング運用ガイド](#メンタリング運用ガイド)

---

## 事前確認（第0週）

### ヒアリング項目

初回セッションで以下を確認し、適切なルートを選択します：

| 項目 | 選択肢 | 重要度 |
|---|---|---|
| **Dockerの経験** | なし / 触ったことある / 実務経験あり | ⭐⭐⭐ |
| **学習の目的** | 個人学習 / 業務で必要 / 転職準備 | ⭐⭐ |
| **週の学習時間** | 2-3時間 / 5時間以上 | ⭐⭐ |
| **開発環境** | Mac / Windows / Linux | ⭐ |

---

## ルート選択フロー

```mermaid
flowchart TD
    Start[メンティー受け入れ] --> Q1{Dockerの経験は？}

    Q1 -->|なし| RouteA[ルートA: Docker未経験者向け<br/>12週間プログラム]
    Q1 -->|触ったことある| Q2{Dockerfileを<br/>書いたことは？}
    Q1 -->|実務経験あり| Q3{週の学習時間は？}

    Q2 -->|はい| Q3
    Q2 -->|いいえ| RouteA

    Q3 -->|3-5時間| RouteBMin[ルートB: 最低限パターン<br/>6週間]
    Q3 -->|5時間以上| RouteBMax[ルートB: 最大パターン<br/>8週間]

    RouteA --> Week1A[Week 1: Docker入門]
    RouteA --> Week5A[Week 5: K8s環境構築]
    RouteA --> Week9A[Week 9: 実践課題]
    RouteA --> EndA[修了<br/>自走可能レベル]

    RouteBMin --> Week1BMin[Week 1-3: 基礎]
    RouteBMin --> Week4BMin[Week 4-6: Helm]
    RouteBMin --> EndBMin[修了<br/>基礎固め完了]

    RouteBMax --> Week1BMax[Week 1-3: 基礎]
    RouteBMax --> Week4BMax[Week 4-6: Helm+実践]
    RouteBMax --> Week7BMax[Week 7-8: 応用]
    RouteBMax --> EndBMax[修了<br/>本番運用レベル]

    style RouteA fill:#4fc3f7,stroke:#0288d1,color:#000
    style RouteBMin fill:#ffb74d,stroke:#f57c00,color:#000
    style RouteBMax fill:#ffb74d,stroke:#ef6c00,color:#000
    style EndA fill:#a5d6a7,stroke:#43a047,color:#000
    style EndBMin fill:#a5d6a7,stroke:#43a047,color:#000
    style EndBMax fill:#81c784,stroke:#388e3c,color:#000
```

---

## 全体像

### ルートA: Docker未経験者向け（12週間）

```mermaid
gantt
    title ルートA学習ロードマップ
    dateFormat YYYY-MM-DD
    section Phase 1: Docker基礎
    Week 1: Docker入門           :a1, 2025-01-06, 1w
    Week 2: Dockerfileベストプラクティス :a2, after a1, 1w
    Week 3: Docker Compose       :a3, after a2, 1w
    Week 4: Docker復習           :a4, after a3, 1w
    section Phase 2: K8s基礎
    Week 5: K8s環境構築          :b1, after a4, 1w
    Week 6: Pod/Deployment       :b2, after b1, 1w
    Week 7: Service/Networking   :b3, after b2, 1w
    Week 8: Ingress              :b4, after b3, 1w
    section Phase 3: 実践
    Week 9: ConfigMap/Secret     :c1, after b4, 1w
    Week 10: PersistentVolume    :c2, after c1, 1w
    Week 11: Helm導入            :c3, after c2, 1w
    Week 12: 総合課題            :c4, after c3, 1w
```

### ルートB: Docker経験者向け（8週間）

```mermaid
gantt
    title ルートB学習ロードマップ
    dateFormat YYYY-MM-DD
    section Phase 1: K8s基礎
    Week 1: 環境構築+Pod/Deployment :a1, 2025-01-06, 1w
    Week 2: Service+Ingress         :a2, after a1, 1w
    Week 3: ConfigMap/Secret/Volume :a3, after a2, 1w
    section Phase 2: 実践
    Week 4: Helm                    :b1, after a3, 1w
    Week 5: ヘルスチェック/リソース :b2, after b1, 1w
    Week 6: ローリングアップデート  :b3, after b2, 1w
    section Phase 3: 応用
    Week 7: HPA                     :c1, after b3, 1w
    Week 8: 総合課題+次のステップ   :c2, after c1, 1w
```

---

## 学習の進め方

### 週次サイクル

```mermaid
sequenceDiagram
    participant M as メンティー
    participant Me as メンター

    Note over M,Me: Week N
    Me->>M: 課題説明（前週セッション）
    M->>M: 自習・課題実施（6日間）
    M->>Me: 成果物提出

    Note over M,Me: Week N+1 セッション（60分）
    Me->>M: 1. 前回課題レビュー（20分）
    M->>Me: 質問・疑問点共有
    Me->>M: 2. コンセプト解説（20分）
    Me->>M: 3. 次週課題説明（15分）
    M->>Me: 4. 質疑応答（5分）

    Note over M,Me: 非同期サポート
    M->>Me: Slack/Discord質問
    Me->>M: 随時回答
```

---

## メンタリング運用ガイド

### セッション構成（60分）

| 時間 | 内容 | ポイント |
|---|---|---|
| 0-20分 | **前回課題レビュー** | 成果物確認、質問対応、つまづき分析 |
| 20-40分 | **コンセプト解説** | 今週のトピック、実務での位置づけ |
| 40-55分 | **次週課題説明** | 課題内容、ゴール設定、ヒント提供 |
| 55-60分 | **質疑応答** | オープンQ&A |

### メンターの心得

#### ✅ DO

- 手を動かさせることを最優先
- 「なぜ必要か」を常に意識させる
- 実践 → 理論の順で説明
- 詰まったら非同期でサポート
- 成功体験を積ませる

#### ❌ DON'T

- 理論から入らない
- 答えを教えすぎない
- 完璧を求めない
- 進度を急がせない

### 課題評価基準

| レベル | 状態 | 対応 |
|---|---|---|
| 🟢 **優秀** | 課題完了 + 発展課題実施 | 次のステップ提示 |
| 🟡 **合格** | 課題完了 | 理解度確認して次へ |
| 🟠 **要復習** | 課題完了も理解不足 | 補足説明、類似課題追加 |
| 🔴 **未完了** | 課題未完 | 1週延長、難易度調整 |

---

## 各ルートの詳細

### ルートA: Docker未経験者向け
- [12週間プログラム](./route-a-docker-beginner.md)
- Dockerの基礎から学ぶ
- Kubernetesの実践まで

### ルートB: Docker経験者向け

| パターン | 期間 | 到達レベル | 推奨する人 |
|---|---|---|---|
| [最低限](./route-b-minimum.md) | 6週間 | 基礎固め | 週3-5時間、まず基礎を確実に |
| [最大](./route-b-docker-experienced.md) | 8週間 | 本番運用可能 | 週5時間以上、実務で即戦力になりたい |

**迷ったら最低限パターンから**。Week 6修了後に最大パターンに切り替えも可能。

---

## 修了基準

### ルートA修了時のゴール

- ✅ Dockerの基本が理解できている
- ✅ Kubernetesの基本リソース（Pod/Deployment/Service/Ingress）が使える
- ✅ YAMLマニフェストが自分で書ける
- ✅ Helmチャートが作成できる
- ✅ 簡単なアプリをKubernetesにデプロイできる

### ルートB修了時のゴール

- ✅ Kubernetesの実践的な運用知識がある
- ✅ Helmを使った環境別管理ができる
- ✅ ヘルスチェック、リソース制限などの本番考慮ができる
- ✅ オートスケーリング、ローリングアップデートが理解できている
- ✅ 実務でKubernetesを適用できるレベル

---

## 次のステップ（修了後）

```mermaid
mindmap
  root((Kubernetes修了))
    CI/CD
      GitHub Actions
      ArgoCD
      Tekton
    監視・ロギング
      Prometheus/Grafana
      ELK Stack
      Loki
    高度な運用
      Service Mesh
        Istio
        Linkerd
      セキュリティ
        RBAC
        Pod Security Policy
        Network Policy
      本番運用
        EKS/GKE/AKS
        マルチクラスタ
        Disaster Recovery
```

---

## 参考リンク

- [Kubernetes公式ドキュメント](https://kubernetes.io/ja/docs/home/)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [Helm公式ドキュメント](https://helm.sh/docs/)
- [Kubernetes The Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)
