import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import type { Bindings } from "../../../../../src/types";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
	createFakeDrizzle
} from "../../../../../tests/integration/helpers/fakeDrizzle";

vi.mock("drizzle-orm/d1", async () => {
	const mod = await vi.importActual<Record<string, unknown>>("drizzle-orm/d1");
	let currentStore: FakeStore = createEmptyStore();
	return {
		...mod,
		drizzle: (_db: AnyD1Database) => createFakeDrizzle(currentStore),
		__setStore: (s: FakeStore) => {
			currentStore = s;
		}
	};
});

const makeJwt = (payload: Record<string, unknown>) => {
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" })
	).toString("base64");
	const body = Buffer.from(JSON.stringify(payload)).toString("base64");
	return `${header}.${body}.sig`;
};

describe("Users API E2E (success)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;
	const auth = () => ({
		Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
	});

	beforeEach(async () => {
		store = createEmptyStore();
		// 1 user exists
		if (!store.users) {
			store.users = [];
		}
		store.users.push({
			id: 1,
			userName: "U",
			email: "u@example.com",
			passwordHash: "hash",
			isVerified: true,
			verificationToken: null,
			lastLoginAt: null,
			theme: "light",
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as unknown as (typeof store.users)[number]);

		// ensure mocked drizzle sees latest store
		const mod = await import("drizzle-orm/d1");
		(mod as unknown as { __setStore?: (s: FakeStore) => void }).__setStore?.(
			store
		);

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
		const modRoutes = await import("../../../../../src/routes/users");
		app.route(
			"/users",
			(modRoutes as { default: unknown }).default as typeof import(
				"../../../../../src/routes/users"
			).default
		);
	});

	it("GET /users/:id returns user", async () => {
		const res = await app.request("/users/1", { headers: auth() });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.data.email).toBe("u@example.com");
	});

	it("PATCH /users/:id/theme updates own theme", async () => {
		const res = await app.request("/users/1/theme", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({ theme: "dark" })
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.data.success).toBe(true);
		expect(body.data.theme).toBe("dark");
	});
});
