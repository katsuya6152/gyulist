# コードベース構造ガイド

## 概要

このドキュメントは、ギュウリスト（牛の個体管理アプリ）のコードベース構造と開発ルールを説明します。
新機能追加時や既存コードの理解時に「どこに何があるか」「どこに新しいコードを配置すべきか」をすぐに判断できるようにするためのガイドです。

## 🏗️ プロジェクト全体構造

```
gyulist/
├── 📁 apps/                   # アプリケーション群（モノレポ）
│   ├── 📁 api/                # バックエンドAPI（Hono + Cloudflare Workers）
│   └── 📁 web/                # フロントエンド（Next.js）
├── 📁 docs/                   # プロジェクトドキュメント
├── 📁 .github/                # GitHub Actions設定
├── 📄 package.json            # ルートpackage.json（ワークスペース管理）
├── 📄 pnpm-workspace.yaml     # pnpmワークスペース設定
├── 📄 biome.json              # コードフォーマット・リント設定
└── 📄 README.md               # プロジェクト概要
```

### 📋 ワークスペース構成

- **モノレポ構成**: pnpmワークスペースで複数アプリを管理
- **独立性**: 各アプリは独立してビルド・デプロイ可能
- **共通設定**: フォーマット・リント設定はルートで一元管理

## 🖥️ フロントエンド構造（apps/web/）

### 📁 ディレクトリ構造

```
apps/web/
├── 📁 src/
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── 📁 (auth)/            # 認証関連ページ
│   │   │   ├── 📁 login/
│   │   │   ├── 📁 register/
│   │   │   └── 📁 verify/
│   │   ├── 📁 (authenticated)/   # 認証後ページ
│   │   │   ├── 📁 cattle/
│   │   │   ├── 📁 events/
│   │   │   ├── 📁 schedule/
│   │   │   ├── 📁 settings/
│   │   │   └── 📄 layout.tsx     # 認証後共通レイアウト
│   │   ├── 📄 layout.tsx         # ルートレイアウト
│   │   ├── 📄 page.tsx           # ランディングページ
│   │   └── 📄 globals.css        # グローバルCSS
│   ├── 📁 features/              # 機能別コンポーネント
│   │   ├── 📁 cattle/
│   │   │   ├── 📁 list/
│   │   │   ├── 📁 detail/
│   │   │   ├── 📁 new/
│   │   │   └── 📁 edit/
│   │   ├── 📁 events/
│   │   ├── 📁 schedule/
│   │   └── 📁 settings/
│   ├── 📁 components/           # 共通コンポーネント
│   │   ├── 📁 ui/               # shadcn/uiコンポーネント
│   │   └── 📄 footer-nav.tsx    # アプリ固有の共通コンポーネント
│   ├── 📁 lib/                  # ユーティリティ・ヘルパー
│   │   ├── 📄 utils.ts          # 汎用ユーティリティ
│   │   └── 📄 rpc.ts            # API型定義・RPC設定
│   └── 📁 services/             # API呼び出しサービス
│       ├── 📄 cattleService.ts
│       └── 📄 eventService.ts
├── 📁 public/                   # 静的ファイル
├── 📄 package.json              # 依存関係・スクリプト
├── 📄 next.config.ts            # Next.js設定
├── 📄 tailwind.config.ts        # Tailwind CSS設定
├── 📄 components.json           # shadcn/ui設定
└── 📄 wrangler.jsonc            # Cloudflare Pages設定
```

### 🎯 各ディレクトリの役割

#### 📁 `app/` - Next.js App Router
- **役割**: ページルーティングとレイアウト定義
- **ルール**: 
  - `(auth)/` - 認証前ページ（ログイン、登録等）
  - `(authenticated)/` - 認証後ページ（メイン機能）
  - 各ページは基本的に `page.tsx` のみ、ロジックは `features/` に委譲

#### 📁 `features/` - 機能別コンポーネント
- **役割**: 各機能のビジネスロジックとUI
- **パターン**: Container/Presentational パターン
- **構成**:
  ```
  features/[機能名]/[操作名]/
  ├── 📄 container.tsx      # Server Component（データ取得）
  ├── 📄 presentational.tsx # Client Component（UI表示）
  ├── 📄 actions.ts         # Server Actions（フォーム処理等）
  └── 📄 schema.ts          # Zodバリデーションスキーマ
  ```

#### 📁 `components/` - 共通コンポーネント
- **役割**: アプリ全体で再利用可能なコンポーネント
- **`ui/`**: shadcn/uiの基本コンポーネント
- **ルート**: アプリ固有の共通コンポーネント（`footer-nav.tsx`等）

