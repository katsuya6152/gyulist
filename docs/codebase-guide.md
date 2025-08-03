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
│   ├── 📁 routes/             # APIエンドポイント定義
│   │   ├── 📄 index.ts        # ルートアグリゲーター
│   │   ├── 📄 auth.ts         # 認証関連API
│   │   ├── 📄 cattle.ts       # 牛管理API
│   │   ├── 📄 events.ts       # イベント管理API
│   │   └── 📄 health.ts       # ヘルスチェック
│   ├── 📁 services/           # ビジネスロジック
│   │   ├── 📄 authService.ts
│   │   ├── 📄 cattleService.ts
│   │   └── 📄 eventService.ts
│   ├── 📁 repositories/       # データアクセス層
│   │   ├── 📄 userRepository.ts
│   │   ├── 📄 cattleRepository.ts
│   │   └── 📄 eventRepository.ts
│   ├── 📁 validators/         # バリデーション定義
│   │   ├── 📄 authValidator.ts
│   │   ├── 📄 cattleValidator.ts
│   │   └── 📄 eventValidator.ts
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

### 🎯 レイヤードアーキテクチャ

#### 📁 `routes/` - APIエンドポイント層
- **役割**: HTTPリクエスト/レスポンスの処理
- **責務**: 
  - リクエストバリデーション
  - レスポンス形式の統一
  - エラーハンドリング
- **パターン**: Honoアプリケーションとして実装

#### 📁 `services/` - ビジネスロジック層
- **役割**: アプリケーションのビジネスルール
- **責務**:
  - 権限チェック
  - データ変換・計算
  - 複数リポジトリの協調
- **依存**: Repositoryレイヤーのみに依存

#### 📁 `repositories/` - データアクセス層
- **役割**: データベースとの直接的なやり取り
- **責務**:
  - CRUD操作
  - クエリ構築
  - データマッピング
- **依存**: データベース（Drizzle ORM）のみに依存

#### 📁 `validators/` - バリデーション層
- **役割**: 入力データの検証
- **実装**: Zodスキーマ
- **共有**: フロントエンドと同じスキーマを使用可能

## 🏗️ 新機能追加の手順

### 📋 1. バックエンドAPI追加

#### Step 1: バリデーション定義
```typescript
// apps/api/src/validators/newFeatureValidator.ts
import { z } from "zod";

export const createNewFeatureSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  description: z.string().optional(),
});

export type CreateNewFeatureInput = z.infer<typeof createNewFeatureSchema>;
```

#### Step 2: リポジトリ層実装
```typescript
// apps/api/src/repositories/newFeatureRepository.ts
import { drizzle } from "drizzle-orm/d1";
import type { AnyD1Database } from "drizzle-orm/d1";
import { newFeatures } from "../db/schema";

export async function createNewFeature(
  db: AnyD1Database, 
  data: CreateNewFeatureInput
) {
  const dbInstance = drizzle(db);
  return await dbInstance.insert(newFeatures).values(data);
}
```

#### Step 3: サービス層実装
```typescript
// apps/api/src/services/newFeatureService.ts
import { createNewFeature } from "../repositories/newFeatureRepository";
import type { CreateNewFeatureInput } from "../validators/newFeatureValidator";

export async function createNewFeatureData(
  db: AnyD1Database,
  ownerUserId: number,
  input: CreateNewFeatureInput
) {
  // ビジネスロジック（権限チェック等）
  return await createNewFeature(db, { ...input, ownerUserId });
}
```

#### Step 4: ルート層実装
```typescript
// apps/api/src/routes/newFeature.ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { createNewFeatureData } from "../services/newFeatureService";
import { createNewFeatureSchema } from "../validators/newFeatureValidator";

const app = new Hono<{ Bindings: Bindings }>()
  .use("*", jwtMiddleware)
  .post("/", zValidator("json", createNewFeatureSchema), async (c) => {
    const input = c.req.valid("json");
    const userId = c.get("jwtPayload").userId;
    
    try {
      await createNewFeatureData(c.env.DB, userId, input);
      return c.json({ message: "作成に成功しました" });
    } catch (error) {
      return c.json({ error: "作成に失敗しました" }, 500);
    }
  });

export default app;
```

#### Step 5: ルートを統合
```typescript
// apps/api/src/routes/index.ts に追加
import newFeature from "./newFeature";

export const createRoutes = (app: Hono<{ Bindings: Bindings }>) => {
  return app
    .basePath("/api/v1")
    .use("*", corsMiddleware)
    // ... 既存ルート
    .route("/new-feature", newFeature);
};
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
- **Server Actions**: フォーム処理はServer Actionsを使用
- **型安全性**: Zodスキーマでバリデーション統一
- **関心の分離**: Container/Presentational パターン遵守
- **エラーハンドリング**: 統一的なエラーレスポンス形式
- **認証**: 全APIエンドポイントでJWT検証

### ❌ DON'T（禁止）
- **直接DB操作**: ServiceレイヤーからRepositoryを経由せずDB操作
- **クライアント状態**: 複雑な状態管理ライブラリの導入
- **混在パターン**: Container内でのClient Component実装
- **ハードコード**: 環境変数を使わずに設定値をハードコード

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

**最終更新**: 2025年8月