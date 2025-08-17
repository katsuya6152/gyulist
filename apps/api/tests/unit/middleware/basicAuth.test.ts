import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { basicAuthMiddleware } from "../../../src/middleware/basicAuth";
import type { Bindings } from "../../../src/types";

const buildApp = (env: Bindings) => {
	const app = new Hono<{ Bindings: Bindings }>();
	app.use("*", async (c, next) => {
		c.env = env;
		await next();
	});
	app.use("*", basicAuthMiddleware);
	app.get("/secure", (c) => c.text("ok"));
	return app;
};

describe("basicAuthMiddleware", () => {
	let env: Bindings;
	beforeEach(() => {
		env = {
			DB: {} as unknown as AnyD1Database,
			ENVIRONMENT: "test",
			APP_URL: "http://localhost",
			JWT_SECRET: "",
			GOOGLE_CLIENT_ID: "",
			GOOGLE_CLIENT_SECRET: "",
			RESEND_API_KEY: "",
			MAIL_FROM: "",
			TURNSTILE_SECRET_KEY: "",
			ADMIN_USER: "admin",
			ADMIN_PASS: "pass",
			WEB_ORIGIN: "http://localhost:3000"
		};
	});

	it("allows OPTIONS without auth (returns 404 if no route for OPTIONS)", async () => {
		const app = buildApp(env);
		const res = await app.request("http://localhost/secure", {
			method: "OPTIONS"
		});
		// 現状は明示 OPTIONS ハンドラがないため 404 だが、ミドルウェアは認証をスキップしていることを確認（401ではない）
		expect(res.status).not.toBe(401);
	});

	it("rejects when missing Authorization header", async () => {
		const app = buildApp(env);
		const res = await app.request("http://localhost/secure");
		expect(res.status).toBe(401);
		expect(res.headers.get("WWW-Authenticate")).toContain("Basic");
	});

	it("rejects with wrong credentials", async () => {
		const app = buildApp(env);
		const bad = btoa("admin:wrong");
		const res = await app.request("http://localhost/secure", {
			headers: { Authorization: `Basic ${bad}` }
		});
		expect(res.status).toBe(401);
		expect(res.headers.get("WWW-Authenticate")).toContain("Basic");
	});

	it("allows with correct credentials", async () => {
		const app = buildApp(env);
		const ok = btoa("admin:pass");
		const res = await app.request("http://localhost/secure", {
			headers: { Authorization: `Basic ${ok}` }
		});
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("ok");
	});
});