#### 📁 `lib/` - ユーティリティ
- **役割**: 汎用的なヘルパー関数・設定
- **`utils.ts`**: クラス名結合等の汎用ユーティリティ
- **`rpc.ts`**: HonoのRPC型定義とクライアント設定

#### 📁 `services/` - API呼び出し
- **役割**: バックエンドAPIとの通信処理
- **パターン**: 機能別にサービスファイルを分割
- **命名**: `[機能名]Service.ts`

## 🔧 バックエンド構造（apps/api/）

### 📁 ディレクトリ構造

```
apps/api/
├── 📁 src/
│   ├── 📁 contexts/           # FDM（Functional Domain Modeling）
│   │   ├── 📁 cattle/         # 牛管理コンテキスト
│   │   │   ├── 📁 domain/     # ドメインロジック
│   │   │   │   ├── 📁 codecs/ # 入出力変換
│   │   │   │   ├── 📁 model/  # ドメインモデル
│   │   │   │   └── 📁 services/ # ユースケース
│   │   │   ├── 📁 infra/      # インフラ層
│   │   │   │   ├── 📁 drizzle/ # DB実装
│   │   │   │   └── 📁 mappers/ # データ変換
│   │   │   ├── 📁 presentation/ # HTTP層
│   │   │   ├── 📄 ports.ts    # インターフェース定義
│   │   │   └── 📁 tests/      # テスト
│   │   ├── 📁 auth/           # 認証コンテキスト
│   │   ├── 📁 events/         # イベントコンテキスト
│   │   └── 📁 alerts/         # アラートコンテキスト
│   ├── 📁 routes/             # APIエンドポイント定義
│   │   ├── 📄 index.ts        # ルートアグリゲーター
│   │   ├── 📄 auth.ts         # 認証関連API
│   │   ├── 📄 cattle.ts       # 牛管理API
│   │   ├── 📄 events.ts       # イベント管理API
│   │   └── 📄 health.ts       # ヘルスチェック
│   ├── 📁 shared/             # 共通機能
│   │   ├── 📁 config/         # 設定・DI
│   │   ├── 📁 http/           # HTTP共通処理
│   │   ├── 📁 logging/        # 構造化ログ
│   │   ├── 📁 ports/          # 共通インターフェース
│   │   ├── 📁 types/          # 型安全ユーティリティ
│   │   └── 📁 utils/          # 共通ユーティリティ
│   ├── 📁 middleware/         # ミドルウェア
│   │   ├── 📄 jwt.ts          # JWT認証
│   │   └── 📄 cors.ts         # CORS設定
│   ├── 📁 db/                 # データベース関連
│   │   ├── 📁 tables/         # テーブル定義
│   │   │   ├── 📄 users.ts
│   │   │   └── 📄 cattle.ts
│   │   ├── 📁 dummy/          # ダミーデータ
│   │   └── 📄 schema.ts       # スキーマエクスポート
│   ├── 📁 lib/                # ライブラリ・ユーティリティ
│   ├── 📄 index.ts            # エントリーポイント
│   └── 📄 types.ts            # 型定義
├── 📁 drizzle/                # マイグレーションファイル
│   └── 📁 migrations/
├── 📄 package.json            # 依存関係・スクリプト
├── 📄 drizzle.config.ts       # Drizzle ORM設定
├── 📄 wrangler.jsonc          # Cloudflare Workers設定
└── 📄 tsconfig.json           # TypeScript設定
```

### 🎯 Functional Domain Modeling (FDM) アーキテクチャ

#### 📁 `contexts/[domain]/` - ドメインコンテキスト
- **役割**: ビジネスドメインの完全な実装
- **構成**: 
  - `domain/` - ドメインロジック（純粋関数）
  - `infra/` - インフラ実装（DB、外部API）
  - `presentation/` - HTTP表現層
  - `ports.ts` - インターフェース定義
  - `tests/` - ドメイン固有テスト

