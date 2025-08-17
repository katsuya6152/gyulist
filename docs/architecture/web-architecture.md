# Web アーキテクチャガイド

**Gyulist Web Frontend - Next.js 15 + App Router アーキテクチャ**

---

## 📖 概要

Gyulist のWebフロントエンドは、**Next.js 15 App Router** をベースとした **Container/Presentational パターン** を採用したモダンなReactアプリケーションです。型安全性、保守性、テスタビリティを重視した設計により、スケーラブルで品質の高いユーザーエクスペリエンスを提供します。

### 🏗️ アーキテクチャ原則

1. **関心の分離**: Container（データ取得・ビジネスロジック）とPresentational（UI・表示ロジック）の明確な分離
2. **型安全性**: TypeScript + Zod による厳密な型定義とバリデーション
3. **Server-First**: Server Components と Server Actions を活用したサーバーサイド重視の設計
4. **テスタビリティ**: 各層での独立したテストが可能な構造
5. **一貫性**: 統一されたパターンによる開発効率と保守性の向上

---

## 🏛️ アーキテクチャ構成

### レイヤー構成

```
┌─────────────────────────────────────────┐
│              App Router                 │  ← ルーティング・レイアウト
├─────────────────────────────────────────┤
│             Container Layer             │  ← データ取得・状態管理
├─────────────────────────────────────────┤
│           Presentational Layer          │  ← UI コンポーネント
├─────────────────────────────────────────┤
│            Server Actions               │  ← フォーム処理・状態変更
├─────────────────────────────────────────┤
│             Service Layer               │  ← API 通信・データ変換
├─────────────────────────────────────────┤
│               API Client                │  ← 型安全な HTTP クライアント
└─────────────────────────────────────────┘
```

### ディレクトリ構造

```
apps/web/src/
├── app/                          # App Router (Next.js 15)
│   ├── (authenticated)/          # 認証必須ページグループ
│   ├── (auth)/                   # 認証ページグループ  
│   ├── globals.css               # グローバルスタイル
│   └── layout.tsx                # ルートレイアウト
├── components/                   # 再利用可能UIコンポーネント
│   ├── ui/                       # shadcn/ui ベースコンポーネント
│   └── landing/                  # ランディングページ専用
├── features/                     # 機能別モジュール
│   └── [feature]/                # 機能名（cattle, events, etc）
│       ├── [operation]/          # 操作名（list, detail, new, edit）
│       │   ├── container.tsx     # Server Component（データ取得）
│       │   ├── presentational.tsx # Client Component（UI）
│       │   ├── actions.ts        # Server Actions
│       │   ├── schema.ts         # Zod バリデーションスキーマ
│       │   └── __tests__/        # テストファイル
│       └── components/           # 機能専用コンポーネント
├── services/                     # API 通信サービス
├── lib/                          # 共通ライブラリ
└── test/                         # テスト設定
```

---

## 🔧 実装パターン

### 1. Container/Presentational パターン

#### Container Component（Server Component）

**責務**: データ取得、エラーハンドリング、Presentational への Props 渡し

```typescript
// features/cattle/detail/container.tsx
import { GetCattleDetail } from "@/services/cattleService";
import CattleDetailPresentation from "./presentational";

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
```

#### Presentational Component（Client Component）

**責務**: UI レンダリング、ユーザーインタラクション、状態管理（UI状態のみ）

```typescript
// features/cattle/detail/presentational.tsx
"use client";

type Props = {
  cattle?: CattleDetail;
  error?: string;
};

export default function CattleDetailPresentation({ cattle, error }: Props) {
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!cattle) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <CattleBasicInfo cattle={cattle} />
      <CattleBreedingInfo cattle={cattle} />
      {/* その他のUI要素 */}
    </div>
  );
}
```

### 2. Server Actions パターン

**責務**: フォーム処理、データ変更、バリデーション

```typescript
// features/cattle/new/actions.ts
"use server";

import { parseWithZod } from "@conform-to/zod";
import { CreateCattle } from "@/services/cattleService";
import { createCattleSchema } from "./schema";

export async function createCattleAction(
  prevState: unknown,
  formData: FormData
) {
  // 1. バリデーション
  const submission = parseWithZod(formData, {
    schema: createCattleSchema
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    // 2. 認証チェック
    const userId = await verifyAndGetUserId();
    
    // 3. データ変換
    const apiData = transformToApiFormat(submission.value);
    
    // 4. API呼び出し
    await CreateCattle(apiData);

    // 5. 成功レスポンス
    return submission.reply();
  } catch (error) {
    // 6. エラーハンドリング
    return submission.reply({
      formErrors: ["作成に失敗しました"]
    });
  }
}
```

