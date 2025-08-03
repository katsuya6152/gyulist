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
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			exclude: [
				"node_modules/",
				"src/test/setup.ts",
				".next/",
				"**/*.d.ts",
				"**/index.ts",
				"src/app/**/*",
				"src/components/ui/**/*",
				"src/lib/**/*",
			],
			include: ["src/features/**/*"],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
