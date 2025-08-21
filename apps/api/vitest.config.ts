import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/shared": path.resolve(__dirname, "./src/shared"),
			"@/contexts": path.resolve(__dirname, "./src/contexts"),
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
			// ベータ版: 最も重要な箇所のみテストカバレッジに含める
			include: [
				// ドメインロジック（ビジネスルールの核心）
				"src/contexts/*/domain/model/**/*.ts",
				"src/contexts/*/domain/services/**/*.ts",

				// 共有ユーティリティ（再利用性の高い関数）
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
				"src/contexts/*/ports.ts",
				"src/contexts/*/domain/ports.ts",

				// その他設定・ビルド関連
				"**/.{eslint,prettier}rc.{js,cjs,json}",
				"**/drizzle.config.ts",
				"**/wrangler.toml",

				// テンプレート・メール関連
				"src/lib/templates/**",
				"src/lib/resend.ts",

				// 低優先度のユーティリティ（ベータ版では除外）
				"src/shared/utils/data-helpers.ts",
				"src/shared/utils/request-helpers.ts",
				"src/shared/ports/**/*.ts",

				// 低優先度のドメインサービス（ベータ版では除外）
				"src/contexts/*/domain/services/breeding.ts",
				"src/contexts/*/domain/services/breedingManagement.ts",
				"src/contexts/*/domain/services/createCattle.ts",
				"src/contexts/*/domain/services/getDetail.ts",
				"src/contexts/*/domain/services/breeding.ts",
				"src/contexts/*/domain/services/breedingKpiCalculator.ts",
				"src/contexts/*/domain/services/trends.ts",
				"src/contexts/*/domain/services/delta.ts",
				"src/contexts/*/domain/errors.ts",
				"src/contexts/*/domain/constants.ts"
			],
			// ベータ版: カバレッジのしきい値をさらに緩めに設定
			thresholds: {
				statements: 40,
				branches: 40,
				functions: 40,
				lines: 40
			}
		}
	}
});
