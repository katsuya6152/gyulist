# Web 実装ガイドライン

**Gyulist Web Frontend - 開発者向け実装規約**

---

## 📋 概要

このドキュメントは、Gyulist Web Frontend の開発における具体的な実装規約とベストプラクティスを定義します。一貫性のあるコード品質と開発効率の向上を目的としています。

---

## 🏗️ ファイル・ディレクトリ命名規約

### ディレクトリ構造規約

```
features/[feature]/[operation]/
├── container.tsx          # Server Component（必須）
├── presentational.tsx     # Client Component（必須）
├── actions.ts             # Server Actions（フォーム処理時）
├── schema.ts              # Zod スキーマ（バリデーション時）
├── constants.ts           # 定数定義（必要時）
├── types.ts               # 型定義（複雑な場合）
├── components/            # 専用コンポーネント
│   ├── component-name.tsx
│   └── __tests__/
└── __tests__/             # テストファイル
    ├── container.test.tsx
    ├── presentational.test.tsx
    ├── actions.test.ts
    └── integration.test.tsx
```

### ファイル命名規約

| ファイル種別 | 命名形式 | 例 |
|-------------|----------|-----|
| **Container** | `container.tsx` | `container.tsx` |
| **Presentational** | `presentational.tsx` | `presentational.tsx` |
| **Server Actions** | `actions.ts` | `actions.ts` |
| **スキーマ** | `schema.ts` | `schema.ts` |
| **コンポーネント** | `kebab-case.tsx` | `basic-info.tsx` |
| **テスト** | `*.test.tsx` | `container.test.tsx` |
| **型定義** | `types.ts` | `types.ts` |

### 変数・関数命名規約

```typescript
// ✅ 良い例
const cattleDetail = await GetCattleDetail(id);
const handleSubmit = useCallback(() => {}, []);
const isLoading = useState(false);

// ❌ 悪い例
const data = await GetCattleDetail(id);
const submit = useCallback(() => {}, []);
const loading = useState(false);
```

---

## 🧩 Container/Presentational パターン実装

### Container Component 実装規約

```typescript
// features/[feature]/[operation]/container.tsx
import { Service } from "@/services/serviceFile";
import Presentation from "./presentational";

// 型定義は明示的に
type Props = {
  id: string;
  searchParams?: Record<string, string>;
};

export default async function FeatureContainer({ id, searchParams }: Props) {
  try {
    // 1. データ取得（並列実行推奨）
    const [data1, data2] = await Promise.all([
      Service1.getData(id),
      Service2.getData(searchParams)
    ]);

    // 2. Presentational に Props 渡し
    return (
      <Presentation 
        data1={data1}
        data2={data2}
        error={undefined}
      />
    );
  } catch (error) {
    // 3. エラーハンドリング
    console.error("Failed to fetch data:", error);
    
    // 4. エラー状態の Presentational 呼び出し
    return (
      <Presentation 
        data1={undefined}
        data2={undefined}
        error="データの取得に失敗しました"
      />
    );
  }
}
```

### Presentational Component 実装規約

```typescript
// features/[feature]/[operation]/presentational.tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

// Props型は明示的に定義
type Props = {
  data1?: DataType1;
  data2?: DataType2;
  error?: string;
};

export default function FeaturePresentation({ data1, data2, error }: Props) {
  // 1. State定義（UI状態のみ）
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. イベントハンドラー定義
  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 3. 早期リターンパターン
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!data1 || !data2) {
    return <LoadingSpinner />;
  }

  // 4. メインレンダリング
  return (
    <div className="space-y-6">
      <Header data={data1} />
      <Content 
        data={data2}
        isExpanded={isExpanded}
        onToggle={handleToggle}
      />
    </div>
  );
}
```

---

## 🎬 Server Actions 実装規約

### 基本実装パターン

```typescript
// features/[feature]/[operation]/actions.ts
"use server";

import { parseWithZod } from "@conform-to/zod";
import { verifyAndGetUserId, isDemo, createDemoResponse } from "@/lib/auth";
import { ServiceFunction } from "@/services/serviceFile";
import { schema } from "./schema";

export async function actionName(
  prevState: unknown,
  formData: FormData
) {
  // 1. バリデーション
  const submission = parseWithZod(formData, { schema });
  
  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    // 2. 認証チェック
    const userId = await verifyAndGetUserId();
    
    // 3. デモユーザー処理
    if (isDemo(userId)) {
      return createDemoResponse("success");
    }

    // 4. データ変換
    const apiData = transformToApiFormat(submission.value);

    // 5. サービス呼び出し
    await ServiceFunction(apiData);

    // 6. 成功レスポンス
    return submission.reply();
    
  } catch (error) {
    console.error("Action failed:", error);
    
    // 7. エラーレスポンス
    return submission.reply({
      formErrors: ["処理に失敗しました"]
    });
  }
}

// データ変換関数は分離
function transformToApiFormat(formData: FormType): ApiType {
  return {
    // 必要な変換処理
  };
}
```

