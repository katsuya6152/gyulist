import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authRoutes from "../../src/routes/auth";
import type { Bindings } from "../../src/types";
import { createFakeD1 } from "./helpers/fakeDrizzle";

// Mock mailer used by register
vi.mock("../../src/lib/mailer", () => ({
	sendVerificationEmail: vi.fn().mockResolvedValue(undefined)
}));

// Do not mock drizzle for this test; we only exercise validation paths

describe("Auth API E2E", () => {
	let app: Hono<{ Bindings: Bindings }>;

	beforeEach(async () => {
		app = new Hono<{ Bindings: Bindings }>();
		app.use("*", async (c, next) => {
			c.env = {
				DB: createFakeD1(),
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
		app.route("/auth", authRoutes);
	});

	it("POST /auth/login validation error -> 400", async () => {
		const res = await app.request("/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "invalid-email", password: "short" })
		});
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error ?? body.message).toBeDefined();
	});

	it("POST /auth/register validation error -> 400", async () => {
		const res = await app.request("/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "invalid" })
		});
		expect(res.status).toBe(400);
	});

	it("POST /auth/verify validation error -> 400", async () => {
		const res = await app.request("/auth/verify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: "short" })
		});
		expect(res.status).toBe(400);
	});

	it("POST /auth/complete validation error -> 400", async () => {
		const res = await app.request("/auth/complete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: "short", name: "", password: "123" })
		});
		expect(res.status).toBe(400);
	});
});
