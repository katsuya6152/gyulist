# GyuList API 実装ガイド

## 概要

このガイドは、GyuList APIの実装における現在のアーキテクチャパターンとベストプラクティスを説明します。

## アーキテクチャ概要

現在のAPIは以下のレイヤー構造を採用しています：

```
HTTP Layer (Controllers)
    ↓
Application Layer (Use Cases)
    ↓
Domain Layer (Entities, Functions, Ports)
    ↓
Infrastructure Layer (Repositories, Database)
```

## 新機能開発フロー

### 1. ドメイン層の作成

#### 1.1 ドメイン型の定義

```typescript
// src/domain/types/newfeature/index.ts
export type {
  NewFeature,
  NewFeatureProps,
  CreateNewFeatureInput
} from "./NewFeature";

export {
  createNewFeatureSchema,
  updateNewFeatureSchema,
  newFeatureResponseSchema
} from "./schemas";
```

#### 1.2 ドメインエンティティの定義

```typescript
// src/domain/types/newfeature/NewFeature.ts
import type { NewFeatureId, UserId } from "../../../shared/brand";

export type NewFeature = Readonly<{
  id: NewFeatureId;
  ownerUserId: UserId;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}>;

export type NewFeatureProps = {
  ownerUserId: UserId;
  name: string;
  description?: string | null;
};

export type CreateNewFeatureInput = {
  ownerUserId: UserId;
  name: string;
  description?: string | null;
};
```

#### 1.3 ドメイン関数の作成

```typescript
// src/domain/functions/newfeature/newFeatureFactory.ts
import type { NewFeature, NewFeatureProps } from "../../types/newfeature";
import type { NewFeatureId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

export function createNewFeature(
  props: NewFeatureProps,
  currentTime: Date
): Result<NewFeature, { type: "ValidationError"; message: string }> {
  // バリデーション
  if (!props.name || props.name.trim().length === 0) {
    return err({
      type: "ValidationError",
      message: "Name is required"
    });
  }

  if (props.name.length > 100) {
    return err({
      type: "ValidationError",
      message: "Name must be 100 characters or less"
    });
  }

  // エンティティ作成
  const newFeature: NewFeature = {
    id: 0 as NewFeatureId, // 実際のIDはリポジトリで設定
    ownerUserId: props.ownerUserId,
    name: props.name.trim(),
    description: props.description?.trim() || null,
    createdAt: currentTime,
    updatedAt: currentTime,
    version: 1
  };

  return ok(newFeature);
}
```

#### 1.4 スキーマ定義

```typescript
// src/domain/types/newfeature/schemas.ts
import { z } from "zod";

export const createNewFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

export const updateNewFeatureSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional()
});

export const newFeatureResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});
```

### 2. ポート（インターフェース）の定義

```typescript
// src/domain/ports/newfeature/NewFeatureRepository.ts
import type { NewFeature, NewFeatureProps } from "../../types/newfeature";
import type { NewFeatureId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import type { CattleError } from "../../errors/cattle/CattleErrors";

export interface NewFeatureRepository {
  findById(id: NewFeatureId): Promise<Result<NewFeature | null, CattleError>>;
  findByOwner(ownerUserId: UserId): Promise<Result<NewFeature[], CattleError>>;
  create(props: NewFeatureProps): Promise<Result<NewFeature, CattleError>>;
  update(id: NewFeatureId, updates: Partial<NewFeatureProps>): Promise<Result<NewFeature, CattleError>>;
  delete(id: NewFeatureId): Promise<Result<void, CattleError>>;
}
```

### 3. ユースケースの作成

