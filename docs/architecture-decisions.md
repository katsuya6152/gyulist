# アーキテクチャ決定記録 (Architecture Decision Record)

**Gyulist - 牛群管理システムの技術選定と設計判断の記録**

---

## 📖 概要

このドキュメントは、Gyulist（牛の個体管理アプリ）における重要な技術選定と設計判断を時系列で記録したものです。将来の開発時に「なぜこの実装にしたのか」を理解し、技術的負債の管理や新しい意思決定の参考とするために作成しています。

---

## 🏗️ 現在のアーキテクチャ概要

### システム構成
- **フロントエンド**: Next.js 15 + Container/Presentational パターン
- **バックエンド**: Hono + Functional Domain Modeling (FDM)
- **インフラ**: Cloudflare Pages + Workers + D1
- **開発**: TypeScript + pnpm Workspaces (Monorepo)

### 品質戦略
- **型安全性**: TypeScript strict mode + Brand型 + Zod
- **エラーハンドリング**: Result型 + 統一エラーハンドリング
- **ログ**: 構造化ログシステム
- **テスト**: Vitest + React Testing Library + Playwright

---

## 📅 技術決定の歴史

## ADR-001: 基盤技術選定 (2025年前半)

### 決定内容
- **フロントエンド**: Next.js 15 + React 19
- **バックエンド**: Hono + Cloudflare Workers
- **データベース**: Cloudflare D1 + Drizzle ORM
- **インフラ**: Cloudflare エコシステム

### 背景・理由
#### Next.js 15 + React 19 選定理由
- **App Router**: 最新のNext.jsパターンでSSR/SSG最適化
- **Server Actions**: フォーム処理の簡素化とサーバーサイド重視
- **React 19**: `useActionState`、`startTransition`等の新機能活用
- **Cloudflare Pages**: 静的サイト生成との親和性

#### Hono + Cloudflare Workers 選定理由
- **軽量性**: Express.jsより高速で軽量
- **エッジコンピューティング**: 世界中で低レイテンシー
- **TypeScript First**: 型安全性が標準装備
- **RPC機能**: フロントエンドとの型共有が可能

#### Cloudflare D1 + Drizzle ORM 選定理由
- **SQLite**: 軽量で高速、Workers環境に最適
- **Drizzle**: Prismaより軽量、SQLライクで学習コスト低
- **型安全性**: TypeScriptとの親和性が高い
- **マイグレーション**: 簡単で直感的

### トレードオフ・制約
- **Node.js制約**: bcryptjs使用（bcrypt不可）
- **実行時間**: CPU時間10ms制限
- **React 19**: 新しいため一部ライブラリ互換性に注意
- **D1制約**: PostgreSQL比で機能制限あり

### 成果
- 開発効率の大幅向上
- デプロイ・運用の簡素化
- 世界規模でのパフォーマンス最適化

---

## ADR-002: Functional Domain Modeling (FDM) 導入 (2025年8月)

### 決定内容
従来のレイヤードアーキテクチャから **Functional Domain Modeling (FDM)** + **ヘキサゴナルアーキテクチャ** に移行

### 背景・課題
```typescript
// 従来のアプローチ（問題点）
export async function createCattle(req, res) {
  try {
    // ビジネスロジックとインフラが混在
    const cattle = await db.insert(cattleTable).values(data);
    res.json(cattle); // HTTPレスポンスとドメインロジックが結合
  } catch (error) {
    res.status(500).json({ error }); // エラーハンドリングが散在
  }
}
```

**問題点**:
- ビジネスロジックとインフラの混在
- テストが困難（DBやHTTPに依存）
- エラーハンドリングの重複・不統一
- 責務の境界が不明確

### FDM導入後の設計

#### ディレクトリ構造
```
contexts/[domain]/
├── domain/              # ドメインロジック（純粋関数）
│   ├── services/        # ユースケース
│   ├── model/          # ドメインモデル
│   └── codecs/         # 入出力変換
├── infra/              # インフラ実装
│   ├── drizzle/        # DB実装
│   └── mappers/        # データ変換
├── presentation/       # HTTP層
├── ports.ts           # インターフェース定義
└── tests/             # ドメイン固有テスト
```

