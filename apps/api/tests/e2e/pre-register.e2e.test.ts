import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import preRegisterRoutes from "../../src/routes/pre-register";
import type { Bindings } from "../../src/types";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
} from "./helpers/fakeDrizzle";

// Mock external services used by preRegister
vi.mock("../../src/lib/turnstile", () => ({
	verifyTurnstile: vi.fn().mockResolvedValue(true),
}));
vi.mock("../../src/lib/resend", () => ({
	sendCompletionEmail: vi.fn().mockResolvedValue({ id: "resend-1" }),
}));

describe("Pre-Register API E2E", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;

	beforeEach(() => {
		store = createEmptyStore();
		// use MemoryDB shape for registration/email logs
		const memoryDb = {
			registrations: [] as unknown[],
			email_logs: [] as unknown[],
		} as unknown as AnyD1Database;

		app = new Hono<{ Bindings: Bindings }>();
		app.use("*", async (c, next) => {
			c.env = {
				DB: memoryDb,
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
				WEB_ORIGIN: "http://localhost:3000",
			} as unknown as Bindings;
			await next();
		});
		app.route("/pre-register", preRegisterRoutes);
	});

	it("POST /pre-register validation failed with empty body", async () => {
		const res = await app.request("/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect([400, 422]).toContain(res.status);
	});

	it("POST /pre-register success", async () => {
		const payload = {
			email: "foo@example.com",
			turnstileToken: "tokentoken",
			referralSource: "twitter",
		};
		const res = await app.request("/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.ok).toBe(true);
	});
});
