# GyuList コードベースガイド

## 概要

このガイドは、GyuListプロジェクトのコードベース構造、開発環境、および開発ワークフローについて説明します。

## プロジェクト構造

```
gyulist/
├── apps/                    # アプリケーション
│   ├── api/                # バックエンドAPI
│   │   ├── src/
│   │   │   ├── application/     # アプリケーション層
│   │   │   │   └── use-cases/   # ユースケース
│   │   │   ├── domain/          # ドメイン層
│   │   │   │   ├── errors/      # ドメインエラー
│   │   │   │   ├── functions/   # ドメイン関数
│   │   │   │   ├── ports/       # ポート（インターフェース）
│   │   │   │   └── types/       # ドメイン型
│   │   │   ├── infrastructure/  # インフラストラクチャ層
│   │   │   │   ├── config/      # 設定
│   │   │   │   ├── database/    # データベース関連
│   │   │   │   └── services/    # 外部サービス
│   │   │   ├── interfaces/      # インターフェース層
│   │   │   │   ├── http/        # HTTP関連
│   │   │   │   └── batch/       # バッチ処理
│   │   │   └── shared/          # 共有ユーティリティ
│   │   ├── drizzle/             # データベースマイグレーション
│   │   └── tests/               # テスト
│   └── web/                # フロントエンドWebアプリ
│       ├── src/
│       │   ├── app/             # Next.js App Router
│       │   ├── components/      # 共通UIコンポーネント
│       │   ├── features/        # 機能別コンポーネント
│       │   ├── lib/             # ユーティリティ
│       │   ├── services/        # API通信サービス
│       │   └── hooks/           # カスタムフック
│       └── tests/               # テスト
├── docs/                   # ドキュメント
├── scripts/                # ビルド・デプロイスクリプト
└── package.json            # ルートパッケージ設定
```

## アーキテクチャ原則

### 1. レイヤードアーキテクチャ

```
HTTP Layer (Controllers)
    ↓
Application Layer (Use Cases)
    ↓
Domain Layer (Entities, Functions, Ports)
    ↓
Infrastructure Layer (Repositories, Database)
```

### 2. 依存関係の方向

- 内側のレイヤー（Domain）は外側のレイヤー（Infrastructure）に依存しない
- 外側のレイヤーは内側のレイヤーのインターフェース（Ports）に依存する
- 依存性注入（DI）により、テスト時にモックを簡単に差し替え可能

### 3. 関心の分離

- **Domain**: ビジネスロジックとルール
- **Application**: ユースケースの調整
- **Infrastructure**: 技術的な実装詳細
- **Interface**: 外部との接点

## 開発環境セットアップ

### 1. 前提条件

```bash
# Node.js 18+ が必要
node --version

# pnpm のインストール
npm install -g pnpm

# Git の設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. プロジェクトのクローンとセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd gyulist

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

### 3. データベースのセットアップ

```bash
# D1データベースの作成（Cloudflare Workers）
wrangler d1 create gyulist-db

# マイグレーションの実行
cd apps/api
pnpm drizzle-kit push:sqlite
```

### 4. 開発サーバーの起動

```bash
# ルートディレクトリで
pnpm dev

# または個別に起動
cd apps/api && pnpm dev
cd apps/web && pnpm dev
```

## 開発ワークフロー

### 1. 新機能開発の流れ

#### 1.1 ブランチ戦略

```bash
# メインブランチ
main          # 本番環境
develop       # 開発環境

# 機能ブランチ
feature/新機能名
bugfix/バグ修正名
hotfix/緊急修正名
```

#### 1.2 開発フロー

```bash
# 1. 最新のdevelopブランチを取得
git checkout develop
git pull origin develop

# 2. 機能ブランチを作成
git checkout -b feature/新機能名

# 3. 開発・テスト
# ... コーディング ...

# 4. コミット
git add .
git commit -m "feat: 新機能の実装"

# 5. プッシュ
git push origin feature/新機能名

# 6. プルリクエスト作成
# GitHubでプルリクエストを作成
```

### 2. コードレビュープロセス

#### 2.1 レビューチェックリスト

- [ ] 機能要件の実装
- [ ] コードの可読性
- [ ] エラーハンドリング
- [ ] テストの網羅性
- [ ] パフォーマンスの考慮
- [ ] セキュリティの考慮
- [ ] ドキュメントの更新

#### 2.2 レビューコメントの例

```typescript
// 良いレビューコメント
// この関数は複雑すぎるので、小さな関数に分割することを検討してください
// 例: validateInput, processData, formatOutput など