#### 📁 `shared/` - 共通機能
- **config/di.ts**: 依存注入設定
- **http/route-helpers.ts**: 統一エラーハンドリング
- **logging/logger.ts**: 構造化ログシステム
- **types/safe-cast.ts**: 型安全キャスト
- **utils/**: データ変換・リクエスト処理ユーティリティ

#### 📁 `routes/` - APIエンドポイント層
- **役割**: HTTPリクエスト/レスポンスの処理
- **責務**: 
  - リクエストバリデーション
  - 統一エラーハンドリング
  - 構造化ログ出力
- **パターン**: FDMユースケース呼び出し + 共通ヘルパー使用

### 🏗️ FDM 実装パターン

#### Domain Layer（ドメイン層）
```typescript
// contexts/cattle/domain/services/create.ts
export function createCattle(deps: CattleDeps) {
  return async (input: CreateCattleInput): Promise<Result<CattleId, CattleError>> => {
    // 純粋なビジネスロジック
    const validation = validateCattleData(input);
    if (!validation.ok) return validation;
    
    const cattleId = await deps.repo.create(input);
    return { ok: true, value: cattleId };
  };
}
```

#### Infrastructure Layer（インフラ層）
```typescript
// contexts/cattle/infra/drizzle/repo.ts
export function makeCattleRepo(db: AnyD1Database): CattleRepoPort {
  return {
    async create(data: CreateCattleInput): Promise<CattleId> {
      // DB実装の詳細
    },
    // その他のCRUD操作
  };
}
```

#### Presentation Layer（表現層）
```typescript
// routes/cattle.ts
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

## 🏗️ 新機能追加の手順

### 📋 1. バックエンドAPI追加（FDM パターン）

#### Step 1: ドメインモデル・型定義
```typescript
// apps/api/src/contexts/new-feature/domain/model/new-feature.ts
import type { Brand } from "../../../shared/brand";

export type NewFeatureId = Brand<number, "NewFeatureId">;
export type UserId = Brand<number, "UserId">;

export type NewFeature = {
  id: NewFeatureId;
  name: string;
  description?: string;
  ownerId: UserId;
  createdAt: string;
};
```

#### Step 2: 入出力コーデック定義
```typescript
// apps/api/src/contexts/new-feature/domain/codecs/input.ts
import { z } from "zod";

export const createNewFeatureInputSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  description: z.string().optional(),
});

export type CreateNewFeatureInput = z.infer<typeof createNewFeatureInputSchema>;
```

#### Step 3: Ports（インターフェース）定義
```typescript
// apps/api/src/contexts/new-feature/ports.ts
import type { Result } from "../../shared/result";
import type { NewFeature, NewFeatureId } from "./domain/model/new-feature";
import type { CreateNewFeatureInput } from "./domain/codecs/input";

export interface NewFeatureRepoPort {
  create(data: CreateNewFeatureInput & { ownerId: UserId }): Promise<NewFeatureId>;
  findById(id: NewFeatureId): Promise<NewFeature | null>;
}

export type NewFeatureDeps = {
  repo: NewFeatureRepoPort;
  clock: ClockPort;
};

export type NewFeatureError = 
  | { type: "ValidationError"; message: string }
  | { type: "NotFound"; message: string };
```

#### Step 4: ドメインサービス（ユースケース）実装
```typescript
// apps/api/src/contexts/new-feature/domain/services/create.ts
import type { Result } from "../../../../shared/result";
import type { NewFeatureDeps, NewFeatureError } from "../../ports";
import type { CreateNewFeatureInput } from "../codecs/input";
import type { NewFeatureId, UserId } from "../model/new-feature";

export function createNewFeature(deps: NewFeatureDeps) {
  return async (
    ownerId: UserId,
    input: CreateNewFeatureInput
  ): Promise<Result<NewFeatureId, NewFeatureError>> => {
    try {
      // ビジネスロジック
      if (input.name.length > 100) {
        return {
          ok: false,
          error: { type: "ValidationError", message: "名前は100文字以内である必要があります" }
        };
      }

      const newFeatureId = await deps.repo.create({
        ...input,
        ownerId
      });

      return { ok: true, value: newFeatureId };
    } catch (error) {
      return {
        ok: false,
        error: { type: "ValidationError", message: "作成に失敗しました" }
      };
    }
  };
}
```

#### Step 5: インフラ層（Repository）実装
```typescript
// apps/api/src/contexts/new-feature/infra/drizzle/repo.ts
import { drizzle } from "drizzle-orm/d1";
import type { AnyD1Database } from "drizzle-orm/d1";
import { newFeatures } from "../../../../db/tables/new-features";
import type { NewFeatureRepoPort } from "../../ports";
import type { NewFeatureId, UserId } from "../../domain/model/new-feature";

export function makeNewFeatureRepo(db: AnyD1Database): NewFeatureRepoPort {
  const dbInstance = drizzle(db);
  
  return {
    async create(data) {
      const [result] = await dbInstance
        .insert(newFeatures)
        .values({
          name: data.name,
          description: data.description,
          ownerId: data.ownerId,
          createdAt: new Date().toISOString()
        })
        .returning({ id: newFeatures.id });
      
      return result.id as NewFeatureId;
    },

    async findById(id) {
      const result = await dbInstance
        .select()
        .from(newFeatures)
        .where(eq(newFeatures.id, id))
        .limit(1);
      
      return result[0] || null;
    }
  };
}
```

#### Step 6: DI設定追加
```typescript
// apps/api/src/shared/config/di.ts に追加
import { makeNewFeatureRepo } from "../../contexts/new-feature/infra/drizzle/repo";
import type { NewFeatureDeps } from "../../contexts/new-feature/ports";

export function makeNewFeatureDeps(db: AnyD1Database, clock: ClockPort): NewFeatureDeps {
  return {
    get repo() { return makeNewFeatureRepo(db); },
    clock
  };
}
```

#### Step 7: ルート層実装
```typescript
// apps/api/src/routes/new-feature.ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { createNewFeature } from "../contexts/new-feature/domain/services/create";
import { createNewFeatureInputSchema } from "../contexts/new-feature/domain/codecs/input";
import { makeNewFeatureDeps } from "../shared/config/di";
import { executeUseCase } from "../shared/http/route-helpers";
import { extractUserId } from "../shared/types/safe-cast";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
  .use("*", jwtMiddleware)
  .post("/", zValidator("json", createNewFeatureInputSchema), async (c) => {
    const input = c.req.valid("json");
    const userId = extractUserId(c.get("jwtPayload"));
    
    return executeUseCase(c, async () => {
      const deps = makeNewFeatureDeps(c.env.DB, { nowIso: () => new Date().toISOString() });
      const result = await createNewFeature(deps)(userId, input);
      
      if (!result.ok) return result;
      return { ok: true, value: { newFeatureId: result.value } };
    });
  });

export default app;
```

### 📋 2. フロントエンド機能追加

#### Step 1: サービス層実装
```typescript
// apps/web/src/services/newFeatureService.ts
import { client } from "@/lib/rpc";
import { cookies } from "next/headers";

export type CreateNewFeatureInput = {
  name: string;
  description?: string;
};

export async function CreateNewFeature(data: CreateNewFeatureInput): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("認証が必要です");
  }

  const res = await client.api.v1["new-feature"].$post(
    { json: data },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error("作成に失敗しました");
  }
}
```

#### Step 2: スキーマ定義
```typescript
// apps/web/src/features/new-feature/new/schema.ts
import { z } from "zod";

export const createNewFeatureSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  description: z.string().optional(),
});

export type CreateNewFeatureFormData = z.infer<typeof createNewFeatureSchema>;
```

#### Step 3: Server Actions実装
```typescript
// apps/web/src/features/new-feature/new/actions.ts
"use server";

import { CreateNewFeature } from "@/services/newFeatureService";
import { parseWithZod } from "@conform-to/zod";
import { createNewFeatureSchema } from "./schema";

export async function createNewFeatureAction(
  prevState: unknown,
  formData: FormData,
) {
  const submission = parseWithZod(formData, {
    schema: createNewFeatureSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await CreateNewFeature(submission.value);
    return {
      status: "success" as const,
      message: "作成が完了しました",
    };
  } catch (error) {
    return {
      status: "error" as const,
      message: "作成に失敗しました",
    };
  }
}
```

#### Step 4: UI実装
```typescript
// apps/web/src/features/new-feature/new/presentational.tsx
"use client";

import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useActionState } from "react";
import { createNewFeatureAction } from "./actions";
import { createNewFeatureSchema } from "./schema";

export function NewFeatureNewPresentation() {
  const [lastResult, action, isPending] = useActionState(
    createNewFeatureAction,
    null,
  );

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createNewFeatureSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createNewFeatureSchema });
    },
  });

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={action}>
      {/* フォーム要素 */}
    </form>
  );
}
```

#### Step 5: Container実装
```typescript
// apps/web/src/features/new-feature/new/container.tsx
import { NewFeatureNewPresentation } from "./presentational";

