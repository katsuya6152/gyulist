import type { AnyD1Database } from "drizzle-orm/d1";

export type Bindings = {
	DB: AnyD1Database;
	ENVIRONMENT: string;
	APP_URL: string;
	JWT_SECRET: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	RESEND_API_KEY: string;
	MAIL_FROM: string;
	TURNSTILE_SECRET_KEY: string;
	ADMIN_USER: string;
	ADMIN_PASS: string;
};

export type Registration = {
	id: string;
	email: string;
	referral_source: string | null;
	status: string;
	locale: string;
	created_at: number;
	updated_at: number;
};

export type EmailLog = {
	id: string;
	email: string;
	type: string;
	http_status?: number | null;
	resend_id?: string | null;
	error?: string | null;
	created_at: number;
};