### フォーム統合パターン

```typescript
// Presentational Component 内
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod, getZodConstraint } from "@conform-to/zod";
import { actionName } from "./actions";
import { schema } from "./schema";

export function FormComponent() {
  // 1. Action State 管理
  const [lastResult, action, isPending] = useActionState(actionName, null);

  // 2. Form 設定
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form {...getFormProps(form)} action={action}>
      {/* フォームフィールド */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "処理中..." : "送信"}
      </Button>
    </form>
  );
}
```

---

## 🔧 Service Layer 実装規約

### API通信サービス実装

```typescript
// services/featureService.ts
import { client } from "@/lib/api-client";
import { fetchWithAuth } from "@/lib/auth";
import type { InferRequestType, InferResponseType } from "hono/client";

// 型定義（API契約から自動生成）
export type GetDataResType = InferResponseType<
  typeof client.api.v1.feature[":id"]["$get"]
>;

export type CreateDataInput = InferRequestType<
  typeof client.api.v1.feature["$post"]
>["json"];

// GET API
export async function GetData(id: string): Promise<GetDataResType> {
  return fetchWithAuth<GetDataResType>((token) =>
    client.api.v1.feature[id].$get(
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  );
}

// POST API
export async function CreateData(data: CreateDataInput): Promise<void> {
  return fetchWithAuth<void>((token) =>
    client.api.v1.feature.$post(
      { json: data },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  );
}

// 複雑なクエリパラメータを持つAPI
export type QueryParams = {
  cursor?: string;
  limit?: number;
  search?: string;
};

export async function SearchData(
  queryParams: QueryParams = {}
): Promise<SearchDataResType> {
  return fetchWithAuth<SearchDataResType>((token) =>
    client.api.v1.feature.$get(
      {
        query: {
          cursor: queryParams.cursor,
          limit: queryParams.limit?.toString(),
          search: queryParams.search,
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  );
}
```

### エラーハンドリング規約

```typescript
// services/baseService.ts
export async function handleApiError<T>(
  apiCall: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`API Error in ${context}:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('認証が必要です');
      }
      if (error.message.includes('403')) {
        throw new Error('権限がありません');
      }
      if (error.message.includes('404')) {
        throw new Error('データが見つかりません');
      }
    }
    
    throw new Error('通信エラーが発生しました');
  }
}
```

---

## 🎨 UI・スタイリング規約

### Tailwind CSS クラス使用規約

```typescript
// ✅ 推奨パターン
const buttonClasses = cn(
  "px-4 py-2 rounded-md font-medium transition-colors",
  "hover:bg-opacity-90 focus:outline-none focus:ring-2",
  variant === "primary" && "bg-blue-600 text-white",
  variant === "secondary" && "bg-gray-200 text-gray-900",
  disabled && "opacity-50 cursor-not-allowed"
);

// ❌ 非推奨パターン
const buttonClasses = `px-4 py-2 rounded-md font-medium transition-colors hover:bg-opacity-90 focus:outline-none focus:ring-2 ${variant === "primary" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
```

### コンポーネント分割規約

```typescript
// 大きなコンポーネントは適切に分割
export function CattleDetailPresentation({ cattle }: Props) {
  return (
    <div className="space-y-6">
      <CattleBasicInfo cattle={cattle} />
      <CattleBloodline cattle={cattle} />
      <CattleBreeding cattle={cattle} />
      <CattleEvents cattle={cattle} />
    </div>
  );
}

// 各セクションは独立したコンポーネント
function CattleBasicInfo({ cattle }: { cattle: CattleDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>基本情報</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 基本情報の表示 */}
      </CardContent>
    </Card>
  );
}
```

---

## 🧪 テスト実装規約

### Unit Test（Presentational Component）

```typescript
// features/[feature]/[operation]/__tests__/presentational.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Presentation from "../presentational";

describe("FeaturePresentation", () => {
  const mockData = {
    // テスト用のモックデータ
  };

  it("should render data correctly", () => {
    render(<Presentation data={mockData} />);
    
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("should handle user interaction", async () => {
    const user = userEvent.setup();
    render(<Presentation data={mockData} />);
    
    const button = screen.getByRole("button", { name: "Toggle" });
    await user.click(button);
    
    expect(screen.getByText("Toggled State")).toBeInTheDocument();
  });

  it("should render error state", () => {
    render(<Presentation data={undefined} error="Error message" />);
    
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render loading state", () => {
    render(<Presentation data={undefined} />);
    
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});
```