export default async function NewFeatureNewContainer() {
  return <NewFeatureNewPresentation />;
}
```

#### Step 6: ページ追加
```typescript
// apps/web/src/app/(authenticated)/new-feature/new/page.tsx
import NewFeatureNewContainer from "@/features/new-feature/new/container";

export default function NewFeatureNewPage() {
  return <NewFeatureNewContainer />;
}
```

## 📝 命名規則

### 🎯 ファイル命名
- **コンポーネント**: `PascalCase.tsx` (例: `CattleListPresentation.tsx`)
- **ユーティリティ**: `camelCase.ts` (例: `cattleService.ts`)
- **設定ファイル**: `kebab-case.json` (例: `next.config.ts`)

### 🎯 フォルダ命名
- **機能フォルダ**: `kebab-case` (例: `cattle`, `new-feature`)
- **操作フォルダ**: `kebab-case` (例: `list`, `detail`, `new`, `edit`)

### 🎯 変数・関数命名
- **変数**: `camelCase`
- **関数**: `camelCase`
- **定数**: `UPPER_SNAKE_CASE`
- **型**: `PascalCase`
- **インターフェース**: `PascalCase` (例: `CattleData`)

### 🎯 API関連命名
- **エンドポイント**: `kebab-case` (例: `/api/v1/cattle`)
- **バリデーター**: `camelCaseSchema` (例: `createCattleSchema`)
- **サービス関数**: `動詞 + 名詞` (例: `createCattle`, `getCattleList`)

## 🔧 開発ツール・設定

### 📋 コードフォーマット・リント
- **Biome**: フォーマット・リント統合ツール
- **設定**: `biome.json`
- **実行**: `pnpm format`, `pnpm lint`

### 📋 Git Hooks
- **Pre-commit**: 自動フォーマット・リント実行
- **設定**: `simple-git-hooks`

### 📋 TypeScript設定
- **フロントエンド**: `apps/web/tsconfig.json`
- **バックエンド**: `apps/api/tsconfig.json`
- **厳格な型チェック**: 有効

## 🚨 重要なルール・制約

### ✅ DO（推奨）

#### バックエンド（API）
- **FDM パターン**: Functional Domain Modeling の徹底
- **Result 型**: エラーハンドリングにResult<T, E>を使用
- **依存注入**: 統一されたDI設定の活用
- **構造化ログ**: logger.tsを使用した構造化ログ出力
- **型安全キャスト**: safe-cast.tsの型安全ユーティリティ使用
- **統一エラーハンドリング**: executeUseCase等の共通ヘルパー使用

#### フロントエンド（Web）
- **Container/Presentational**: 責務分離パターンの徹底
- **Server Components**: データ取得はServer Componentsで実行
- **Server Actions**: フォーム処理はServer Actionsを使用
- **型安全性**: Zodスキーマでバリデーション統一
- **認証**: 全APIエンドポイントでJWT検証

### ❌ DON'T（禁止）

#### バックエンド（API）
- **直接DB操作**: ドメインサービスからRepositoryを経由せずDB操作
- **console.log**: 構造化ログではなくconsole.logの使用
- **型キャスト**: 安全でない型キャスト（as any等）
- **例外スロー**: Result型を使わずに例外をスロー

#### フロントエンド（Web）
- **クライアント状態**: 複雑な状態管理ライブラリの導入
- **混在パターン**: Container内でのClient Component実装
- **ハードコード**: 環境変数を使わずに設定値をハードコード
- **直接API呼び出し**: Service層を経由せずにAPI呼び出し

## 🔍 よく使うファイルの場所

### 📁 設定ファイル
- **API設定**: `apps/api/wrangler.jsonc`
- **Web設定**: `apps/web/next.config.ts`
- **DB設定**: `apps/api/drizzle.config.ts`
- **UI設定**: `apps/web/components.json`

### 📁 重要なファイル
- **API型定義**: `apps/web/src/lib/rpc.ts`
- **DB スキーマ**: `apps/api/src/db/schema.ts`
- **共通レイアウト**: `apps/web/src/app/(authenticated)/layout.tsx`
- **フッターナビ**: `apps/web/src/components/footer-nav.tsx`

### 📁 データベース関連
- **マイグレーション**: `apps/api/drizzle/migrations/`
- **ダミーデータ**: `apps/api/src/db/dummy/dummy_data.sql`
- **テーブル定義**: `apps/api/src/db/tables/`

---

## 📚 関連ドキュメント

### アーキテクチャドキュメント
- **[API アーキテクチャガイド](./api-architecture.md)**: バックエンドFDMアーキテクチャの詳細
- **[Web アーキテクチャガイド](./web-architecture.md)**: フロントエンドContainer/Presentationalアーキテクチャの詳細

### 実装ガイドライン
- **[API 実装ガイドライン](./api-implementation-guidelines.md)**: バックエンド開発の具体的規約
- **[Web 実装ガイドライン](./web-implementation-guidelines.md)**: フロントエンド開発の具体的規約

### その他
- **[アーキテクチャ決定記録](./architecture-decisions.md)**: 重要な技術決定の記録

---

**最終更新**: 2025年8月  
**バージョン**: 2.0（FDM + Container/Presentational 対応）