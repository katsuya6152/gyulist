# GyuList API 実装ガイド

## 新機能開発フロー

### 1. コンテキスト作成

新しいドメインコンテキストを追加する場合の手順：

```bash
# 1. ディレクトリ構造作成（Mappers層を含む）
mkdir -p src/contexts/newcontext/{domain/{codecs,errors,model,services},infra/{drizzle,mappers},tests}

# 2. 基本ファイル作成
touch src/contexts/newcontext/{ports.ts,domain/errors.ts}
touch src/contexts/newcontext/domain/{codecs/{input.ts,output.ts},services/example.ts}
touch src/contexts/newcontext/infra/{drizzle/repo.ts,mappers/{dbToDomain.ts,domainToDb.ts}}
touch src/contexts/newcontext/tests/example.test.ts
```

### 2. ポート定義

```typescript
// src/contexts/newcontext/ports.ts
import type { Brand } from "../../shared/brand";

export type NewContextId = Brand<number, "NewContextId">;
export type UserId = Brand<number, "UserId">;

export interface NewContextRepoPort {
  findById(id: NewContextId): Promise<NewContextEntity | null>;
  create(entity: NewContextEntity): Promise<NewContextEntity>;
  update(id: NewContextId, updates: Partial<NewContextEntity>): Promise<NewContextEntity>;
  delete(id: NewContextId): Promise<void>;
}
```

### 3. ドメインエラー定義

```typescript
// src/contexts/newcontext/domain/errors.ts
export type DomainError =
  | { type: "ValidationError"; message: string; field?: string }
  | { type: "NotFound"; message: string; id?: string }
  | { type: "Forbidden"; message: string }
  | { type: "Conflict"; message: string; conflictingField?: string }
  | { type: "InfraError"; message: string; cause?: unknown };
```

### 4. ドメインモデル定義

```typescript
// src/contexts/newcontext/domain/model/entity.ts
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { Brand } from "../../../../shared/brand";
import type { DomainError } from "../errors";

export type NewContextId = Brand<number, "NewContextId">;

export type NewContextEntity = {
  readonly id: NewContextId;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export function createNewContextEntity(input: {
  id: NewContextId;
  name: string;
  createdAt: string;
  updatedAt: string;
}): Result<NewContextEntity, DomainError> {
  // バリデーション
  if (!input.name || input.name.trim().length === 0) {
    return err({
      type: "ValidationError",
      message: "Name is required",
      field: "name"
    });
  }

  if (input.name.length > 100) {
    return err({
      type: "ValidationError", 
      message: "Name must be 100 characters or less",
      field: "name"
    });
  }

  // エンティティ作成
  return ok({
    id: input.id,
    name: input.name.trim(),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
```

### 5. 入出力コーデック定義（統合済み）

```typescript
// src/contexts/newcontext/domain/codecs/input.ts
// 注意: 全てのバリデーションスキーマをこのファイルに統合
import { z } from "zod";

export const createNewContextInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateNewContextInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const searchNewContextInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type CreateNewContextInput = z.infer<typeof createNewContextInputSchema>;
export type UpdateNewContextInput = z.infer<typeof updateNewContextInputSchema>;
export type SearchNewContextInput = z.infer<typeof searchNewContextInputSchema>;

// src/contexts/newcontext/domain/codecs/output.ts
import { z } from "zod";

export const newContextEntitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const newContextListResponseSchema = z.object({
  items: z.array(newContextEntitySchema),
  total: z.number(),
  hasNext: z.boolean(),
});
```

### 6. ユースケース実装

```typescript
// src/contexts/newcontext/domain/services/create.ts
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { DomainError } from "../errors";
import type { NewContextEntity } from "../model/entity";
import { createNewContextEntity } from "../model/entity";
import type { NewContextRepoPort } from "../../ports";
import type { CreateNewContextInput } from "../codecs/input";

type Deps = { 
  repo: NewContextRepoPort; 
  clock: ClockPort;
};

export type CreateNewContextCmd = CreateNewContextInput & {
  ownerUserId: UserId;
};

export const create = (deps: Deps) => async (
  cmd: CreateNewContextCmd
): Promise<Result<NewContextEntity, DomainError>> => {
  const now = deps.clock.now();
  const nowIso = now.toISOString();

  // ドメインロジック
  const entityResult = createNewContextEntity({
    id: 0 as unknown as NewContextId, // DBで採番
    name: cmd.name,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  if (!entityResult.ok) return entityResult;

  // 重複チェック（必要に応じて）
  const existing = await deps.repo.findByName(cmd.name);
  if (existing) {
    return err({
      type: "Conflict",
      message: "Entity with this name already exists",
      conflictingField: "name"
    });
  }

  // 永続化
  try {
    const created = await deps.repo.create(entityResult.value);
    return ok(created);
  } catch (cause) {
    return err({
      type: "InfraError",
      message: "Failed to create entity",
      cause
    });
  }
};
```