```typescript
// src/application/use-cases/newfeature/createNewFeature.ts
import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { NewFeatureRepository } from "../../../domain/ports/newfeature/NewFeatureRepository";
import type { NewFeature, NewFeatureProps } from "../../../domain/types/newfeature";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import { createNewFeature } from "../../../domain/functions/newfeature/newFeatureFactory";

export type CreateNewFeatureDeps = {
  newFeatureRepo: NewFeatureRepository;
  clock: { now(): Date };
};

export type CreateNewFeatureInput = {
  ownerUserId: UserId;
  name: string;
  description?: string | null;
};

export type CreateNewFeatureUseCase = (
  deps: CreateNewFeatureDeps
) => (input: CreateNewFeatureInput) => Promise<Result<NewFeature, CattleError>>;

export const createNewFeatureUseCase: CreateNewFeatureUseCase =
  (deps) =>
  async (input): Promise<Result<NewFeature, CattleError>> => {
    try {
      const currentTime = deps.clock.now();

      // ドメイン関数でエンティティ作成
      const newFeatureResult = createNewFeature(input, currentTime);
      if (!newFeatureResult.ok) {
        return err({
          type: "ValidationError",
          message: newFeatureResult.error.message
        });
      }

      // リポジトリに保存
      const createResult = await deps.newFeatureRepo.create(input);
      if (!createResult.ok) {
        return createResult;
      }

      return ok(createResult.value);
    } catch (error) {
      return err({
        type: "InfraError",
        message: "Failed to create new feature",
        cause: error
      });
    }
  };
```

### 4. インフラストラクチャ層の実装

#### 4.1 リポジトリの実装

```typescript
// src/infrastructure/database/repositories/NewFeatureRepositoryImpl.ts
import { eq } from "drizzle-orm";
import { newFeatures } from "../../../db/schema";
import type { CattleError } from "../../../domain/errors/cattle/CattleErrors";
import type { NewFeatureRepository } from "../../../domain/ports/newfeature/NewFeatureRepository";
import type { NewFeature, NewFeatureProps } from "../../../domain/types/newfeature";
import type { NewFeatureId, UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";

export class NewFeatureRepositoryImpl implements NewFeatureRepository {
  private readonly db: D1DatabasePort;

  constructor(dbInstance: D1DatabasePort) {
    this.db = dbInstance;
  }

  async findById(id: NewFeatureId): Promise<Result<NewFeature | null, CattleError>> {
    try {
      const drizzleDb = this.db.getDrizzle();
      const row = await drizzleDb
        .select()
        .from(newFeatures)
        .where(eq(newFeatures.id, id))
        .get();

      if (!row) {
        return ok(null);
      }

      const newFeature: NewFeature = {
        id: row.id as NewFeatureId,
        ownerUserId: row.ownerUserId as UserId,
        name: row.name,
        description: row.description,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        version: row.version
      };

      return ok(newFeature);
    } catch (error) {
      return err({
        type: "InfraError",
        message: "Failed to find new feature by ID",
        cause: error
      });
    }
  }

  async create(props: NewFeatureProps): Promise<Result<NewFeature, CattleError>> {
    try {
      const drizzleDb = this.db.getDrizzle();
      const currentTime = new Date().toISOString();

      const result = await drizzleDb
        .insert(newFeatures)
        .values({
          ownerUserId: props.ownerUserId,
          name: props.name,
          description: props.description,
          createdAt: currentTime,
          updatedAt: currentTime,
          version: 1
        })
        .returning()
        .get();

      if (!result) {
        return err({
          type: "InfraError",
          message: "Failed to create new feature"
        });
      }

      const newFeature: NewFeature = {
        id: result.id as NewFeatureId,
        ownerUserId: result.ownerUserId as UserId,
        name: result.name,
        description: result.description,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        version: result.version
      };

      return ok(newFeature);
    } catch (error) {
      return err({
        type: "InfraError",
        message: "Failed to create new feature",
        cause: error
      });
    }
  }

  // 他のメソッドも同様に実装...
}
```

#### 4.2 データベーススキーマの定義

```typescript
// src/db/tables/newFeatures.ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const newFeatures = sqliteTable("new_features", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  ownerUserId: integer("ownerUserId", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("createdAt").default(sql`(datetime('now', 'utc'))`),
  updatedAt: text("updatedAt").default(sql`(datetime('now', 'utc'))`),
  version: integer("version", { mode: "number" }).default(1)
});
```