### 3. Service Layer パターン

**責務**: API通信、レスポンス変換、エラーハンドリング

```typescript
// services/cattleService.ts
export async function GetCattleDetail(
  id: number | string
): Promise<GetCattleDetailResType> {
  return fetchWithAuth<GetCattleDetailResType>((token) =>
    client.api.v1.cattle[id].$get(
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  );
}

export async function CreateCattle(data: CreateCattleInput): Promise<void> {
  return fetchWithAuth<void>((token) =>
    client.api.v1.cattle.$post(
      { json: data },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  );
}
```

---

## 🎨 UI・スタイリング戦略

### デザインシステム

- **Base**: shadcn/ui + Tailwind CSS
- **カラーパレット**: CSS変数による統一されたテーマシステム
- **レスポンシブ**: モバイルファーストアプローチ
- **アクセシビリティ**: ARIA属性、キーボードナビゲーション対応

### コンポーネント階層

```
┌─────────────────────────────────────────┐
│            Page Components              │  ← features/[feature]/[operation]/
├─────────────────────────────────────────┤
│          Feature Components             │  ← features/[feature]/components/
├─────────────────────────────────────────┤
│           Shared Components             │  ← components/
├─────────────────────────────────────────┤
│             UI Primitives               │  ← components/ui/ (shadcn/ui)
└─────────────────────────────────────────┘
```

---

## 📊 状態管理戦略

### 状態の分類と管理方法

| 状態の種類 | 管理場所 | 管理方法 |
|-----------|----------|----------|
| **サーバー状態** | Container | Server Components での直接取得 |
| **フォーム状態** | Presentational | React Hook Form + Conform |
| **UI状態** | Presentational | useState, useReducer |
| **グローバルUI状態** | Context | React Context (最小限) |
| **認証状態** | Server Actions | JWT Cookie ベース |

### 状態管理の原則

1. **Server State First**: サーバーから取得できるデータは Server Components で処理
2. **最小限のクライアント状態**: 本当に必要なUI状態のみクライアントで管理
3. **単方向データフロー**: 親から子へのProps渡し、子から親へのCallback
4. **状態の局所化**: 必要な場所でのみ状態を保持

---

## 🔐 認証・認可パターン

### 認証フロー

```typescript
// Server Actions での認証チェック
export async function protectedAction(formData: FormData) {
  // 1. JWT Cookie から認証情報取得
  const userId = await verifyAndGetUserId();
  
  // 2. デモユーザーチェック
  if (isDemo(userId)) {
    return createDemoResponse("success");
  }
  
  // 3. 実際の処理実行
  // ...
}

// Middleware での認証チェック
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // JWT検証ロジック
}
```

### 認可パターン

- **ページレベル**: レイアウトでの認証チェック
- **操作レベル**: Server Actions での権限チェック
- **データレベル**: Service Layer での所有者チェック

---

## 🧪 テスト戦略

### テストピラミッド

```
        ┌─────────────────┐
        │   E2E Tests     │  ← Playwright（最小限）
        │   (少数・重要)    │
    ┌───┴─────────────────┴───┐
    │   Integration Tests     │  ← React Testing Library
    │   (中程度・主要フロー)     │
┌───┴─────────────────────────┴───┐
│        Unit Tests               │  ← Vitest（最多・各層）
│    (多数・個別コンポーネント)       │
└─────────────────────────────────┘
```

### テスト実装パターン

#### 1. Unit Tests（Presentational Components）

```typescript
// features/cattle/detail/__tests__/presentational.test.tsx
describe("CattleDetailPresentation", () => {
  it("should render cattle details correctly", () => {
    render(<CattleDetailPresentation cattle={mockCattle} />);
    
    expect(screen.getByText("テスト牛")).toBeInTheDocument();
    expect(screen.getByText(/1001/)).toBeInTheDocument();
  });

  it("should render loading state when no cattle", () => {
    render(<CattleDetailPresentation cattle={undefined} />);
    
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});
```

#### 2. Integration Tests（Container + Service）

```typescript
// features/cattle/detail/__tests__/container.test.tsx
vi.mock("@/services/cattleService", () => ({
  GetCattleDetail: vi.fn()
}));

describe("CattleDetailContainer", () => {
  it("should render cattle details correctly", async () => {
    vi.mocked(cattleService.GetCattleDetail).mockResolvedValue(mockCattle);

    render(await CattleDetailContainer({ id: "1" }));

    expect(screen.getByText("テスト牛")).toBeInTheDocument();
    expect(cattleService.GetCattleDetail).toHaveBeenCalledWith("1");
  });
});
```