### 6A. Mappers層実装（新規要件）

```typescript
// src/contexts/newcontext/infra/mappers/dbToDomain.ts
import type { InferSelectModel } from "drizzle-orm";
import type { newContextTable } from "../../../../db/tables/newcontext";
import type { NewContextEntity, NewContextId } from "../../ports";

type NewContextDbRow = InferSelectModel<typeof newContextTable>;

/**
 * データベース行からドメインモデルに変換
 */
export function toDomain(row: NewContextDbRow): NewContextEntity {
  return {
    id: row.id as unknown as NewContextId,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt ?? new Date(0).toISOString(),
    updatedAt: row.updatedAt ?? new Date(0).toISOString(),
  };
}

/**
 * データベース行の配列をドメインモデルの配列に変換
 */
export function toDomainList(rows: NewContextDbRow[]): NewContextEntity[] {
  return rows.map(toDomain);
}

// src/contexts/newcontext/infra/mappers/domainToDb.ts
import type { InferInsertModel, InferUpdateModel } from "drizzle-orm";
import type { newContextTable } from "../../../../db/tables/newcontext";
import type { NewContextEntity } from "../../ports";
import type { CreateNewContextInput, UpdateNewContextInput } from "../../domain/codecs/input";

/**
 * ドメインモデルからDB挿入モデルに変換
 */
export function toDbInsert(entity: NewContextEntity): InferInsertModel<typeof newContextTable> {
  return {
    name: entity.name,
    description: entity.description,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

/**
 * ドメイン更新モデルからDB更新モデルに変換
 */
export function toDbUpdate(updates: Partial<NewContextEntity>): InferUpdateModel<typeof newContextTable> {
  return {
    name: updates.name,
    description: updates.description,
    updatedAt: updates.updatedAt,
  };
}

/**
 * 入力スキーマからDB挿入モデルに変換
 */
export function fromCreateInput(input: CreateNewContextInput, metadata: { createdAt: string; updatedAt: string }): InferInsertModel<typeof newContextTable> {
  return {
    name: input.name,
    description: input.description ?? null,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}
```

### 7. インフラストラクチャアダプタ実装（Mappers使用）

```typescript
// src/contexts/newcontext/infra/drizzle/repo.ts
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import type { NewContextRepoPort, NewContextId } from "../../ports";
import type { NewContextEntity } from "../../domain/model/entity";
import { newContextTable } from "../../../../db/tables/newcontext";
import { toDomain, toDomainList } from "../mappers/dbToDomain";
import { toDbInsert, toDbUpdate } from "../mappers/domainToDb";

export function makeNewContextRepo(db: AnyD1Database): NewContextRepoPort {
  const dbInstance = drizzle(db);

  return {
    async findById(id: NewContextId): Promise<NewContextEntity | null> {
      const [row] = await dbInstance
        .select()
        .from(newContextTable)
        .where(eq(newContextTable.id, id as number))
        .limit(1);

      return row ? toDomain(row) : null;
    },

    async findByName(name: string): Promise<NewContextEntity | null> {
      const [row] = await dbInstance
        .select()
        .from(newContextTable)
        .where(eq(newContextTable.name, name))
        .limit(1);

      return row ? toDomain(row) : null;
    },

    async create(entity: NewContextEntity): Promise<NewContextEntity> {
      const dbData = toDbInsert(entity);
      const [created] = await dbInstance
        .insert(newContextTable)
        .values(dbData)
        .returning();

      return toDomain(created);
    },

    async update(id: NewContextId, updates: Partial<NewContextEntity>): Promise<NewContextEntity> {
      const dbUpdates = toDbUpdate({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      const [updated] = await dbInstance
        .update(newContextTable)
        .set(dbUpdates)
        .where(eq(newContextTable.id, id as number))
        .returning();

      return toDomain(updated);
    },

    async delete(id: NewContextId): Promise<void> {
      await dbInstance
        .delete(newContextTable)
        .where(eq(newContextTable.id, id as number));
    },

    async search(query: SearchQuery): Promise<SearchResult> {
      const rows = await dbInstance
        .select()
        .from(newContextTable)
        .where(/* search conditions */)
        .limit(query.limit);
      
      return {
        results: toDomainList(rows),
        // ... pagination
      };
    },
  };
}
```

