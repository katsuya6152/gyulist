import path from "node:path";
import react from "@vitejs/plugin-react";
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
			"**/e2e/**", // e2eテストを除外
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			exclude: [
				"node_modules/",
				"src/test/setup.ts",
				".next/",
				"**/*.d.ts",
				"**/index.ts",
				"src/app/**/*",
				"src/components/ui/**/*",
				"src/lib/**/*",
				"e2e/**/*", // e2eテストをカバレッジからも除外
			],
			include: ["src/features/**/*"],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@repo/api": path.resolve(__dirname, "../api/src"),
		},
	},
});
