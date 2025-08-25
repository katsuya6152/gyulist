# GyuList API アーキテクチャガイド

## 概要

GyuList APIは**関数型ドメインモデリング（Functional Domain Modeling, FDM）**とヘキサゴナルアーキテクチャ（ポート&アダプタパターン）を採用した、牛の個体管理システムのバックエンドAPIです。

## アーキテクチャ原則

### 1. 関数型ドメインモデリング（FDM）

```typescript
// ❌ 従来の例外ベースアプローチ
async function createCattle(data: CreateCattleInput): Promise<Cattle> {
  if (!data.name) throw new Error("Name is required");
  const cattle = await cattleRepository.create(data);
  return cattle;
}

// ✅ FDMアプローチ
async function createCattle(deps: CreateDeps) => 
  async (cmd: CreateCattleCmd): Promise<Result<Cattle, DomainError>> => {
    const validation = validateCreateCommand(cmd);
    if (!validation.ok) return validation;
    
    const cattle = await deps.repo.create(cmd);
    return ok(cattle);
  }
```

**原則:**
- **純関数**: 副作用なし、例外なし
- **Result型**: `Result<T, E>`で成功・失敗を表現
- **依存注入**: 外部依存はポート経由で注入
- **型安全性**: Brand型とZodによる厳密な型チェック

### 2. ヘキサゴナルアーキテクチャ

```
┌─────────────────────────────────────────────┐
│                HTTP Layer                    │
│  (routes/, middleware/, validators/)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              Domain Layer                    │
│     (contexts/*/domain/services/)            │
│  ┌─────────────────────────────────────────┐ │
│  │         Use Cases                       │ │
│  │  - Pure Functions                       │ │
│  │  - Business Logic                       │ │
│  │  - Result<T, E> Return                  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────┘
                  │ (Ports)
┌─────────────────▼────────────────────────────┐
│            Infrastructure Layer              │
│     (contexts/*/infra/drizzle/)              │
│  ┌─────────────────────────────────────────┐ │
│  │         Adapters                        │ │
│  │  - Database Access                      │ │
│  │  - External Services                    │ │
│  │  - Time, ID Generation                  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## ディレクトリ構造

```
apps/api/src/
├── contexts/                    # ドメインコンテキスト
│   ├── cattle/                 # 牛管理コンテキスト
│   │   ├── domain/
│   │   │   ├── codecs/         # Zod入出力スキーマ
│   │   │   │   ├── input.ts    # 入力バリデーション
│   │   │   │   └── output.ts   # 出力シリアライゼーション
│   │   │   ├── errors.ts       # ドメインエラー定義
│   │   │   ├── model/          # ドメインモデル
│   │   │   │   └── cattle.ts   # エンティティ・値オブジェクト
│   │   │   └── services/       # ユースケース
│   │   │       ├── create.ts   # 牛作成
│   │   │       ├── update.ts   # 牛更新
│   │   │       ├── delete.ts   # 牛削除
│   │   │       ├── search.ts   # 牛検索
│   │   │       └── updateStatus.ts # ステータス更新
│   │   ├── infra/
│   │   │   ├── drizzle/
│   │   │   │   └── repo.ts     # Drizzleアダプタ
│   │   │   └── mappers/        # DB↔ドメイン変換層
│   │   │       ├── dbToDomain.ts # DB→ドメイン変換
│   │   │       └── domainToDb.ts # ドメイン→DB変換
│   │   ├── ports.ts            # ポートインターフェース
│   │   └── tests/              # ドメインテスト
│   ├── events/                 # イベント管理
│   │   ├── domain/codecs/      # バリデーション統合済み
│   │   ├── infra/mappers/      # データ変換層統合済み
│   │   └── infra/drizzle/      # Drizzleアダプタ
│   ├── auth/                   # 認証・ユーザー管理
│   │   ├── domain/codecs/      # バリデーション統合済み
│   │   │   ├── input.ts        # 認証関連入力
│   │   │   └── user.ts         # ユーザー関連入力
│   │   └── infra/mappers/      # データ変換層統合済み
│   ├── alerts/                 # アラート
│   │   └── infra/mappers/      # データ変換層準備済み
│   ├── kpi/                    # KPI・指標
│   │   └── infra/mappers/      # データ変換層準備済み
│   └── registration/           # 事前登録
│       ├── domain/codecs/      # バリデーション統合済み
│       └── infra/mappers/      # データ変換層準備済み
├── shared/                     # 共通基盤
│   ├── result.ts              # Result<T, E>型
│   ├── brand.ts               # Brand型定義
│   ├── logging/               # 構造化ログ
│   │   └── logger.ts          # Cloudflare Workers対応
│   ├── http/                  # HTTP共通処理
│   │   ├── error-mapper.ts    # ドメインエラー→HTTPステータス
│   │   └── route-helpers.ts   # 共通ルートヘルパー
│   ├── types/                 # 型安全性ユーティリティ
│   │   └── safe-cast.ts       # Brand型キャスト
│   ├── utils/                 # 共通ユーティリティ
│   │   ├── data-helpers.ts    # データ変換・操作
│   │   └── request-helpers.ts # リクエスト処理
│   ├── ports/                 # 共通ポート
│   │   ├── clock.ts          # 時刻抽象化
│   │   ├── id.ts             # ID生成抽象化
│   │   └── token.ts          # JWT抽象化
│   └── config/
│       └── di.ts             # 依存注入設定
├── routes/                    # HTTPルーティング
├── middleware/               # HTTPミドルウェア
└── lib/                      # ユーティリティ
```

## 実装パターン

### 1. ユースケース実装パターン

```typescript
// application/use-cases/cattle/create.ts
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { ClockPort } from "../../../shared/ports/clock";
import type { DomainError } from "../../domain/errors/cattle";
import type { Cattle } from "../../domain/types/cattle";
import { createCattle } from "../../domain/functions/cattle";
import type { CattleRepoPort } from "../../domain/ports/cattle";
import type { NewCattleInput } from "../schemas/cattle";