### Integration Test（Container + Service）

```typescript
// features/[feature]/[operation]/__tests__/container.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import * as service from "@/services/featureService";
import Container from "../container";

// サービスのモック
vi.mock("@/services/featureService", () => ({
  GetData: vi.fn()
}));

describe("FeatureContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render data from service", async () => {
    const mockData = { /* モックデータ */ };
    vi.mocked(service.GetData).mockResolvedValue(mockData);

    render(await Container({ id: "1" }));

    expect(screen.getByText("Expected Data")).toBeInTheDocument();
    expect(service.GetData).toHaveBeenCalledWith("1");
  });

  it("should handle service error", async () => {
    vi.mocked(service.GetData).mockRejectedValue(new Error("API Error"));

    render(await Container({ id: "1" }));

    expect(screen.getByText("データの取得に失敗しました")).toBeInTheDocument();
  });
});
```

### Server Actions Test

```typescript
// features/[feature]/[operation]/__tests__/actions.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import * as auth from "@/lib/auth";
import * as service from "@/services/featureService";
import { actionName } from "../actions";

// 必要なモジュールをモック
vi.mock("@/lib/auth");
vi.mock("@/services/featureService");

describe("actionName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process valid form data successfully", async () => {
    // モックの設定
    vi.mocked(auth.verifyAndGetUserId).mockResolvedValue(1);
    vi.mocked(auth.isDemo).mockReturnValue(false);
    vi.mocked(service.CreateData).mockResolvedValue();

    // フォームデータの作成
    const formData = new FormData();
    formData.append("field1", "value1");
    formData.append("field2", "value2");

    // アクション実行
    const result = await actionName(null, formData);

    // アサーション
    expect(result.status).toBe("success");
    expect(service.CreateData).toHaveBeenCalledWith(
      expect.objectContaining({
        field1: "value1",
        field2: "value2"
      })
    );
  });

  it("should handle validation errors", async () => {
    const formData = new FormData();
    // 無効なデータ

    const result = await actionName(null, formData);

    expect(result.status).toBe("error");
    expect(result.error).toBeDefined();
  });

  it("should handle demo user", async () => {
    vi.mocked(auth.verifyAndGetUserId).mockResolvedValue(999);
    vi.mocked(auth.isDemo).mockReturnValue(true);
    vi.mocked(auth.createDemoResponse).mockReturnValue({
      status: "success",
      message: "Demo response"
    });

    const formData = new FormData();
    formData.append("field1", "value1");

    const result = await actionName(null, formData);

    expect(result.status).toBe("success");
    expect(service.CreateData).not.toHaveBeenCalled();
  });
});
```

---

## 🔒 セキュリティ実装規約

### 入力値検証

```typescript
// schema.ts - Zod スキーマ定義
import { z } from "zod";

export const createSchema = z.object({
  name: z.string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),
  
  email: z.string()
    .email("有効なメールアドレスを入力してください"),
  
  age: z.coerce.number()
    .int("整数で入力してください")
    .min(0, "0以上の値を入力してください")
    .max(150, "150以下の値を入力してください"),
  
  // オプショナルフィールド
  notes: z.string()
    .max(1000, "メモは1000文字以内で入力してください")
    .optional(),
});

export type CreateFormData = z.infer<typeof createSchema>;
```

### 認証・認可チェック

```typescript
// actions.ts 内での認証チェック
export async function protectedAction(formData: FormData) {
  try {
    // 1. JWT認証チェック
    const userId = await verifyAndGetUserId();
    
    // 2. 追加の権限チェック（必要に応じて）
    const hasPermission = await checkResourcePermission(userId, resourceId);
    if (!hasPermission) {
      return {
        status: "error" as const,
        message: "この操作を行う権限がありません"
      };
    }
    
    // 3. 処理実行
    
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error" as const,
        message: "認証が必要です"
      };
    }
    throw error;
  }
}
```

---

## 📊 パフォーマンス実装規約

### データ取得最適化