#### 実装パターン
```typescript
// FDMアプローチ（改善後）
export function createCattle(deps: CattleDeps) {
  return async (input: CreateCattleInput): Promise<Result<CattleId, CattleError>> => {
    // 純粋なビジネスロジック
    const validation = validateCattleData(input);
    if (!validation.ok) return validation;
    
    const cattleId = await deps.repo.create(input);
    return { ok: true, value: cattleId };
  };
}

// HTTP層（責務分離）
.post("/", zValidator("json", CreateCattleSchema), async (c) => {
  const input = c.req.valid("json");
  const deps = makeCattleDeps(c.env.DB, clock);
  
  return executeUseCase(c, async () => {
    const result = await createCattle(deps)(input);
    if (!result.ok) return result;
    return { ok: true, value: { cattleId: result.value } };
  });
})
```

### 導入理由
1. **テスタビリティ**: ドメインロジックが純粋関数でテスト容易
2. **関心の分離**: ビジネスロジック・インフラ・HTTP層の明確な分離
3. **保守性**: 変更影響範囲の局所化
4. **型安全性**: Result型による明示的エラーハンドリング
5. **再利用性**: ドメインロジックの他コンテキストでの再利用

### 成果
- **テストカバレッジ向上**: ドメインロジックの単体テストが容易
- **バグ削減**: 型安全性とResult型による例外の明示化
- **開発効率**: 責務分離による並行開発の促進
- **保守性**: 変更時の影響範囲の予測可能性

---

## ADR-003: Result型エラーハンドリング統一 (2025年1月)

### 決定内容
例外ベースのエラーハンドリングから **Result型** による明示的エラーハンドリングに統一

### 背景・課題
```typescript
// 従来のアプローチ（問題点）
export async function getCattle(id: string) {
  try {
    const cattle = await repo.findById(id);
    if (!cattle) {
      throw new Error("Cattle not found"); // 例外による制御フロー
    }
    return cattle;
  } catch (error) {
    console.error(error); // エラーログの不統一
    throw error; // エラーの再スロー
  }
}
```

**問題点**:
- エラーが型システムで表現されない
- try-catchの重複・不統一
- エラーハンドリングの責務が散在
- デバッグ時のエラー追跡が困難

### Result型導入後
```typescript
// 改善後のアプローチ
export type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export async function getCattle(id: CattleId): Promise<Result<Cattle, CattleError>> {
  const cattle = await repo.findById(id);
  if (!cattle) {
    return { ok: false, error: { type: "NotFound", message: "牛が見つかりません" } };
  }
  return { ok: true, value: cattle };
}
```

### 統一エラーハンドリングシステム
```typescript
// shared/http/route-helpers.ts
export async function executeUseCase<T, E>(
  c: Context,
  useCase: () => Promise<Result<T, E>>
): Promise<Response> {
  try {
    const result = await useCase();
    return await handleResult(c, result);
  } catch (error) {
    return handleUnexpectedError(c, error);
  }
}
```

### 導入理由
1. **型安全性**: エラーが型システムで表現される
2. **明示性**: エラーハンドリングが必須となる
3. **一貫性**: 全APIで統一されたエラーレスポンス
4. **デバッグ性**: エラーの発生箇所と種類が明確
5. **関数型プログラミング**: 副作用の明示化

### 成果
- **バグ削減**: エラーケースの見落としが激減
- **開発効率**: エラーハンドリングの標準化
- **運用性**: エラーログの構造化と追跡性向上

---

## ADR-004: 構造化ログシステム導入 (2025年8月) - Cloudflare Workers対応

### 決定内容
`console.log` ベースのログから **構造化ログシステム** に移行（Cloudflare Workers環境対応）

### 背景・課題
```typescript
// 従来のアプローチ（問題点）
console.log("User created:", userId);
console.error("Failed to create user:", error);
```

**問題点**:
- ログ形式の不統一
- 本番環境での検索・分析困難
- コンテキスト情報の不足
- ログレベルの不適切な使用
- **Cloudflare Workers環境で`process.env`が使用不可**

