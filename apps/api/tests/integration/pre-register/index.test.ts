import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import {
	type Mock,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
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

describe("pre-register", () => {
	let db: ReturnType<typeof createMemoryDB>;
	let env: Bindings;
	beforeEach(() => {
		db = createMemoryDB();
		env = {
			DB: db as unknown as AnyD1Database,
			ENVIRONMENT: "test",
			APP_URL: "http://localhost",
			JWT_SECRET: "",
			GOOGLE_CLIENT_ID: "",
			GOOGLE_CLIENT_SECRET: "",
			RESEND_API_KEY: "key",
			MAIL_FROM: "no-reply@gyulist.com",
			TURNSTILE_SECRET_KEY: "ts",
			ADMIN_USER: "admin",
			ADMIN_PASS: "pass",
			WEB_ORIGIN: "http://example.com",
		};
	});

	it("registers new email", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ success: true }),
				})
				.mockResolvedValueOnce({ ok: true, json: async () => ({ id: "e1" }) }),
		);
		const app = buildApp(env);
		const res = await app.request("http://localhost/api/v1/pre-register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: env.WEB_ORIGIN,
			},
			body: JSON.stringify({
				email: "User@Example.com ",
				referralSource: " search ",
				turnstileToken: "1234567890",
			}),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
		expect(db.registrations).toHaveLength(1);
		expect(db.registrations[0].email).toBe("user@example.com");
		expect(db.email_logs).toHaveLength(1);
		const fetchMock = fetch as unknown as Mock;
		expect(fetchMock.mock.calls).toHaveLength(2);
	});

	it("handles duplicate", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
		);
		const app = buildApp(env);
		// first
		await app.request("http://localhost/api/v1/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: env.WEB_ORIGIN },
			body: JSON.stringify({
				email: "a@b.com",
				turnstileToken: "1234567890",
			}),
		});
		// second
		const res = await app.request("http://localhost/api/v1/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: env.WEB_ORIGIN },
			body: JSON.stringify({
				email: "a@b.com",
				turnstileToken: "1234567890",
			}),
		});
		expect(await res.json()).toEqual({ ok: true, alreadyRegistered: true });
		expect(db.registrations).toHaveLength(1);
	});

	it("validation error", async () => {
		const app = buildApp(env);
		const res = await app.request("http://localhost/api/v1/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: env.WEB_ORIGIN },
			body: JSON.stringify({ email: "bad", turnstileToken: "short" }),
		});
		expect(res.status).toBe(400);
	});

	it("turnstile failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: false }),
			}),
		);
		const app = buildApp(env);
		const res = await app.request("http://localhost/api/v1/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: env.WEB_ORIGIN },
			body: JSON.stringify({
				email: "a@b.com",
				turnstileToken: "1234567890",
			}),
		});
		expect(res.status).toBe(400);
		expect(db.registrations).toHaveLength(0);
	});

	it("resend failure", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ success: true }),
				})
				.mockResolvedValueOnce({ ok: false, status: 500 }),
		);
		const app = buildApp(env);
		const res = await app.request("http://localhost/api/v1/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: env.WEB_ORIGIN },
			body: JSON.stringify({
				email: "c@d.com",
				turnstileToken: "1234567890",
			}),
		});
		expect(res.status).toBe(502);
		expect(db.registrations).toHaveLength(1);
		expect(db.email_logs).toHaveLength(1);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});
});
