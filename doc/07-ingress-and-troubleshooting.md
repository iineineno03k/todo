[[README.md](./README.md) に戻る]

# Ingressと問題解決

このドキュメントでは、Ingress Controllerのセットアップから実際の運用で発生した問題とその解決方法を記録します。

---

## Ingress Controllerのセットアップ

### Ingressとは？

Ingressは、クラスタ外部からクラスタ内のServiceへのHTTP/HTTPSルートを公開するKubernetesリソースです。パスベースやホストベースのルーティングが可能で、複数のServiceを1つのエントリーポイントでまとめて公開できます。

**従来の方法（NodePort）**:
```
ブラウザ → minikube IP:30080 → frontend-service
ブラウザ → minikube IP:30081 → backend-service (外部公開が必要)
```

**Ingressを使った方法**:
```
ブラウザ → http://localhost:8080/ → Ingress → frontend-service
ブラウザ → http://localhost:8080/api → Ingress → backend-service
```

### 1. Ingress Controllerの有効化

minikubeではNginx Ingress Controllerをアドオンとして提供しています。

```bash
# Ingress Controllerを有効化
minikube addons enable ingress

# 確認
kubectl get pods -n ingress-nginx
# ingress-nginx-controller-xxx が Running になっていることを確認
```

### 2. Ingressマニフェストの作成

