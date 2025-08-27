import type { D1Database } from "@cloudflare/workers-types";
import type { AnyD1Database } from "drizzle-orm/d1";

export interface D1DatabasePort {
	// D1の生の操作（Drizzle ORMで使用）
	getRawD1(): D1Database;

	// Drizzle ORMインスタンス
	getDrizzle(): ReturnType<typeof import("drizzle-orm/d1").drizzle>;

	// 接続状態
	isConnected(): boolean;
}

// Cloudflare Workers環境での環境変数型定義
export interface Env {
	DB: AnyD1Database;
	ENVIRONMENT: string;
	APP_URL: string;
	JWT_SECRET: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	RESEND_API_KEY: string;
	MAIL_FROM?: string;
	TURNSTILE_SECRET_KEY: string;
	ADMIN_USER: string;
	ADMIN_PASS: string;
	WEB_ORIGIN: string;
}