### 8. HTTPルート実装（共通ヘルパー使用）

```typescript
// src/routes/newcontext.ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { create as createUC } from "../contexts/newcontext/domain/services/create";
import { makeNewContextRepo } from "../contexts/newcontext/infra/drizzle/repo";
import { executeUseCase } from "../shared/http/route-helpers";
import { getLogger } from "../shared/logging/logger";
import type { Bindings } from "../types";
import { createNewContextInputSchema } from "../contexts/newcontext/domain/codecs/input";
import { newContextEntitySchema } from "../contexts/newcontext/domain/codecs/output";
import type { UserId } from "../contexts/newcontext/ports";

const app = new Hono<{ Bindings: Bindings }>()
  .use("*", jwtMiddleware)
  
  .post("/", zValidator("json", createNewContextInputSchema), async (c) => {
    const data = c.req.valid("json");
    const userId = c.get("jwtPayload").userId;
    const logger = getLogger(c);

    logger.apiRequest("POST /newcontext", { userId });

    return executeUseCase(c, async () => {
      const deps = {
        repo: makeNewContextRepo(c.env.DB),
        clock: { now: () => new Date() }
      };

      const result = await createUC(deps)({
        ...data,
        ownerUserId: userId as unknown as UserId
      });

      if (!result.ok) return result;
      
      return {
        ok: true,
        value: newContextEntitySchema.parse(result.value)
      } as const;
    });
  });

export default app;
```

### 9. テスト実装（Mappers対応）

```typescript
// src/contexts/newcontext/tests/create.test.ts
import { describe, it, expect, vi } from "vitest";
import { create } from "../domain/services/create";
import type { NewContextRepoPort } from "../ports";
import type { ClockPort } from "../../../shared/ports/clock";

describe("NewContext create use case", () => {
  const mockRepo: NewContextRepoPort = {
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockClock: ClockPort = {
    now: vi.fn().mockReturnValue(new Date("2025-01-01T00:00:00Z"))
  };

  it("should create entity successfully", async () => {
    // Arrange
    vi.mocked(mockRepo.findByName).mockResolvedValue(null);
    vi.mocked(mockRepo.create).mockResolvedValue({
      id: 1 as any,
      name: "Test Entity",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    });

    // Act
    const result = await create({ repo: mockRepo, clock: mockClock })({
      name: "Test Entity",
      ownerUserId: 1 as any,
    });

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Test Entity");
    }
    expect(mockRepo.create).toHaveBeenCalledOnce();
  });

  it("should return conflict error for duplicate name", async () => {
    // Arrange
    vi.mocked(mockRepo.findByName).mockResolvedValue({
      id: 1 as any,
      name: "Existing Entity",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    });

    // Act
    const result = await create({ repo: mockRepo, clock: mockClock })({
      name: "Existing Entity",
      ownerUserId: 1 as any,
    });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("Conflict");
    }
  });

  it("should return validation error for empty name", async () => {
    // Act
    const result = await create({ repo: mockRepo, clock: mockClock })({
      name: "",
      ownerUserId: 1 as any,
    });

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("ValidationError");
      expect(result.error.field).toBe("name");
    }
  });
});
```

## 新機能開発時の注意事項

### Validatorsの統合ルール

1. **全てのバリデーションスキーマを`domain/codecs/input.ts`に配置**
   - トップレベルの`validators/`ディレクトリは使用禁止
   - コンテキスト内で関連スキーマを統合管理

2. **ユーザー関連は別ファイル**
   - 認証コンテキストは`input.ts`と`user.ts`に分離

