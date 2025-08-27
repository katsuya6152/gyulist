export interface D1EnvironmentConfig {
	NODE_ENV: "development" | "test" | "production";
	D1_BINDING: string; // デフォルト: "DB"
	D1_DATABASE_NAME: string; // デフォルト: "gyulist-db"
	D1_DATABASE_ID?: string; // 本番環境でのD1データベースID
	MIGRATIONS_DIR: string; // デフォルト: "drizzle/migrations"
}

export function loadD1EnvironmentConfig(): D1EnvironmentConfig {
	return {
		NODE_ENV: (process.env.NODE_ENV ||
			"development") as D1EnvironmentConfig["NODE_ENV"],
		D1_BINDING: process.env.D1_BINDING || "DB",
		D1_DATABASE_NAME: process.env.D1_DATABASE_NAME || "gyulist-db",
		D1_DATABASE_ID: process.env.D1_DATABASE_ID,
		MIGRATIONS_DIR: process.env.MIGRATIONS_DIR || "drizzle/migrations"
	};
}
