import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			// テスト対象ファイルを明確に指定
			include: [
				"src/**/*.ts",
				"!tests/**",
				"!src/**/*.test.ts",
				"!src/**/*.spec.ts",
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

				// データベース関連（マイグレーション、ダミーデータ）
				"src/db/migrations/**",
				"src/db/dummy/**",

				// モックファイル
				"tests/fixtures/**",

				// 型定義のみのファイル
				"src/types.ts",

				// エントリーポイント（単純なexportのみ）
				"src/index.ts",

				// OAuth関連（外部サービス依存が多い）
				"src/lib/oauth.ts",
				"src/lib/session.ts",
				"src/routes/oauth.ts",

				// その他設定・ビルド関連
				"**/.{eslint,prettier}rc.{js,cjs,json}",
				"**/drizzle.config.ts",
				"**/wrangler.toml",
			],
			// カバレッジのしきい値を設定
			// thresholds: {
			// 	statements: 80,
			// 	branches: 80,
			// 	functions: 80,
			// 	lines: 80,
			// },
		},
	},
});