```typescript
// ✅ 正しい例: contexts/newcontext/domain/codecs/input.ts
export const createSchema = z.object({ /* ... */ });
export const updateSchema = z.object({ /* ... */ });
export const searchSchema = z.object({ /* ... */ });

// ❌ 間違い: validators/newcontextValidator.ts (使用禁止)
```

### Mappers層の必須実装

1. **全コンテキストに`infra/mappers/`を配置**
   - `dbToDomain.ts`: DB→ドメイン変換
   - `domainToDb.ts`: ドメイン→DB変換

2. **RepositoryではMappersを必ず使用**
   - 直接変換は禁止
   - 型安全性と一貫性を保証

```typescript
// ✅ 正しい例
import { toDomain } from "../mappers/dbToDomain";
return row ? toDomain(row) : null;

// ❌ 間違い
return { id: row.id as EntityId, name: row.name }; // 直接変換禁止
```

### 構造化ログの使用

1. **全ルートで`getLogger(c)`を使用**
   - Cloudflare Workers対応済み
   - 環境変数を自動取得

```typescript
// ✅ 正しい例
import { getLogger } from "../shared/logging/logger";
const logger = getLogger(c);
logger.apiRequest("POST /endpoint", { userId });

// ❌ 間違い
console.log("API request"); // 非構造化ログ禁止
```

## 実装ベストプラクティス

### 1. エラーハンドリング

```typescript
// ✅ 良い例: 明示的なエラー型
export type CreateCattleError =
  | { type: "ValidationError"; field: string; message: string }
  | { type: "DuplicateIdentificationNumber"; number: number }
  | { type: "InfraError"; cause: unknown };

// ❌ 悪い例: 汎用的すぎるエラー
export type CreateCattleError = { type: string; message: string };
```

### 2. ドメインロジックの分離

```typescript
// ✅ 良い例: 純関数でドメインロジック
export function calculateAge(birthday: string, now: Date): number | null {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const diffMs = now.getTime() - birthDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}

// ❌ 悪い例: 副作用を含むドメインロジック
export function calculateAge(birthday: string): number | null {
  if (!birthday) return null;
  const now = new Date(); // 副作用
  // ...
}

// ✅ 新規: Mappersでのデータ変換
export function toDomain(row: DbRow): DomainEntity {
  return {
    id: row.id as EntityId,
    name: row.name,
    // 必要な変換処理のみ
    createdAt: row.createdAt ?? new Date(0).toISOString(),
  };
}

// ❌ Mappersでビジネスロジックを含めない
export function toDomain(row: DbRow): DomainEntity {
  const entity = { /* ... */ };
  // ビジネスロジックはドメインサービスで実装
  if (entity.status === 'ACTIVE') { /* ... */ } // NG
  return entity;
}
```

### 3. 依存注入パターン

```typescript
// ✅ 良い例: 明示的な依存
export const updateCattle = (deps: {
  repo: CattleRepoPort;
  clock: ClockPort;
  logger: Logger; // 新規: ロガーも依存注入
}) => async (cmd: UpdateCattleCmd) => {
  deps.logger.info("Updating cattle", { cattleId: cmd.id });
  // ...
};

// ❌ 悪い例: 暗黙的な依存
export async function updateCattle(cmd: UpdateCattleCmd) {
  const repo = getCattleRepo(); // グローバル依存
  const now = new Date(); // 隠れた依存
  console.log("Updating cattle"); // 非構造化ログ
  // ...
}

// ✅ 新規: Routeでの統一エラーハンドリング
import { executeUseCase } from "../shared/http/route-helpers";

app.post("/", async (c) => {
  return executeUseCase(c, async () => {
    const result = await someUseCase(deps)(input);
    if (!result.ok) return result;
    
    return {
      ok: true,
      value: outputSchema.parse(result.value)
    } as const;
  });
});
```

### 4. バリデーション戦略（統合後）

```typescript
// ✅ 良い例: 段階的バリデーション（スキーマ統合後）
export const createCattle = (deps: Deps) => async (cmd: CreateCattleCmd) => {
  // 1. 入力バリデーション（RouteレベルでZodで実施済み）
  // const inputValidation = validateCreateCattleInput(cmd); // 不要

  // 2. ビジネスルールバリデーション
  const businessValidation = await validateBusinessRules(deps, cmd);
  if (!businessValidation.ok) return businessValidation;

  // 3. 実行
  return await executeCattleCreation(deps, cmd);
};

// ✅ 新規: Routeレベルでのバリデーション統合
import { createCattleSchema } from "../contexts/cattle/domain/codecs/input";

app.post("/", zValidator("json", createCattleSchema), async (c) => {
  const data = c.req.valid("json"); // 既にZodでバリデーション済み
  // ユースケースはビジネスロジックに集中
});

// ❌ 旧方式: 分散したバリデーション
import { cattleValidator } from "../validators/cattleValidator"; // 統合済み
```

