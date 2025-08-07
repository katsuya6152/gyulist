import type { AnyD1Database } from "drizzle-orm/d1";

export type Bindings = {
	DB: AnyD1Database;
	ENVIRONMENT: string;
	APP_URL: string;
	JWT_SECRET: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
};
