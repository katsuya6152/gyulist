import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import adminRoutes from "../../../../../src/routes/admin";
import type { Bindings } from "../../../../../src/types";

describe("Admin API E2E (basic auth)", () => {
	let app: Hono<{ Bindings: Bindings }>;

	beforeEach(() => {
		app = new Hono<{ Bindings: Bindings }>();
		app.use("*", async (c, next) => {
			c.env = {
				DB: {} as AnyD1Database,
				JWT_SECRET: "test-secret",
				ENVIRONMENT: "test",
				APP_URL: "http://localhost:3000",
				GOOGLE_CLIENT_ID: "",
				GOOGLE_CLIENT_SECRET: "",
				RESEND_API_KEY: "",
				MAIL_FROM: "",
				TURNSTILE_SECRET_KEY: "",
				ADMIN_USER: "a",
				ADMIN_PASS: "b",
				WEB_ORIGIN: "http://localhost:3000"
			} as unknown as Bindings;
			await next();
		});
		app.route("/admin", adminRoutes);
	});

	it("GET /admin/registrations requires basic auth", async () => {
		const res = await app.request("/admin/registrations");
		expect(res.status).toBe(401);
	});

	it("GET /admin/registrations.csv requires basic auth", async () => {
		const res = await app.request("/admin/registrations.csv");
		expect(res.status).toBe(401);
	});
});