type Deps = { 
  repo: CattleRepoPort; 
  clock: ClockPort 
};

export type CreateCattleCmd = NewCattleInput;

export const create = (deps: Deps) => async (
  cmd: CreateCattleCmd
): Promise<Result<Cattle, DomainError>> => {
  const now = deps.clock.now();
  
  // ドメインロジック（純関数）
  const cattleResult = createCattle({
    ...cmd,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
  
  if (!cattleResult.ok) return cattleResult;
  
  // インフラストラクチャ操作
  try {
    const created = await deps.repo.create(cattleResult.value);
    return ok(created);
  } catch (cause) {
    return err({ 
      type: "InfraError", 
      message: "Failed to create cattle", 
      cause 
    });
  }
};
```

### 2. ポートインターフェース定義

```typescript
// domain/ports/cattle.ts
import type { Brand } from "../../shared/brand";
import type { Cattle } from "../types/cattle";

export type CattleId = Brand<number, "CattleId">;
export type UserId = Brand<number, "UserId">;

export interface CattleRepoPort {
  findById(id: CattleId): Promise<Cattle | null>;
  create(cattle: Cattle): Promise<Cattle>;
  update(id: CattleId, updates: Partial<Cattle>): Promise<Cattle>;
  delete(id: CattleId): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult>;
}
```

### 3. インフラストラクチャアダプタ

```typescript
// infrastructure/database/repositories/cattle.ts
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import type { CattleRepoPort, CattleId } from "../../domain/ports/cattle";
import type { Cattle } from "../../domain/types/cattle";
import { toDomain } from "../mappers/cattle";
import { toDbInsert, toDbUpdate } from "../mappers/cattle";
import { cattle } from "../../db/schema";

export function makeCattleRepo(db: AnyD1Database): CattleRepoPort {
  const dbInstance = drizzle(db);
  
  return {
    async findById(id: CattleId): Promise<Cattle | null> {
      const [row] = await dbInstance
        .select()
        .from(cattle)
        .where(eq(cattle.cattleId, id as number))
        .limit(1);
      
      return row ? toDomain(row) : null;
    },
    
    async create(cattleData: Cattle): Promise<Cattle> {
      const dbData = toDbInsert(cattleData);
      const [created] = await dbInstance
        .insert(cattle)
        .values(dbData)
        .returning();
      
      return toDomain(created);
    },
    
    async update(id: CattleId, updates: Partial<Cattle>): Promise<Cattle> {
      const dbUpdates = toDbUpdate(updates);
      const [updated] = await dbInstance
        .update(cattle)
        .set(dbUpdates)
        .where(eq(cattle.cattleId, id as number))
        .returning();
      
      return toDomain(updated);
    },
    
    // ... 他のメソッド
  };
}
```

### 4. HTTPルート実装

```typescript
// routes/cattle.ts
import { Hono } from "hono";
import { create as createUC } from "../contexts/cattle/domain/services/create";
import { makeDeps } from "../shared/config/di";
import { executeUseCase, handleResult } from "../shared/http/route-helpers";
import { cattleResponseSchema } from "../contexts/cattle/domain/codecs/output";
import { createCattleSchema } from "../contexts/cattle/domain/codecs/input";
import { getLogger } from "../shared/logging/logger";

const app = new Hono<{ Bindings: Bindings }>()
  .post("/", zValidator("json", createCattleSchema), async (c) => {
    const data = c.req.valid("json");
    const userId = c.get("jwtPayload").userId;
    const logger = getLogger(c);

    logger.apiRequest("POST /cattle", { userId });

    return executeUseCase(c, async () => {
      // 依存注入
      const deps = makeDeps(c.env.DB, { now: () => new Date() });
      
      // ユースケース実行
      const result = await createUC({ 
        repo: deps.cattleRepo, 
        clock: deps.clock 
      })({
        ...data,
        ownerUserId: userId as unknown as UserId
      });

      if (!result.ok) return result;
      
      return {
        ok: true,
        value: cattleResponseSchema.parse(result.value)
      } as const;
    });
  });
```

## 型安全性の仕組み

### 1. Brand型による型安全なID

```typescript
// shared/brand.ts
export type Brand<T, B> = T & { readonly __brand: B };

// 使用例
export type CattleId = Brand<number, "CattleId">;
export type UserId = Brand<number, "UserId">;

// コンパイル時に型エラーで防げる
function updateCattle(cattleId: CattleId, userId: UserId) {
  // cattleId と userId を間違えて渡すとコンパイルエラー
}
```

### 2. Result型による明示的エラーハンドリング

```typescript
// shared/result.ts
export type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => 
  ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => 
  ({ ok: false, error });

// 使用例
const result = await createCattle(data);
if (!result.ok) {
  // エラーハンドリング必須（コンパイラが強制）
  console.error(result.error);
  return;
}
// 成功時のみここに到達
const cattle = result.value;
```

### 3. Zodによる入出力バリデーション

```typescript
// contexts/cattle/domain/codecs/input.ts
import { z } from "zod";
import { CATTLE_GENDER_TUPLE, CATTLE_STATUS_TUPLE } from "../../../../constants/cattle";

export const newCattleInputSchema = z.object({
  identificationNumber: z.number().positive(),
  earTagNumber: z.number().nullable(),
  name: z.string().min(1).nullable(),
  gender: z.enum(CATTLE_GENDER_TUPLE).nullable(),
  birthday: z.string().datetime().nullable(),
  // ...
});

export type NewCattleInput = z.infer<typeof newCattleInputSchema>;

// contexts/cattle/domain/codecs/output.ts
export const cattleResponseSchema = z.object({
  cattleId: z.number(),
  ownerUserId: z.number(),
  identificationNumber: z.number(),
  name: z.string().nullable(),
  // ...
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

## エラーハンドリング戦略

### 1. ドメインエラー定義

```typescript
// contexts/cattle/domain/errors.ts
export type DomainError =
  | { type: "ValidationError"; message: string; field?: string }
  | { type: "NotFound"; message: string; id?: string }
  | { type: "Forbidden"; message: string }
  | { type: "Conflict"; message: string; conflictingField?: string }
  | { type: "InfraError"; message: string; cause?: unknown };
```

### 2. HTTPステータスマッピング

```typescript
// shared/http/error-mapper.ts
import type { DomainError } from "../contexts/cattle/domain/errors";

export function toHttpStatus(error: DomainError): number {
  switch (error.type) {
    case "ValidationError": return 400;
    case "NotFound": return 404;
    case "Forbidden": return 403;
    case "Conflict": return 409;
    case "InfraError": return 500;
    default: return 500;
  }
}
```

## テスト戦略

### 1. ドメインテスト（単体テスト）

```typescript
// contexts/cattle/tests/services.create.test.ts
import { describe, it, expect, vi } from "vitest";
import { create } from "../domain/services/create";
import type { CattleRepoPort } from "../ports";
import type { ClockPort } from "../../../shared/ports/clock";

describe("Cattle create use case", () => {
  it("should create cattle successfully", async () => {
    // Arrange
    const mockRepo: CattleRepoPort = {
      create: vi.fn().mockResolvedValue(mockCattle),
      // ...
    };
    const mockClock: ClockPort = {
      now: vi.fn().mockReturnValue(new Date("2025-01-01T00:00:00Z"))
    };
    
    // Act
    const result = await create({ repo: mockRepo, clock: mockClock })({
      identificationNumber: 123,
      name: "Test Cattle"
    });
    
    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Test Cattle");
    }
  });
});
```

### 2. E2Eテスト

```typescript
// tests/e2e/cattle.e2e.test.ts
import { describe, it, expect } from "vitest";
import app from "../../src/index";

describe("Cattle API E2E", () => {
  it("POST /cattle creates new cattle", async () => {
    const response = await app.request("/cattle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${validToken}`
      },
      body: JSON.stringify({
        identificationNumber: 123,
        name: "Test Cattle"
      })
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe("Test Cattle");
  });
});
```

## パフォーマンス考慮事項

### 1. 遅延読み込み

```typescript
// 重いアダプタは遅延作成
export function makeDeps(db: AnyD1Database, clock: ClockPort) {
  return {
    get cattleRepo() { return makeCattleRepo(db); }, // 遅延評価
    clock
  };
}
```

### 2. クエリ最適化

```typescript
// 必要な列のみ選択
async findForList(): Promise<CattleListItem[]> {
  return dbInstance
    .select({
      cattleId: cattle.cattleId,
      name: cattle.name,
      status: cattle.status
    })
    .from(cattle)
    .limit(100);
}
```

## セキュリティ考慮事項

### 1. 認可チェック

```typescript
export const update = (deps: Deps) => async (cmd: UpdateCattleCmd) => {
  // 所有者チェック
  const existing = await deps.repo.findById(cmd.id);
  if (!existing) return err({ type: "NotFound", message: "Cattle not found" });
  
  if (existing.ownerUserId !== cmd.requesterUserId) {
    return err({ type: "Forbidden", message: "Not authorized to update this cattle" });
  }
  
  // 更新処理
  // ...
};
```

### 2. 入力サニタイゼーション

```typescript
// Zodスキーマで自動的にサニタイゼーション
export const cattleNameSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in name");
```

## デプロイメント・運用

### 1. 環境分離

```typescript
// 環境別設定
const config = {
  development: {
    database: "local.db",
    logLevel: "debug"
  },
  production: {
    database: process.env.DATABASE_URL,
    logLevel: "info"
  }
};
```

### 2. ヘルスチェック

```typescript
// routes/health.ts
export const healthCheck = async (c: Context) => {
  try {
    // DB接続確認
    await c.env.DB.prepare("SELECT 1").first();
    return c.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    return c.json({ status: "unhealthy", error: error.message }, 503);
  }
};
```

## まとめ

GyuList APIのFDMアーキテクチャは以下の利点を提供します：

- **型安全性**: Brand型とZodによる厳密な型チェック
- **保守性**: 関心の分離とポート&アダプタパターン
- **テスタビリティ**: 純関数とモックによる単体テスト
- **拡張性**: 新しいコンテキストの追加が容易
- **堅牢性**: Result型による明示的エラーハンドリング

このアーキテクチャにより、複雑な畜産業務ドメインを整理された形で実装し、長期的な保守性を確保しています。
