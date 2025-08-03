# アーキテクチャ・設計判断記録

## 概要

このドキュメントは、ギュウリスト（牛の個体管理アプリ）の技術選定と設計判断の記録です。
将来の開発時に「なぜこの実装にしたのか」を思い出すための備忘録として作成しています。

## 技術スタック

### フロントエンド

#### Next.js 15.3.1 + React 19
**選定理由:**
- App Routerによる最新のNext.jsパターンを採用
- Server Actions を活用してフォーム処理を簡素化
- Cloudflare Pagesでの静的サイト生成に最適
- React 19の新機能（`useActionState`、`startTransition`）を活用

**トレードオフ:**
- React 19は比較的新しく、一部のライブラリとの互換性に注意が必要
- Server Actionsは便利だが、クライアント側の複雑な状態管理には向かない

#### UI・スタイリング
- **Tailwind CSS 4**: ユーティリティファーストのCSS、高速な開発が可能
- **shadcn/ui + Radix UI**: アクセシブルで高品質なコンポーネント
- **Lucide React**: 一貫性のあるアイコンセット
- **date-fns**: 軽量で使いやすい日付操作ライブラリ

#### フォーム・バリデーション
- **@conform-to/react + Zod**: 
  - Server Actionsとの親和性が高い
  - TypeScriptの型安全性を保持
  - クライアント・サーバー両方でバリデーション可能
- **React Hook Form**: 複雑なフォームでのパフォーマンス最適化

**なぜConformを選んだか:**
- Next.js App RouterのServer Actionsと相性が良い
- Zodスキーマをフロントエンド・バックエンドで共有可能
- プログレッシブエンハンスメントに対応

### バックエンド

#### Hono + Cloudflare Workers
**選定理由:**
- 軽量で高速なWebフレームワーク
- Cloudflare Workersのエッジコンピューティングを活用
- TypeScriptファーストで型安全性が高い
- RPC機能でフロントエンドとの型共有が可能

**トレードオフ:**
- Node.jsの一部機能が使用不可（bcryptjsで回避）
- ローカル開発環境の設定がやや複雑

#### データベース・ORM
- **Cloudflare D1 + Drizzle ORM**
  - SQLiteベースで軽量
  - Drizzleは型安全で直感的なクエリ構築
  - マイグレーション管理が簡単

**なぜDrizzleを選んだか:**
- Prismaよりも軽量で、Cloudflare Workersに適している
- SQLライクな記述で学習コストが低い
- 型安全性とパフォーマンスのバランスが良い

#### 認証・セキュリティ
- **JWT + bcryptjs**
  - ステートレスな認証でスケーラブル
  - Cloudflare Workersでのbcrypt制約を回避

## アーキテクチャパターン

### フロントエンド設計

