# AGENTS

## 開発環境
- Node.js 20 と pnpm を使用するモノレポです。
- コミットする前に `pnpm format` と `pnpm lint` を実行し、Biome でコード整形と Lint を通してください。
- Biome 設定: タブインデント、ダブルクォート、import の自動整理。
- コミットメッセージは Conventional Commits に従ってください。

## テスト
- 修正したパッケージに対して必ずテストを実行してください。（APIに関してはカバレッジの閾値が80%を超えるようにテストを追加してください。）
  - API を変更した場合: `pnpm -F api test`（必要に応じて `test:coverage` など）。
  - Web を変更した場合: `pnpm -F web test`。
- E2E テストは基本的に実行不要です。必要な場合のみ `pnpm -F web e2e` を使ってください。
- 実装後はAPI, WEBそれぞれビルドが通ることを確認してください。

## ディレクトリ別ルール
### apps/api/
- Hono + Cloudflare Workers + D1/Drizzle ORM。
- レイヤード構成: `routes/`, `services/`, `repositories/`, `middleware/`, `validators/`, `db/`。
- バリデーションは Zod（`@hono/zod-validator`）で統一。
- マイグレーション生成: `pnpm -F api generate`（Drizzle）。
- テストは Vitest を使用 (`apps/api/src/tests`)。

### apps/web/
- Next.js 15 (App Router) + Tailwind CSS + shadcn/ui。
- `features/[機能]/[操作]/` 配下に Container/Presentational パターンで実装。
  - `container.tsx`: Server Component（データ取得）
  - `presentational.tsx`: Client Component（UI）
  - `actions.ts`: Server Actions
  - `schema.ts`: Zod スキーマ
- 命名規則:
  - コンポーネント: `PascalCase.tsx`
  - ユーティリティ: `camelCase.ts`
  - ディレクトリ: `kebab-case`
- テストは Vitest (`apps/web/src/test/setup.ts` でブラウザ API をモック)。

## ドキュメント
- 仕様やスキーマを変更した場合は `docs/` 内の該当ドキュメントを更新してください。

## フォーマット
- Markdown や JSON など Biome 対象外ファイルのフォーマットルールは特にありません。一般的なスタイルを用いてください。