### 構造化ログ導入後（環境対応済み）
```typescript
// shared/logging/logger.ts
class Logger {
  private isDevelopment: boolean;

  constructor(environment?: string) {
    // Cloudflare Workers環境では process.env が使用不可のため、
    // 環境変数を外部から注入する方式に変更
    this.isDevelopment = environment === 'development';
  }

  apiRequest(message: string, context: Record<string, unknown> = {}) {
    this.log('info', message, { type: 'api_request', ...context });
  }

  unexpectedError(message: string, error: Error, context: Record<string, unknown> = {}) {
    this.log('error', message, { ...context, error: error.stack });
  }
}

// Context から Logger を作成するヘルパー
export function getLogger(context?: { env?: { ENVIRONMENT?: string } }): Logger {
  return new Logger(context?.env?.ENVIRONMENT);
}

// 使用例
const logger = getLogger(c);
logger.apiRequest('POST /cattle', { userId, cattleId });
```

### 環境別ログ形式
```typescript
// 開発環境: 読みやすい形式
[INFO] POST /cattle { userId: 123, cattleId: 456 }

// 本番環境: JSON形式（ログ分析ツール向け）
{"timestamp":"2025-01-15T10:30:00.000Z","level":"info","message":"POST /cattle","context":{"type":"api_request","userId":123,"cattleId":456}}
```

### 導入理由
1. **運用性**: 本番環境でのログ検索・分析が容易
2. **デバッグ効率**: コンテキスト情報による問題特定の迅速化
3. **監視**: 構造化データによるアラート・メトリクス作成
4. **一貫性**: 統一されたログ形式による品質向上
5. **環境対応**: Cloudflare Workersでの安定動作
6. **統合**: HTTP共通処理との連携

### 成果
- **障害対応時間短縮**: 構造化ログによる迅速な問題特定
- **運用品質向上**: 統一されたログによる監視・アラート
- **開発効率**: デバッグ時の情報充実
- **環境安定性**: Cloudflare Workersでのローカル開発が安定化
- **全API統合**: 174テスト全成功での品質保証

---

## ADR-005: 型安全キャストシステム導入 (2025年8月)

### 決定内容
危険な型キャスト（`as any`等）を **Brand型** + **型安全キャスト関数** に置換

### 背景・課題
```typescript
// 従来のアプローチ（問題点）
const userId = Number(id) as UserId; // 危険なキャスト
const cattleId = req.params.id as number; // 型安全性の欠如
```

**問題点**:
- ランタイムエラーの潜在的リスク
- 型安全性の欠如
- バリデーションの重複・不統一
- デバッグ時のエラー追跡困難

### 型安全キャスト導入後
```typescript
// shared/types/safe-cast.ts
export function toUserId(value: number | string): UserId {
  const numValue = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (Number.isNaN(numValue) || numValue <= 0) {
    throw new Error(`Invalid UserId: ${value}`);
  }
  return numValue as UserId;
}

export function extractUserId(jwtPayload: { userId: number }): UserId {
  return toUserId(jwtPayload.userId);
}

// Result型パターン
export function tryCastUserId(value: unknown): SafeCastResult<UserId> {
  try {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return { success: false, error: `Expected number or string, got ${typeof value}` };
    }
    return { success: true, value: toUserId(value) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### Brand型の活用
```typescript
// Brand型による型安全性強化
type UserId = number & { readonly __brand: "UserId" };
type CattleId = number & { readonly __brand: "CattleId" };

// 型レベルでの間違い防止
function updateCattle(cattleId: CattleId, ownerId: UserId) {
  // cattleIdとownerIdを間違えるとコンパイルエラー
}
```

### 導入理由
1. **ランタイム安全性**: 無効な値での実行時エラーを防止
2. **型安全性**: Brand型による型レベルでの間違い防止
3. **一貫性**: 統一されたキャスト方法
4. **デバッグ性**: エラー時の詳細情報提供
5. **保守性**: キャスト処理の集約による変更容易性

### 成果
- **バグ削減**: 型関連のランタイムエラーが激減
- **開発効率**: 型安全性による早期エラー発見
- **保守性**: キャスト処理の一元管理

---

## ADR-006: Container/Presentational パターン採用 (2024年後半)

### 決定内容
Next.js Web Frontend で **Container/Presentational パターン** を採用

### 背景・課題
```typescript
// 従来のアプローチ（問題点）
export default function CattlePage({ params }: { params: { id: string } }) {
  const [cattle, setCattle] = useState<Cattle>();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // データ取得ロジックがコンポーネントに混在
    fetchCattle(params.id).then(setCattle).finally(() => setLoading(false));
  }, [params.id]);

  // UIロジックとデータ取得ロジックが混在
  if (loading) return <div>Loading...</div>;
  return <div>{cattle?.name}</div>;
}
```

**問題点**:
- データ取得とUI表示の責務混在
- Server Componentsの活用不足
- テストが困難
- 再利用性の低さ

### Container/Presentational導入後
```typescript
// Container Component (Server Component)
export default async function CattleDetailContainer({ id }: { id: string }) {
  try {
    const cattle = await GetCattleDetail(id);
    return <CattleDetailPresentation cattle={cattle} />;
  } catch (error) {
    console.error("Failed to fetch cattle:", error);
    return (
      <CattleDetailPresentation
        cattle={undefined}
        error="牛の情報の取得に失敗しました"
      />
    );
  }
}