### 5. テストデータファクトリ

```typescript
// tests/factories/cattle.ts
export function createMockCattle(overrides: Partial<Cattle> = {}): Cattle {
  return {
    cattleId: 1 as CattleId,
    ownerUserId: 1 as UserId,
    identificationNumber: 12345,
    name: "Test Cattle",
    gender: "FEMALE",
    status: "HEALTHY",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides
  };
}

export function createMockCattleRepo(): CattleRepoPort {
  return {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
  };
}
```

## パフォーマンス最適化

### 1. クエリ最適化（Mappers統合後）

```typescript
// ✅ 良い例: 必要な列のみ選択 + Mappers使用
async searchCattleForList(query: SearchQuery): Promise<CattleListItem[]> {
  const rows = await dbInstance
    .select({
      cattleId: cattle.cattleId,
      name: cattle.name,
      identificationNumber: cattle.identificationNumber,
      status: cattle.status,
    })
    .from(cattle)
    .where(buildSearchConditions(query))
    .limit(query.limit)
    .offset(query.offset);
    
  return toDomainList(rows); // Mappers使用
}

// ❌ 悪い例: 全列取得 + 直接変換
async searchCattleForList(query: SearchQuery): Promise<Cattle[]> {
  const rows = await dbInstance
    .select()
    .from(cattle)
    .where(buildSearchConditions(query))
    .limit(query.limit)
    .offset(query.offset);
    
  return rows.map(row => ({ // 直接変換禁止
    id: row.cattleId as CattleId,
    name: row.name,
    // ...
  }));
}
```

### 2. 遅延評価（DI改善後）

```typescript
// ✅ 良い例: 遅延評価 + ログ統合
export function makeDeps(db: AnyD1Database, clock: ClockPort) {
  return {
    get cattleRepo() { return makeCattleRepo(db); },
    get eventsRepo() { return makeEventsRepo(db); },
    clock,
    // ログはコンテキスト毎に作成
  };
}

// ✅ 新規: Routeでのログ統合
app.post("/", async (c) => {
  const logger = getLogger(c); // コンテキストからロガー取得
  logger.apiRequest("POST /cattle", { userId });
  
  const deps = { 
    ...makeDeps(c.env.DB, { now: () => new Date() }),
    logger 
  };
});
```

### 3. バッチ処理

```typescript
// ✅ 良い例: バッチ更新
export const updateMultipleCattleStatus = (deps: Deps) => async (
  commands: UpdateStatusCmd[]
): Promise<Result<void, DomainError>> => {
  const updates = commands.map(cmd => ({
    id: cmd.cattleId,
    status: cmd.newStatus,
    updatedAt: deps.clock.now().toISOString()
  }));

  try {
    await deps.repo.batchUpdate(updates);
    return ok(undefined);
  } catch (cause) {
    return err({ type: "InfraError", message: "Batch update failed", cause });
  }
};
```

## セキュリティガイドライン

### 1. 認可チェック

```typescript
// ✅ 良い例: 明示的な認可チェック
export const updateCattle = (deps: Deps) => async (cmd: UpdateCattleCmd) => {
  // 存在確認
  const existing = await deps.repo.findById(cmd.cattleId);
  if (!existing) {
    return err({ type: "NotFound", message: "Cattle not found" });
  }

  // 認可チェック
  if (existing.ownerUserId !== cmd.requesterUserId) {
    return err({ type: "Forbidden", message: "Not authorized" });
  }

  // 更新処理
  // ...
};
```

### 2. 入力サニタイゼーション

```typescript
// ✅ 良い例: Zodによる厳密なバリデーション
export const cattleNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters")
  .transform(s => s.trim()); // 自動トリム
```

### 3. レート制限

