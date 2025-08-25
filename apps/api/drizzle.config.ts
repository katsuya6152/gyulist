import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle/migrations",
	dialect: "sqlite",
	// マイグレーションファイルの出力先
	migrations: {
		table: "drizzle_migrations",
		schema: "./drizzle/schema.ts"
	}
});