**k8s/ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: localhost
    http:
      paths:
      # Backend API routes
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      # Frontend routes (catch-all)
      - path: /()(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

**ポイント**:
- **パスベースルーティング**: `/api` で始まるリクエストはbackend-service、それ以外はfrontend-serviceへ
- **rewrite-target**: `/api/todos` → `/todos` のようにパスを書き換え
- **順序重要**: より具体的なパス（`/api`）を先に定義

### 3. Ingressの適用

```bash
kubectl apply -f k8s/ingress.yaml

# Ingress確認
kubectl get ingress
# NAME           CLASS   HOSTS       ADDRESS        PORTS   AGE
# todo-ingress   nginx   localhost   192.168.49.2   80      10s
```

---

## minikube docker driverのネットワーク問題

### 問題: Ingress経由でアクセスできない

minikubeをdocker driverで起動している場合、Ingressに直接アクセスできない問題が発生します。

**原因**:
- minikubeがDockerコンテナ内で動作しているため、ホストマシンから直接IngressのIPアドレスにアクセスできない
- `minikube tunnel` コマンドも docker driver では正常に動作しない場合がある

### 解決策: kubectl port-forward を使用

Ingress Controllerのpodに対してport-forwardを設定します。

```bash
# Ingress ControllerのPod名を取得
kubectl get pods -n ingress-nginx

# port-forward（ポート8080でアクセス可能にする）
kubectl port-forward -n ingress-nginx \
  pod/ingress-nginx-controller-xxxxxxxxx-xxxxx 8080:80

# 別のターミナルでアクセステスト
curl http://localhost:8080/api/todos
```

**注意**:
- このターミナルは開きっぱなしにする必要がある
- より永続的な解決策としては、minikubeのdriverを `hyperkit` や `virtualbox` に変更する方法もある

---

## フロントエンドとバックエンドの統合で発生した問題

### 問題1: CORS エラー

**エラー内容**:
```
Access to fetch at 'http://localhost:8080/api/todos' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**原因**:
- バックエンドのCORS設定で `http://localhost:8080` が許可されていなかった
- フロントエンドがIngress経由（ポート8080）でアクセスするため、originが `http://localhost:8080` になる

**解決策**:
バックエンドのCORS設定に `http://localhost:8080` を追加

**backend-java/src/main/java/com/example/todoapi/config/WebConfig.java**:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:8080"  // ← Ingress経由のアクセスを許可
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

**適用手順**:
```bash
# コード修正後、minikube環境でイメージ再ビルド
eval $(minikube docker-env)
cd backend-java
docker build -t todo-backend:latest .

# Deploymentを再起動してイメージを反映
kubectl rollout restart deployment/backend
```

---

### 問題2: Zodバリデーションエラー

**エラー内容**:
```
Invalid datetime string! must be a valid ISO 8601 date string
```

**原因**:
- フロントエンドのZodスキーマで `createdAt` フィールドを `z.coerce.date()` と定義
- バックエンドから返されるISO 8601形式の文字列（例: `"2025-10-26T12:34:56.789"`）を自動的にDateオブジェクトに変換しようとして失敗

**解決策**:
Zodスキーマを文字列として扱うように変更

**frontend-nextjs/src/lib/schema.ts**:
```typescript
import { z } from "zod";

export const todoSchema = z.object({
  id: z.number(),
  task: z.string().min(1, "Task cannot be empty"),
  completed: z.boolean(),
  createdAt: z.string(),  // ← z.coerce.date() から z.string() に変更
});

export type Todo = z.infer<typeof todoSchema>;
```

---

### 問題3: PUTリクエストの400エラー（バリデーションエラー）

**エラー内容**:
TODOのトグル（完了/未完了の切り替え）やタスク名編集時に400エラーが発生：
```json
{
  "timestamp": "2025-10-26T13:45:12.345+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": {
    "task": "must not be blank"
  }
}
```

**原因**:
バックエンドのPUTエンドポイントで `task` フィールドが必須になっていたため、トグル操作時に以下のようなリクエストを送ると失敗：
```json
{
  "completed": true
  // task フィールドが含まれていない
}
```

**バックエンドのコード（TodoController.java）**:
```java
@PutMapping("/{id}")
public ResponseEntity<Todo> updateTodo(
    @PathVariable Long id,
    @Valid @RequestBody Todo todoDetails) {  // @Valid で全フィールドをバリデーション
    // ...
}
```

**Todoエンティティ**:
```java
@NotBlank(message = "Task cannot be blank")
private String task;  // ← これが必須扱いになる
```

**解決策の選択肢**:

**選択肢1: フロントエンド側で全フィールドを送信（採用）**

トグルや編集時に、変更するフィールドだけでなく、既存のすべてのフィールドを含めてリクエストを送信する。

**frontend-nextjs/src/lib/api.ts**:
```typescript
// トグル処理（修正後）
export async function toggleTodo(id: number, currentCompleted: boolean, currentTask: string): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task: currentTask,        // ← 既存のタスク名も送信
      completed: !currentCompleted,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to toggle todo");
  }

  return response.json();
}

// 編集処理（修正後）
export async function updateTodo(id: number, task: string, completed: boolean): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task,        // ← 新しいタスク名
      completed,   // ← 既存の完了状態も送信
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update todo");
  }

  return response.json();
}
```

**選択肢2: バックエンド側で部分更新を許可（今回は不採用）**

バックエンドのバリデーションを緩和するか、PATCH用のエンドポイントを別途作成する方法もありますが、今回はフロントエンド側で対応しました。

---

## 最終的な構成

### アーキテクチャ図

```
ブラウザ (http://localhost:8080)
   ↓
kubectl port-forward (ローカル8080 → Ingress 80)
   ↓
Ingress Controller (Nginx)
   ├─ /api → backend-service (ClusterIP:8080)
   │           ↓
   │         backend Pod (Java)
   │           ↓
   │         postgres-service (ClusterIP:5432)
   │           ↓
   │         postgres Pod (PostgreSQL)
   │
   └─ / → frontend-service (ClusterIP:3000)
           ↓
         frontend Pod (Next.js)
```

### マニフェスト一覧

```
k8s/
├── backend-deployment.yaml
├── backend-service.yaml       (type: ClusterIP)
├── frontend-deployment.yaml
├── frontend-service.yaml      (type: ClusterIP)  ← NodePortから変更
├── postgres-deployment.yaml
├── postgres-service.yaml      (type: ClusterIP)
└── ingress.yaml               ← 新規追加
```

---

## トラブルシューティングのまとめ

### 発生した問題と解決策

| 問題 | 原因 | 解決策 |
|---|---|---|
| Ingressにアクセスできない | minikube docker driverのネットワーク制限 | `kubectl port-forward` でIngress Controllerに転送 |
| CORS エラー | `http://localhost:8080` が許可されていない | バックエンドのCORS設定に追加 |
| Zodバリデーションエラー | `createdAt` をDateに変換しようとして失敗 | Zodスキーマを `z.string()` に変更 |
| PUT 400エラー | `task` フィールドが必須だがリクエストに含まれていない | フロントエンドで全フィールドを送信 |

### デバッグに役立つコマンド

```bash
# Pod のログ確認
kubectl logs <pod-name>

# Pod の詳細確認（エラー原因の特定）
kubectl describe pod <pod-name>

# Service の確認
kubectl get services

# Ingress の確認
kubectl get ingress
kubectl describe ingress todo-ingress

# Pod内でシェル実行（デバッグ用）
kubectl exec -it <pod-name> -- /bin/sh

# ポートフォワード（一時的なアクセス確認）
kubectl port-forward service/<service-name> <local-port>:<service-port>
```

### 学習ポイント

1. **Ingressのパスルーティング**: 1つのエントリーポイントで複数のServiceを公開できる
2. **minikubeのネットワーク制限**: docker driverでは追加の設定が必要
3. **CORS設定の重要性**: フロントエンドとバックエンドのorigin設定を一致させる
4. **バリデーションの一貫性**: フロントエンドとバックエンドのバリデーションルールを揃える
5. **RESTful APIの設計**: PUT操作では全フィールドを送信するのが標準的

---

## 次のステップ

今後の学習課題：

- [ ] Secret による機密情報管理（PostgreSQLパスワードなど）
- [ ] ConfigMap による設定の外部化
- [ ] PersistentVolume による永続化（Podが再起動してもデータを保持）
- [ ] ヘルスチェックとReadiness Probe
- [ ] リソース制限（CPU/メモリ）の設定
- [ ] HorizontalPodAutoscaler による自動スケーリング
- [ ] 本番環境へのデプロイ（AWS EKS / GCP GKE など）