// 改善提案
// エラーメッセージを定数化して、国際化対応を容易にしてください

// セキュリティの指摘
// ユーザー入力のサニタイゼーションが不足しています
```

### 3. テスト戦略

#### 3.1 テストピラミッド

```
    E2E Tests (少数)
        ↑
  Integration Tests (中程度)
        ↑
   Unit Tests (多数)
```

#### 3.2 テストの実行

```bash
# 全テストの実行
pnpm test

# 特定のテストファイル
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# カバレッジレポート
pnpm test:coverage

# ウォッチモード
pnpm test:watch
```

## コーディング規約

### 1. TypeScript

#### 1.1 型定義

```typescript
// 良い例: 明示的な型定義
interface CattleListItem {
  readonly cattleId: CattleId;
  readonly name: string;
  readonly status: CattleStatus;
}

// 悪い例: anyの使用
const cattle: any = await getCattle();

// 良い例: 型ガード
function isCattleListItem(obj: unknown): obj is CattleListItem {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "cattleId" in obj &&
    "name" in obj &&
    "status" in obj
  );
}
```

#### 1.2 エラーハンドリング

```typescript
// Result型の使用
export type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// 良い例: Result型でのエラーハンドリング
export async function getCattle(id: CattleId): Promise<Result<Cattle, CattleError>> {
  try {
    const cattle = await repository.findById(id);
    if (!cattle) {
      return err({ type: "NotFound", message: "Cattle not found" });
    }
    return ok(cattle);
  } catch (error) {
    return err({ type: "InfraError", message: "Failed to get cattle", cause: error });
  }
}
```

### 2. 命名規約

#### 2.1 ファイル・ディレクトリ名

```bash
# コンポーネント: PascalCase
CattleList.tsx
FilterDialog.tsx

# フック: camelCase + use
useMediaQuery.ts
useCattleList.ts

# ユーティリティ: camelCase
apiClient.ts
dateUtils.ts

# 定数: UPPER_SNAKE_CASE
constants.ts
```

#### 2.2 変数・関数名

```typescript
// 良い例: 説明的な名前
const cattleList = await getCattleList();
const handleFilterChange = (filters: FilterOptions) => { /* ... */ };

// 悪い例: 曖昧な名前
const data = await getData();
const handle = () => { /* ... */ };

// 良い例: ブール値はis/has/canで始める
const isLoading = false;
const hasPermission = true;
const canEdit = false;
```

### 3. コメント規約

#### 3.1 JSDocコメント

```typescript
/**
 * 牛の年齢を計算する
 * @param birthday - 誕生日（ISO 8601形式の文字列）
 * @param currentDate - 現在の日付（デフォルト: 現在時刻）
 * @returns 年齢（歳）。誕生日が無効な場合はnull
 * @example
 * ```typescript
 * const age = calculateAge("2020-01-01");
 * console.log(age); // 3
 * ```
 */
export function calculateAge(
  birthday: string | null,
  currentDate: Date = new Date()
): number | null {
  if (!birthday) return null;
  
  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return null;
  
  const diffMs = currentDate.getTime() - birthDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}
```

#### 3.2 インラインコメント

```typescript
// 良い例: なぜそうするかの説明
// パフォーマンス向上のため、重い計算結果をメモ化
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// 悪い例: 何をするかの説明（コードから分かる）
// 配列をループして処理
data.forEach(item => {
  processItem(item);
});
```

## パフォーマンス最適化

### 1. フロントエンド

#### 1.1 React最適化

```typescript
// メモ化の活用
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return data.map(item => heavyProcessing(item));
  }, [data]);

  return <div>{processedData}</div>;
});

// コールバックの安定化
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

#### 1.2 バンドルサイズ最適化

```typescript
// 動的インポート
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>読み込み中...</div>,
  ssr: false
});

// ツリーハッキング
import { Button } from "@/components/ui/button";
// 不要なコンポーネントはインポートしない
```

### 2. バックエンド

#### 2.1 データベース最適化

