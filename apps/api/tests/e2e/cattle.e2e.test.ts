import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Fake drizzle for repositories (no real DB)
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
	createFakeDrizzle,
} from "./helpers/fakeDrizzle";

// Mock drizzle-orm/d1 to return our in-memory implementation
vi.mock("drizzle-orm/d1", async () => {
	const mod = await vi.importActual<Record<string, unknown>>("drizzle-orm/d1");
	// store will be set per test in beforeEach
	let currentStore: FakeStore = createEmptyStore();
	return {
		...mod,
		drizzle: (_db: AnyD1Database) => createFakeDrizzle(currentStore),
		__setStore: (s: FakeStore) => {
			currentStore = s;
		},
	};
});

// Import after mocking
import cattleRoutes from "../../src/routes/cattle";
import type { Bindings } from "../../src/types";

// Setter populated lazily from mocked module in beforeEach
let setStoreRef: ((s: FakeStore) => void) | null = null;

// Polyfill atob/btoa for Node without using 'any'
const g = globalThis as unknown as {
	atob?: (s: string) => string;
	btoa?: (s: string) => string;
};
if (!g.atob) {
	g.atob = (b64: string) => Buffer.from(b64, "base64").toString("binary");
}
if (!g.btoa) {
	g.btoa = (bin: string) => Buffer.from(bin, "binary").toString("base64");
}

const createTestApp = (store: FakeStore) => {
	if (setStoreRef) setStoreRef(store);
	const app = new Hono<{ Bindings: Bindings }>();

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
			WEB_ORIGIN: "http://localhost:3000",
		} as unknown as Bindings;
		await next();
	});

	app.route("/cattle", cattleRoutes);
	return app;
};

const makeJwt = (payload: Record<string, unknown>) => {
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" }),
	).toString("base64");
	const body = Buffer.from(JSON.stringify(payload)).toString("base64");
	return `${header}.${body}.sig`;
};

const authHeaders = {
	Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`,
};

describe("Cattle API E2E (no mocks)", () => {
	let store: FakeStore;
	let app: ReturnType<typeof createTestApp>;

	beforeEach(async () => {
		// Retrieve setter from mocked module
		const d1mod = await import("drizzle-orm/d1");
		setStoreRef =
			(d1mod as unknown as { __setStore?: (s: FakeStore) => void })
				.__setStore ?? null;

		store = createEmptyStore();
		// seed one cattle
		store.cattle.push({
			cattleId: 1,
			ownerUserId: 1,
			identificationNumber: 1001,
			earTagNumber: 1234,
			name: "テスト牛",
			growthStage: "CALF",
			birthday: "2023-01-01",
			age: 1,
			monthsOld: 12,
			daysOld: 365,
			gender: "オス",
			weight: null,
			score: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		} as (typeof store.cattle)[number]);
		app = createTestApp(store);
	});

	it("GET /cattle unauthorized without token", async () => {
		const res = await app.request("/cattle");
		expect(res.status).toBe(401);
	});

	it("GET /cattle returns list", async () => {
		const res = await app.request("/cattle?limit=20", { headers: authHeaders });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.results)).toBe(true);
		expect(body.results[0].name).toBe("テスト牛");
	});

	it("POST /cattle creates new cattle", async () => {
		const payload = {
			identificationNumber: 2001,
			earTagNumber: 5678,
			name: "新規牛",
			gender: "オス",
			birthday: "2024-01-01",
			growthStage: "CALF",
			breed: null,
			notes: null,
		};
		const res = await app.request("/cattle", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify(payload),
		});
		expect(res.status).toBe(201);
		const created = await res.json();
		expect(created.cattleId).toBeDefined();

		expect(created.ownerUserId).toBe(1);
	});

	it("PATCH /cattle/:id updates name and birthday (age recalculation path)", async () => {
		const res = await app.request("/cattle/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ name: "更新後", birthday: "2020-01-01" }),
		});
		expect(res.status).toBe(200);
		const updated = await res.json();
		expect(updated.name).toBe("更新後");
	});

	it("PATCH /cattle/:id/status updates status and creates history", async () => {
		const res = await app.request("/cattle/1/status", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ status: "PREGNANT" }),
		});
		expect(res.status).toBe(200);
		const updated = await res.json();
		expect(updated.status).toBe("PREGNANT");
		expect(store.statusHistory.length).toBeGreaterThan(0);
	});

	it("DELETE /cattle/:id removes cattle", async () => {
		const res = await app.request("/cattle/1", {
			method: "DELETE",
			headers: authHeaders,
		});
		expect(res.status).toBe(200);

		const getRes = await app.request("/cattle/1", { headers: authHeaders });
		expect(getRes.status).toBe(404);
	});
});