#### フォルダ構成
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   └── (authenticated)/   # 認証後ページ
├── components/            # 共通コンポーネント
│   └── ui/               # shadcn/uiコンポーネント
├── features/             # 機能別コンポーネント
│   ├── cattle/
│   │   ├── list/
│   │   ├── detail/
│   │   ├── new/
│   │   └── edit/
│   ├── events/
│   ├── schedule/
│   └── settings/
├── lib/                  # ユーティリティ
└── services/            # API呼び出し
```

**設計方針:**
- **機能別フォルダ構成**: 各機能（cattle、events等）を独立したフォルダで管理
- **Container/Presentational パターン**: データ取得とUI表示を分離
  - `container.tsx`: Server Component、データ取得
  - `presentational.tsx`: Client Component、UI表示
  - `actions.ts`: Server Actions
  - `schema.ts`: Zodバリデーションスキーマ

**なぜこの構成にしたか:**
- 機能単位での開発・保守がしやすい
- Server ComponentとClient Componentの役割が明確
- テスタビリティが向上

#### 状態管理
- **URL状態管理**: フィルタリングや検索はURLパラメータで管理
- **useActionState**: フォーム送信の状態管理
- **useState**: ローカルなUI状態のみ

**なぜReduxやZustandを使わないか:**
- Server Actionsで多くの状態管理が不要になった
- URLベースの状態管理で十分
- アプリの規模に対してオーバーエンジニアリング

### バックエンド設計

#### レイヤードアーキテクチャ
```
src/
├── routes/          # APIエンドポイント定義
├── services/        # ビジネスロジック
├── repositories/    # データアクセス層
├── middleware/      # 認証・CORS等
├── validators/      # Zodスキーマ
└── db/             # データベース定義
```

**各層の責務:**
- **Routes**: HTTPリクエスト/レスポンスの処理、バリデーション
- **Services**: ビジネスロジック、権限チェック
- **Repositories**: データベースアクセス、クエリ構築

**なぜこの構成にしたか:**
- 関心の分離により保守性が向上
- テストが書きやすい
- ビジネスロジックの再利用が可能

## 重要な設計判断

### 1. 認証フロー

**現在の実装:**
- JWT トークンをHTTPOnlyクッキーに保存
- ミドルウェアでトークン検証
- フロントエンドでは`cookies()`を使用してトークン取得

**なぜこの方式か:**
- XSS攻撃からトークンを保護
- CSRFトークンは今後実装予定
- サーバーサイドでの認証状態確認が可能

### 2. データベース設計

**外部キー制約の対応:**
```typescript
// 牛削除時に関連データも削除
await dbInstance.delete(events).where(eq(events.cattleId, cattleId));
await dbInstance.delete(bloodline).where(eq(bloodline.cattleId, cattleId));
// ... 他の関連テーブル
await dbInstance.delete(cattle).where(eq(cattle.cattleId, cattleId));
```

**なぜ手動で削除処理を実装したか:**
- SQLiteのCASCADE DELETEが一部制限される場合がある
- 削除処理の明示的な制御が可能
- 将来的にソフトデリートに変更しやすい

### 3. フォームバリデーション

**二重バリデーション:**
- フロントエンド: `@conform-to/react` + `Zod`
- バックエンド: `@hono/zod-validator` + `Zod`

**なぜ同じスキーマを使い回すか:**
- 型安全性の確保
- バリデーションロジックの一元管理
- フロントエンド・バックエンドの整合性保証

### 4. エラーハンドリング

**統一的なエラーレスポンス:**
```typescript
// 成功時
{ status: "success", message: "成功メッセージ" }
// エラー時  
{ status: "error", message: "エラーメッセージ" }
```

**なぜこの形式か:**
- フロントエンドでの統一的なエラー処理
- 日本語エラーメッセージでUX向上
- `toast`通知との親和性

## 将来の変更予定・検討事項

### 短期的な改善点

1. **CSRFトークン実装**
   - セキュリティ強化のため
   - Next.jsのCSRF対策ライブラリ検討

2. **エラー監視**
   - Sentryまたは類似サービスの導入
   - ログ集約の仕組み

3. **テスト実装**
   - Vitestでユニットテスト
   - Playwrightでe2eテスト

### 中長期的な変更可能性

1. **データベース移行**
   - 現在: Cloudflare D1 (SQLite)
   - 将来: PostgreSQL (Neon、Supabase等)
   - **移行理由**: より高度なクエリ、JSONB型、全文検索等

2. **認証システム強化**
   - 現在: 自前JWT実装
   - 将来: Auth0、Clerk、Supabase Auth等
   - **移行理由**: 2FA、OAuth、パスワードリセット等の機能

3. **状態管理の見直し**
   - 現在: Server Actions中心
   - 将来: リアルタイム機能追加時はWebSocket + 状態管理ライブラリ検討

4. **ファイルアップロード**
   - 現在: 未実装
   - 将来: Cloudflare R2 + 画像最適化

## パフォーマンス考慮事項

### 現在の最適化
- **画像最適化**: Next.jsのImage component使用
- **バンドル最適化**: 動的インポートでコード分割
- **キャッシング**: Cloudflare CDNによる静的アセットキャッシュ

### 監視すべき指標
- **Core Web Vitals**: LCP、FID、CLS
- **API レスポンス時間**: 特にデータベースクエリ
- **バンドルサイズ**: 特にクライアント側JavaScript

## 開発・デプロイフロー

### 現在の構成
- **開発**: `pnpm run dev` でローカル開発
- **ビルド**: Next.js静的エクスポート + Cloudflare Pages
- **API**: Cloudflare Workers
- **データベース**: D1 (local/remote)

### 環境管理
```
開発環境: localhost:3000 (Next.js) + localhost:8787 (Wrangler)
本番環境: Cloudflare Pages + Workers
```

## 注意点・ハマりポイント

### Cloudflare Workers制約
- **Node.js互換性**: `bcryptjs`使用（`bcrypt`は不可）
- **ファイルシステム**: 使用不可
- **実行時間制限**: CPU時間10ms（通常リクエスト）

### Next.js App Router
- **Server/Client Component**: `"use client"`の適切な配置が重要
- **useActionState**: React 19の新機能、`startTransition`が必要な場合あり

### 型安全性
- **API型共有**: `@repo/api`パッケージでHonoのRPC型を共有
- **Zod**: フロントエンド・バックエンドで同一スキーマ使用

## 参考資料

- [Next.js App Router](https://nextjs.org/docs/app)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Conform](https://conform.guide/)

---

**最終更新**: 2025年8月