```typescript
// インデックスの活用
// よく使用されるクエリには適切なインデックスを作成

// N+1問題の回避
const cattleWithEvents = await Promise.all([
  getCattle(cattleId),
  getEvents(cattleId)
]);

// ページネーション
const limit = 20;
const offset = (page - 1) * limit;
const results = await db.select().from(cattle).limit(limit).offset(offset);
```

#### 2.2 キャッシュ戦略

```typescript
// メモリキャッシュ
const cache = new Map<string, { data: unknown; expires: number }>();

export async function getCachedData(key: string): Promise<unknown> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const data = await fetchData(key);
  cache.set(key, { data, expires: Date.now() + 5 * 60 * 1000 }); // 5分
  return data;
}
```

## セキュリティ

### 1. 入力値検証

```typescript
// Zodスキーマによる厳密なバリデーション
export const createCattleSchema = z.object({
  name: z.string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "無効な文字が含まれています"),
  
  identificationNumber: z.number()
    .int("整数で入力してください")
    .positive("正の数を入力してください"),
  
  status: z.enum(["HEALTHY", "PREGNANT", "TREATING"], {
    required_error: "ステータスを選択してください"
  })
});
```

### 2. 認証・認可

```typescript
// JWTトークンの検証
export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as JwtPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// リソースの所有者チェック
export async function checkOwnership(
  userId: UserId,
  resourceId: ResourceId
): Promise<boolean> {
  const resource = await repository.findById(resourceId);
  return resource?.ownerId === userId;
}
```

### 3. SQLインジェクション対策

```typescript
// Drizzle ORMの使用（プリペアドステートメント）
const cattle = await db
  .select()
  .from(cattleTable)
  .where(eq(cattleTable.id, cattleId))
  .get();

// 生のSQLは避ける
// ❌ 危険
// const result = await db.exec(`SELECT * FROM cattle WHERE id = ${cattleId}`);
```

## デバッグ・ログ

### 1. ログ戦略

```typescript
// 構造化ログ
export class Logger {
  info(message: string, context: Record<string, unknown> = {}) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      context
    }));
  }

  error(message: string, error: Error, context: Record<string, unknown> = {}) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      error: error.stack,
      context
    }));
  }
}
```

### 2. デバッグツール

```typescript
// 開発環境でのみ有効なデバッグログ
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", { data, filters, sortOptions });
}

// パフォーマンス測定
const startTime = performance.now();
// ... 処理 ...
const endTime = performance.now();
console.log(`処理時間: ${endTime - startTime}ms`);
```

## デプロイメント

### 1. 環境別設定

```typescript
// 環境変数による設定分岐
const config = {
  database: {
    url: process.env.DATABASE_URL || "sqlite:./dev.db",
    poolSize: parseInt(process.env.DB_POOL_SIZE || "10")
  },
  api: {
    port: parseInt(process.env.PORT || "3000"),
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"]
    }
  }
};
```

### 2. CI/CDパイプライン

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm deploy
```

## トラブルシューティング

### 1. よくある問題

#### 1.1 依存関係の問題

```bash
# 依存関係のクリーンアップ
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 特定パッケージの再インストール
pnpm remove @repo/api
pnpm add @repo/api
```

#### 1.2 型エラーの解決

```typescript
// 型アサーション（必要な場合のみ）
const data = response.data as CattleResponse;

// 型ガードの使用
if (isCattleResponse(response.data)) {
  const cattle = response.data;
  // 型安全な処理
}

// 部分的な型定義
type PartialCattle = Partial<Cattle>;
```

### 2. デバッグのコツ

#### 2.1 ログの活用

```typescript
// 関数の入出力をログ
export function processData(input: Input): Output {
  console.log("Input:", input);
  
  const result = /* 処理 */;
  
  console.log("Output:", result);
  return result;
}
```

#### 2.2 ブレークポイントの設定

```typescript
// デバッガーでのブレークポイント
debugger;

// 条件付きブレークポイント
if (data.length === 0) {
  debugger; // データが空の場合のみ
}
```

## まとめ

このガイドに従うことで、以下のメリットが得られます：

- **一貫性**: 統一されたコーディング規約
- **品質**: テストとレビューによる品質保証
- **保守性**: 明確なアーキテクチャと責任分離
- **セキュリティ**: セキュリティベストプラクティスの適用
- **パフォーマンス**: 最適化手法の活用
