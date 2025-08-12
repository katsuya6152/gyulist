import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRoutes } from "../../../src/routes";
import type { Bindings } from "../../../src/types";
import { createMemoryDB } from "../../fixtures/memoryDb";

const buildApp = (env: Bindings) => {
	const app = new Hono<{ Bindings: Bindings }>();
	app.use("*", async (c, next) => {
		c.env = env;
		await next();
	});
	return createRoutes(app);
};

describe("admin registrations", () => {
	let env: Bindings;
	let db: ReturnType<typeof createMemoryDB>;
	beforeEach(() => {
		db = createMemoryDB();
		db.registrations.push(
			{
				id: "1",
				email: "a@b.com",
				referralSource: "search",
				status: "confirmed",
				locale: "ja",
				createdAt: 1,
				updatedAt: 1,
			},
			{
				id: "2",
				email: "c@d.com",
				referralSource: null,
				status: "confirmed",
				locale: "ja",
				createdAt: 2,
				updatedAt: 2,
			},
		);
		env = {
			DB: db as unknown as AnyD1Database,
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
			WEB_ORIGIN: "http://example.com",
		};
	});

	it("requires auth", async () => {
		const app = buildApp(env);
		const res = await app.request(
			"http://localhost/api/v1/admin/registrations",
		);
		expect(res.status).toBe(401);
		expect(res.headers.get("WWW-Authenticate")).toContain("Basic");
	});

	it("lists registrations", async () => {
		const app = buildApp(env);
		const res = await app.request(
			"http://localhost/api/v1/admin/registrations?limit=1&offset=1",
			{
				headers: {
					Authorization: `Basic ${Buffer.from("admin:pass").toString("base64")}`,
					Origin: env.WEB_ORIGIN,
				},
			},
		);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.total).toBe(2);
		expect(data.items).toHaveLength(1);
		expect(data.items[0].email).toBe("a@b.com");
	});

	it("returns csv", async () => {
		const app = buildApp(env);
		const date = new Date("2024-01-02T00:00:00Z");
		vi.setSystemTime(date);
		const res = await app.request(
			"http://localhost/api/v1/admin/registrations.csv",
			{
				headers: {
					Authorization: `Basic ${Buffer.from("admin:pass").toString("base64")}`,
					Origin: env.WEB_ORIGIN,
				},
			},
		);
		const disposition = res.headers.get("Content-Disposition") ?? "";
		expect(disposition).toContain("registrations_20240102.csv");
		expect(res.headers.get("Content-Type")).toBe("text/csv");
		const buffer = new Uint8Array(await res.arrayBuffer());
		expect(buffer[0]).toBe(0xef);
		expect(buffer[1]).toBe(0xbb);
		expect(buffer[2]).toBe(0xbf);
		vi.useRealTimers();
	});
});