// Presentational Component (Client Component)
"use client";
export default function CattleDetailPresentation({ cattle, error }: Props) {
  if (error) return <ErrorDisplay message={error} />;
  if (!cattle) return <LoadingSpinner />;
  
  return (
    <div className="space-y-6">
      <CattleBasicInfo cattle={cattle} />
      <CattleBreedingInfo cattle={cattle} />
    </div>
  );
}
```

### ディレクトリ構造
```
features/[feature]/[operation]/
├── container.tsx          # Server Component（データ取得）
├── presentational.tsx     # Client Component（UI）
├── actions.ts             # Server Actions（フォーム処理）
├── schema.ts              # Zod スキーマ
└── __tests__/             # テストファイル
```

### 導入理由
1. **責務分離**: データ取得とUI表示の明確な分離
2. **Server-First**: Server Componentsの最大活用
3. **テスタビリティ**: 各層での独立したテスト
4. **パフォーマンス**: サーバーサイドでのデータ取得最適化
5. **保守性**: 関心事の分離による変更影響の局所化

### 成果
- **パフォーマンス向上**: Server Componentsによる初期表示高速化
- **開発効率**: 責務分離による並行開発
- **テスト品質**: 各層での独立したテスト実装

---

## ADR-007: 共通ユーティリティシステム構築 (2025年1月)

### 決定内容
重複したコードパターンを **共通ユーティリティ** として集約

### 実装された共通システム

#### 1. リクエスト処理ユーティリティ
```typescript
// shared/utils/request-helpers.ts
export function getRequestInfo(c: Context) {
  const method = c.req.method;
  const url = new URL(c.req.url);
  const endpoint = url.pathname;
  const requestId = generateRequestId();
  
  return { method, endpoint, requestId, userAgent, ip };
}