#### 3. Server Actions Tests

```typescript
// features/cattle/new/__tests__/actions.test.ts
describe("createCattleAction", () => {
  it("should create cattle successfully", async () => {
    vi.mocked(verifyAndGetUserId).mockResolvedValue(1);
    vi.mocked(CreateCattle).mockResolvedValue();

    const formData = createMockFormData(validCattleData);
    const result = await createCattleAction(null, formData);

    expect(result.status).toBe("success");
    expect(CreateCattle).toHaveBeenCalledWith(expectedApiData);
  });
});
```

### テストのベストプラクティス

1. **AAA パターン**: Arrange, Act, Assert の明確な分離
2. **モックの最小化**: 必要最小限のモック使用
3. **データ駆動テスト**: 複数パターンでの網羅的テスト
4. **エラーケースの網羅**: 正常系・異常系両方のテスト
5. **アクセシビリティテスト**: スクリーンリーダー対応の確認

---

## ⚡ パフォーマンス最適化

### レンダリング最適化

1. **Server Components 優先**: データ取得はサーバーサイドで実行
2. **適切な Client Components**: インタラクションが必要な部分のみクライアント化
3. **Code Splitting**: 動的インポートによる必要時読み込み
4. **Image Optimization**: Next.js Image コンポーネント活用

### データ取得最適化

1. **並列データ取得**: Promise.all による同時実行
2. **キャッシュ戦略**: Next.js の fetch キャッシュ活用
3. **ストリーミング**: Suspense によるプログレッシブローディング
4. **Prefetching**: Link コンポーネントによる事前読み込み

### バンドル最適化

```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
    bundlePagesRouterDependencies: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};
```

---

## 🔒 セキュリティ実装

### セキュリティ原則

1. **Server-Side Validation**: 全てのユーザー入力をサーバーサイドで検証
2. **CSRF Protection**: Next.js の自動CSRF保護活用
3. **XSS Prevention**:適切なエスケープとサニタイゼーション
4. **認証トークン**: HttpOnly Cookie による安全なトークン管理

### 実装パターン

```typescript
// Server Actions でのセキュリティチェック
export async function secureAction(formData: FormData) {
  // 1. 認証チェック
  const userId = await verifyAndGetUserId();
  
  // 2. 入力値検証
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  
  // 3. 認可チェック
  const hasPermission = await checkPermission(userId, resource);
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  
  // 4. 安全な処理実行
}
```

---

## 📈 監視・ロギング

### エラー追跡

```typescript
// lib/error-tracking.ts
export function trackError(error: Error, context?: Record<string, unknown>) {
  // 開発環境
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, 'Context:', context);
    return;
  }
  
  // 本番環境 - 外部サービスに送信
  // Sentry, LogRocket 等の統合
}
```

### パフォーマンス監視

```typescript
// lib/performance.ts
export function measurePerformance<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  return fn().finally(() => {
    const duration = performance.now() - start;
    console.log(`${name} took ${duration}ms`);
  });
}
```

---

## 🚀 デプロイ・運用

### ビルド最適化

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:production": "NODE_ENV=production next build"
  }
}
```

### 環境変数管理

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

---

## 🔄 開発ワークフロー

### 新機能開発フロー

1. **設計**: 機能要件とUI設計の確認
2. **スキーマ定義**: Zod スキーマとTypeScript型定義
3. **Service Layer**: API通信ロジック実装
4. **Server Actions**: フォーム処理・状態変更実装
5. **Container**: データ取得・エラーハンドリング実装
6. **Presentational**: UI コンポーネント実装
7. **テスト**: Unit → Integration → E2E の順でテスト実装
8. **レビュー**: コードレビューと品質チェック

### 品質保証

```json
// package.json scripts
{
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "e2e": "playwright test"
}
```

---

## 📚 参考資料・学習リソース

### 公式ドキュメント
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 18 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### アーキテクチャパターン
- [Container/Presentational Pattern](https://www.patterns.dev/react/presentational-container-pattern)
- [Server Components Pattern](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### テスト戦略
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Vitest Guide](https://vitest.dev/guide/)

---

**最終更新**: 2025年8月  
**バージョン**: 1.0  
**対象**: Next.js 15 + App Router アプリケーション