### 5. 依存関係の設定

#### 5.1 UseCaseFactoryの更新

```typescript
// src/infrastructure/config/UseCaseFactory.ts
import { createNewFeatureUseCase } from "../../application/use-cases/newfeature/createNewFeature";

export function createUseCases(repositories: RepositoryDependencies, services: ServiceDependencies) {
  // ... 既存のユースケース ...

  const createNewFeature = createNewFeatureUseCase({
    newFeatureRepo: repositories.newFeatureRepo,
    clock: services.clock
  });

  return {
    // ... 既存のユースケース ...
    createNewFeatureUseCase: createNewFeature
  };
}
```

#### 5.2 Dependencies型の更新

```typescript
// src/infrastructure/config/dependencies.ts
export type Dependencies = {
  repositories: {
    // ... 既存のリポジトリ ...
    newFeatureRepo: NewFeatureRepository;
  };
  useCases: {
    // ... 既存のユースケース ...
    createNewFeatureUseCase: (
      input: Parameters<ReturnType<typeof createNewFeatureUseCase>>[0]
    ) => ReturnType<ReturnType<typeof createNewFeatureUseCase>>;
  };
  // ... 他の依存関係 ...
};
```

### 6. HTTPコントローラーの作成

```typescript
// src/interfaces/http/controllers/NewFeatureController.ts
import type { Context } from "hono";
import type { NewFeatureControllerDeps } from "./types";
import { executeUseCase } from "../../../shared/http/route-helpers";
import { zValidator } from "@hono/zod-validator";
import { createNewFeatureSchema } from "../../../domain/types/newfeature/schemas";

export type NewFeatureControllerDeps = {
  useCases: {
    createNewFeatureUseCase: (
      input: { ownerUserId: number; name: string; description?: string | null }
    ) => Promise<Result<NewFeature, CattleError>>;
  };
};

export const makeNewFeatureController = (deps: NewFeatureControllerDeps) => ({
  async create(c: Context): Promise<Response> {
    return executeUseCase(c, async () => {
      const jwtPayload = c.get("jwtPayload");
      const userId = toUserId(jwtPayload.userId);
      const input = await c.req.json();

      const createNewFeatureUseCase = deps.useCases.createNewFeatureUseCase;
      const result = await createNewFeatureUseCase({
        ownerUserId: userId,
        name: input.name,
        description: input.description
      });

      return result;
    });
  }
});
```

### 7. ルーティングの設定

```typescript
// src/interfaces/http/routes/newFeatures.ts
import { Hono } from "hono";
import { makeNewFeatureController } from "../controllers/NewFeatureController";

export function createNewFeatureRoutes(deps: NewFeatureControllerDeps) {
  const controller = makeNewFeatureController(deps);
  const app = new Hono();

  app.post("/", controller.create);

  return app;
}
```

## ベストプラクティス

### 1. エラーハンドリング

- ドメイン層では`Result<T, E>`型を使用
- インフラ層では適切なエラー型に変換
- HTTP層では適切なステータスコードを返す

### 2. バリデーション

- ドメイン関数でビジネスルールを検証
- ZodスキーマでHTTPリクエストを検証
- 型安全性を最大限活用

### 3. 依存性注入

- インターフェースを通じて依存関係を定義
- テスト時にモックを簡単に差し替え可能
- 循環依存を避ける

### 4. テスト

- 各レイヤーで単体テストを作成
- ユースケースのテストでは依存関係をモック
- リポジトリのテストでは実際のデータベースを使用

## 既存コードの移行

既存のコードを新しいアーキテクチャに移行する場合：

1. ドメイン層の分離
2. ポート（インターフェース）の定義
3. ユースケースの作成
4. 依存関係の設定
5. テストの更新

## まとめ

このアーキテクチャにより、以下のメリットが得られます：

- **保守性**: 各レイヤーの責任が明確
- **テスタビリティ**: 依存関係の注入によりテストが容易
- **拡張性**: 新しい機能の追加が簡単
- **型安全性**: TypeScriptの恩恵を最大限活用