```typescript
// middleware/rateLimit.ts
export const rateLimitMiddleware = (options: {
  windowMs: number;
  maxRequests: number;
}) => async (c: Context, next: Next) => {
  const key = `rate_limit:${c.req.header("cf-connecting-ip")}`;
  const current = await c.env.KV.get(key);
  
  if (current && parseInt(current) >= options.maxRequests) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }
  
  await c.env.KV.put(key, (parseInt(current || "0") + 1).toString(), {
    expirationTtl: options.windowMs / 1000
  });
  
  await next();
};
```

## デバッグ・ログ戦略（統合済み）

### 1. 構造化ログ（Cloudflare Workers対応）

```typescript
// shared/logging/logger.ts
import type { Context } from "hono";

class Logger {
  private isDevelopment: boolean;

  constructor(environment?: string) {
    // Cloudflare Workers環境では process.env が使用不可のため、
    // 環境変数を外部から注入する方式に変更
    this.isDevelopment = environment === 'development';
  }

  info(message: string, context: Record<string, unknown> = {}) {
    this.log('info', message, context);
  }

  error(message: string, error: Error, context: Record<string, unknown> = {}) {
    this.log('error', message, { ...context, error: error.stack });
  }

  apiRequest(message: string, context: Record<string, unknown> = {}) {
    this.log('info', message, { type: 'api_request', ...context });
  }

  private log(level: string, message: string, context: Record<string, unknown>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}

// Context から Logger を作成するヘルパー
export function getLogger(context?: { env?: { ENVIRONMENT?: string } }): Logger {
  return new Logger(context?.env?.ENVIRONMENT);
}

// デフォルトインスタンス（後方互換性のため）
export const logger = new Logger();
```

### 2. エラー追跡（統一ヘルパー使用）

```typescript
// ✅ 良い例: 統一エラーハンドリング + 構造化ログ
export const createCattle = (deps: Deps) => async (cmd: CreateCattleCmd) => {
  try {
    const result = await deps.repo.create(cattle);
    deps.logger.info("Cattle created successfully", { 
      cattleId: result.cattleId,
      userId: cmd.ownerUserId 
    });
    return ok(result);
  } catch (cause) {
    deps.logger.error("Failed to create cattle", 
      cause instanceof Error ? cause : new Error(String(cause)), {
      command: cmd,
      timestamp: deps.clock.now().toISOString()
    });
    return err({ type: "InfraError", message: "Creation failed", cause });
  }
};

// ✅ 新規: Routeレベルでの統一エラーハンドリング
app.post("/", async (c) => {
  return executeUseCase(c, async () => {
    // ユースケース実行
    const result = await createUC(deps)(cmd);
    if (!result.ok) return result; // エラーは自動処理
    
    return { ok: true, value: schema.parse(result.value) } as const;
  }); // executeUseCaseがエラーハンドリングを統一管理
});

// ❌ 旧方式: 分散したエラーハンドリング
try {
  const result = await createUC(deps)(cmd);
  if (!result.ok) {
    c.status(toHttpStatus(result.error));
    return c.json({ error: result.error });
  }
  return c.json(result.value, 201);
} catch (e) {
  console.error(e); // 非構造化ログ
  return c.json({ message: "Internal Server Error" }, 500);
}
```

## 移行・メンテナンス

### 1. データベース移行

```typescript
// migrations/001_add_cattle_status_history.ts
export async function up(db: AnyD1Database) {
  await db.exec(`
    CREATE TABLE cattle_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cattle_id INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_by INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (cattle_id) REFERENCES cattle(cattle_id),
      FOREIGN KEY (changed_by) REFERENCES users(user_id)
    );
    
    CREATE INDEX idx_cattle_status_history_cattle_id 
    ON cattle_status_history(cattle_id);
  `);
}

export async function down(db: AnyD1Database) {
  await db.exec(`DROP TABLE cattle_status_history;`);
}
```

### 2. API バージョニング

```typescript
// routes/v1/cattle.ts
const v1Routes = new Hono()
  .get("/", legacyCattleList)
  .post("/", legacyCattleCreate);

// routes/v2/cattle.ts  
const v2Routes = new Hono()
  .get("/", modernCattleList)
  .post("/", modernCattleCreate);

// index.ts
app.route("/api/v1/cattle", v1Routes);
app.route("/api/v2/cattle", v2Routes);
```

このガイドに従うことで、GyuList APIの一貫性と品質を維持しながら新機能を開発できます。