```typescript
// Container での並列データ取得
export default async function OptimizedContainer({ id }: Props) {
  try {
    // ✅ 並列実行
    const [mainData, relatedData, statsData] = await Promise.all([
      GetMainData(id),
      GetRelatedData(id),
      GetStatsData(id)
    ]);

    return <Presentation {...{ mainData, relatedData, statsData }} />;
    
  } catch (error) {
    // エラーハンドリング
  }
}

// ❌ 直列実行（避ける）
export default async function SlowContainer({ id }: Props) {
  const mainData = await GetMainData(id);
  const relatedData = await GetRelatedData(id);
  const statsData = await GetStatsData(id);
  
  return <Presentation {...{ mainData, relatedData, statsData }} />;
}
```

### メモ化とコールバック最適化

```typescript
// Presentational Component 内
export function OptimizedPresentation({ data, onUpdate }: Props) {
  // ✅ 適切なメモ化
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      displayName: formatDisplayName(item.name)
    }));
  }, [data]);

  // ✅ 安定したコールバック
  const handleItemClick = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  // ✅ 条件付きレンダリングの最適化
  const renderItems = useMemo(() => {
    return processedData.map(item => (
      <Item 
        key={item.id}
        data={item}
        onClick={handleItemClick}
      />
    ));
  }, [processedData, handleItemClick]);

  return <div>{renderItems}</div>;
}
```

---

## 🚨 エラーハンドリング規約

### エラーバウンダリー実装

```typescript
// components/error-boundary.tsx
"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // エラー追跡サービスに送信
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2>エラーが発生しました</h2>
          <p>ページを再読み込みしてください</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### グレースフルデグラデーション

```typescript
// 部分的なエラーハンドリング
export function FeaturePresentation({ mainData, optionalData, error }: Props) {
  if (error?.critical) {
    return <CriticalErrorDisplay error={error} />;
  }

  return (
    <div>
      {/* メインコンテンツは常に表示 */}
      <MainContent data={mainData} />
      
      {/* オプショナルコンテンツはエラー時にフォールバック */}
      {optionalData ? (
        <OptionalContent data={optionalData} />
      ) : error?.optional ? (
        <div className="text-gray-500">
          一部の情報を取得できませんでした
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
}
```

---

## 🔄 開発ワークフロー

### 新機能開発チェックリスト

#### 1. 設計フェーズ
- [ ] 機能要件の明確化
- [ ] UI/UX設計の確認
- [ ] API契約の確認
- [ ] データフローの設計

#### 2. 実装フェーズ
- [ ] Zodスキーマ定義
- [ ] TypeScript型定義
- [ ] Service Layer実装
- [ ] Server Actions実装（必要時）
- [ ] Container Component実装
- [ ] Presentational Component実装

#### 3. テストフェーズ
- [ ] Unit Tests（Presentational）
- [ ] Integration Tests（Container）
- [ ] Server Actions Tests（必要時）
- [ ] E2E Tests（重要フロー）

#### 4. 品質チェック
- [ ] ESLint チェック
- [ ] TypeScript型チェック
- [ ] テストカバレッジ確認
- [ ] パフォーマンス確認
- [ ] アクセシビリティ確認

### コードレビューチェックポイント

#### アーキテクチャ
- [ ] Container/Presentationalの責務分離
- [ ] 適切なServer Components/Client Componentsの使い分け
- [ ] 状態管理の適切性

#### 実装品質
- [ ] TypeScript型安全性
- [ ] エラーハンドリングの網羅性
- [ ] パフォーマンス最適化
- [ ] セキュリティ考慮

#### テスト品質
- [ ] 適切なテスト範囲
- [ ] エッジケースの考慮
- [ ] モックの適切な使用

---

## 📚 開発ツール・ライブラリ使用規約

### 必須ライブラリ

| 用途 | ライブラリ | バージョン | 備考 |
|------|-----------|-----------|------|
| **フレームワーク** | Next.js | ^15.0.0 | App Router使用 |
| **UI** | shadcn/ui + Tailwind | latest | デザインシステム |
| **フォーム** | React Hook Form + Conform | latest | バリデーション統合 |
| **バリデーション** | Zod | latest | スキーマ定義 |
| **テスト** | Vitest + Testing Library | latest | 単体・統合テスト |
| **E2E** | Playwright | latest | エンドツーエンドテスト |

### 推奨ライブラリ

| 用途 | ライブラリ | 使用条件 |
|------|-----------|----------|
| **日付処理** | date-fns | 日付計算が必要な場合 |
| **アニメーション** | Framer Motion | 複雑なアニメーションが必要な場合 |
| **状態管理** | Zustand | グローバル状態が必要な場合（最小限） |

---

**最終更新**: 2025年8月  
**バージョン**: 1.0  
**対象**: Gyulist Web Frontend
