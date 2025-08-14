import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import adminRoutes from "../../src/routes/admin";
import type { Bindings } from "../../src/types";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1
} from "./helpers/fakeDrizzle";

const basic = (u: string, p: string) =>
	`Basic ${Buffer.from(`${u}:${p}`).toString("base64")}`;

describe("Admin API E2E (success)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;

	beforeEach(() => {
		store = createEmptyStore();
		// seed registrations
		const now = Math.floor(Date.now() / 1000);
		if (!store.registrations) {
			store.registrations = [];
		}
		store.registrations.push({
			id: "1",
			email: "a@example.com",
			referralSource: "x",
			status: "confirmed",
			locale: "ja",
			createdAt: now,
			updatedAt: now
		});
		store.registrations.push({
			id: "2",
			email: "b@example.com",
			referralSource: null,
			status: "confirmed",
			locale: "ja",
			createdAt: now,
			updatedAt: now
		});

		app = new Hono<{ Bindings: Bindings }>();
		app.use("*", async (c, next) => {
			c.env = {
				DB: createFakeD1(store),
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

	it("GET /admin/registrations returns items with basic auth", async () => {
		const res = await app.request("/admin/registrations?limit=10&offset=0", {
			headers: { Authorization: basic("a", "b") }
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.items)).toBe(true);
		expect(body.total).toBeGreaterThan(0);
	});

	it("GET /admin/registrations.csv returns CSV", async () => {
		const res = await app.request(
			"/admin/registrations.csv?limit=10&offset=0",
			{
				headers: { Authorization: basic("a", "b") }
			}
		);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")?.includes("text/csv")).toBe(true);
		const text = await res.text();
		expect(text.split("\n").length).toBeGreaterThan(1);
	});
});