export function getPaginationParams(c: Context, defaultLimit = 20): PaginationParams {
  const page = Math.max(1, getQueryParamAsNumber(c, 'page') || 1);
  const limit = Math.min(maxLimit, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}
```

#### 2. データ変換ユーティリティ
```typescript
// shared/utils/data-helpers.ts
export class CsvBuilder {
  private headers: string[];
  private rows: string[][];

  constructor(headers: string[]) {
    this.headers = headers;
    this.rows = [];
  }

  addRow(row: (string | number | null | undefined)[]): void {
    const escapedRow = row.map(cell => this.escapeCsvCell(cell));
    this.rows.push(escapedRow);
  }

  buildWithBom(): Uint8Array {
    const csvContent = this.build();
    const encoder = new TextEncoder();
    const content = encoder.encode(csvContent);
    
    // UTF-8 BOM を追加
    return new Uint8Array([0xef, 0xbb, 0xbf, ...content]);
  }
}
```

### 導入理由
1. **DRY原則**: 重複コードの削減
2. **保守性**: 共通処理の一元管理
3. **品質向上**: 共通ロジックのテスト・改善
4. **開発効率**: 再利用可能なユーティリティ
5. **一貫性**: 統一された処理パターン

### 成果
- **コード削減**: 重複処理の大幅削減
- **品質向上**: 共通処理の集約によるバグ削減
- **開発効率**: 新機能開発時の実装時間短縮

---

## 🎯 現在のアーキテクチャの強み

### 1. **型安全性の徹底**
- TypeScript strict mode
- Brand型による型レベル安全性
- Zod による実行時バリデーション
- Result型による明示的エラーハンドリング

### 2. **関心の分離**
- FDM によるドメイン・インフラ分離
- Container/Presentational による責務分離
- ポート&アダプタによる依存関係の制御

### 3. **運用性の向上**
- 構造化ログによる障害対応効率化
- 統一エラーハンドリングによる一貫した品質
- 型安全キャストによるランタイムエラー削減

### 4. **開発効率の最適化**
- 共通ユーティリティによる重複削減
- 統一されたパターンによる学習コスト削減
- 包括的なドキュメント体系

---

## 🔮 将来の検討事項

### 短期的な改善 (3-6ヶ月)

#### 1. **監視・観測性強化**
- **課題**: 本番環境での障害検知・分析能力不足
- **検討**: Sentry, DataDog, New Relic等の導入
- **優先度**: 高

#### 2. **セキュリティ強化**
- **課題**: CSRFトークン、レート制限未実装
- **検討**: セキュリティヘッダー、入力値サニタイゼーション強化
- **優先度**: 高

#### 3. **パフォーマンス監視**
- **課題**: Core Web Vitals、API レスポンス時間の継続監視
- **検討**: Real User Monitoring (RUM) 導入
- **優先度**: 中

### 中期的な変更可能性 (6-12ヶ月)

#### 1. **データベース拡張**
- **現在**: Cloudflare D1 (SQLite)
- **検討**: PostgreSQL (Neon, Supabase, PlanetScale)
- **理由**: より高度なクエリ、JSONB型、全文検索、分析機能
- **移行戦略**: Drizzle ORMによる段階的移行

#### 2. **認証システム強化**
- **現在**: 自前JWT実装
- **検討**: Auth0, Clerk, Supabase Auth
- **理由**: 2FA, OAuth, パスワードリセット, セッション管理
- **移行戦略**: 段階的移行でダウンタイム最小化

#### 3. **リアルタイム機能**
- **現在**: 静的データ表示
- **検討**: WebSocket, Server-Sent Events
- **理由**: リアルタイム通知、協調作業機能
- **技術**: Cloudflare Durable Objects, WebSocket API

### 長期的な進化 (12ヶ月以降)

#### 1. **マイクロサービス化**
- **現在**: モノリシック API
- **検討**: ドメイン境界でのサービス分割
- **理由**: スケーラビリティ、チーム分割、技術選択の自由度
- **課題**: 複雑性増加、データ整合性、運用コスト

#### 2. **モバイルアプリ対応**
- **現在**: Web PWA
- **検討**: React Native, Flutter
- **理由**: ネイティブ機能活用、オフライン対応
- **戦略**: API First設計の活用

#### 3. **AI・ML機能統合**
- **検討**: 繁殖予測、健康状態分析、画像認識
- **技術**: Cloudflare AI, OpenAI API
- **データ**: 蓄積された牛群データの活用

---

## ⚠️ 技術的制約・注意点

### Cloudflare Workers 制約
- **CPU時間制限**: 10ms（通常）/ 50ms（Unbound）
- **メモリ制限**: 128MB
- **Node.js互換性**: 限定的（bcryptjs使用）
- **ファイルシステム**: 使用不可

### Next.js App Router 注意点
- **Server/Client Component**: `"use client"`の適切な配置
- **Hydration**: サーバー・クライアント間の状態不整合に注意
- **キャッシング**: App Routerの複雑なキャッシング戦略

### 型安全性の限界
- **外部API**: 外部サービスのレスポンス型保証なし
- **ランタイム**: Zodバリデーション必須
- **パフォーマンス**: 過度な型チェックによる実行時コスト

---

## 📚 学習・参考資料

### アーキテクチャパターン
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Functional Domain Modeling](https://pragprog.com/titles/swdddf/domain-modeling-made-functional/)
- [Container/Presentational Pattern](https://www.patterns.dev/react/presentational-container-pattern)

### 技術ドキュメント
- [Next.js App Router](https://nextjs.org/docs/app)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Conform](https://conform.guide/)

### 品質・テスト
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)
- [Vitest Guide](https://vitest.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**最終更新**: 2025年8月  
**バージョン**: 3.0 (FDM + Mappers統一 + バリデーション統合 + プレゼンテーション層統一対応)  