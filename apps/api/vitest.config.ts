import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/shared": path.resolve(__dirname, "./src/shared"),
			"@/domain": path.resolve(__dirname, "./src/domain"),
			"@/application": path.resolve(__dirname, "./src/application"),
			"@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
			"@/interfaces": path.resolve(__dirname, "./src/interfaces"),
			"@/db": path.resolve(__dirname, "./src/db"),
			"@/lib": path.resolve(__dirname, "./src/lib"),
			"@/middleware": path.resolve(__dirname, "./src/middleware"),
			"@/routes": path.resolve(__dirname, "./src/routes")
		}
	},
	test: {
		environment: "node",
		globals: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			// 新アーキテクチャ: 重要な箇所のテストカバレッジ
			include: [
				// ドメイン層（ビジネスルールの核心）
				"src/domain/functions/**/*.ts",
				"src/domain/types/**/*.ts",

				// アプリケーション層（ユースケース）
				"src/application/use-cases/**/*.ts",

				// インフラ層（リポジトリ実装）
				"src/infrastructure/database/repositories/**/*.ts",
				"src/infrastructure/database/mappers/**/*.ts",

				// インターフェース層（コントローラー）
				"src/interfaces/http/controllers/**/*.ts",

				// 共有ユーティリティ
				"src/shared/result.ts",
				"src/shared/utils/base64.ts",

				// 重要なライブラリ関数
				"src/lib/auth.ts",
				"src/lib/mailer.ts",

				// 重要なミドルウェア
				"src/middleware/jwt.ts",
				"src/middleware/basicAuth.ts"
			],
			exclude: [
				// 基本的な除外項目
				"node_modules/",
				"dist/",
				"coverage/",
				".wrangler/**",

				// テスト関連ファイル
				"tests/**",
				"**/__tests__/**",
				"**/*.test.ts",
				"**/*.spec.ts",

				// 設定ファイル
				"**/*.config.*",
				"**/*.d.ts",

				// データベース関連（マイグレーション、ダミーデータ、スキーマ）
				"src/db/migrations/**",
				"src/db/dummy/**",
				"src/db/schema.ts",
				"src/db/tables/**",

				// 型定義のみのファイル
				"src/types.ts",

				// エントリーポイント（単純なexportのみ）
				"src/index.ts",

				// 外部サービス依存の高いファイル
				"src/lib/oauth.ts",
				"src/lib/session.ts",
				"src/routes/oauth.ts",
				"src/routes/**/*.ts", // ルートハンドラーは除外

				// ポート（インターフェース）のみのファイル
				"src/domain/ports/**/*.ts",

				// その他設定・ビルド関連
				"**/.{eslint,prettier}rc.{js,cjs,json}",
				"**/drizzle.config.ts",
				"**/wrangler.toml",

				// テンプレート・メール関連
				"src/lib/templates/**",
				"src/lib/resend.ts",

				// 低優先度のユーティリティ
				"src/shared/utils/data-helpers.ts",
				"src/shared/utils/request-helpers.ts",
				"src/shared/ports/**/*.ts",

				// 設定ファイル
				"src/infrastructure/config/**/*.ts",
				"src/shared/config/**/*.ts"
			],
			// 新アーキテクチャ: カバレッジのしきい値を現実的に設定
			thresholds: {
				statements: 5,
				branches: 5,
				functions: 5,
				lines: 5
			}
		}
	}
});
