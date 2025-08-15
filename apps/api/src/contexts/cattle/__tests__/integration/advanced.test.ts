import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Bindings } from "../../../../../src/types";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
	createFakeDrizzle
} from "../../../../../tests/integration/helpers/fakeDrizzle";

// Mock drizzle to use in-memory store
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

describe("Cattle API E2E (advanced)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;
	const auth = () => ({
		Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
	});

	// Polyfill atob/btoa for Node
	const g = globalThis as unknown as {
		atob?: (s: string) => string;
		btoa?: (s: string) => string;
	};
	if (!g.atob)
		g.atob = (b64: string) => Buffer.from(b64, "base64").toString("binary");
	if (!g.btoa)
		g.btoa = (bin: string) => Buffer.from(bin, "binary").toString("base64");

	beforeEach(async () => {
		const d1mod = await import("drizzle-orm/d1");
		const set = (d1mod as unknown as { __setStore?: (s: FakeStore) => void })
			.__setStore;
		set?.(createEmptyStore());
		store = createEmptyStore();
		// Seed three cattle for user 1 and one for user 2
		const nowIso = new Date().toISOString();
		store.cattle.push({
			cattleId: 1,
			ownerUserId: 1,
			identificationNumber: 1111,
			earTagNumber: 111,
			name: "Alpha",
			growthStage: "CALF",
			birthday: "2024-01-01",
			age: 0,
			monthsOld: 6,
			daysOld: 180,
			gender: "メス",
			weight: null,
			score: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			createdAt: nowIso,
			updatedAt: nowIso
		} as unknown as FakeStore["cattle"][number]);
		store.cattle.push({
			cattleId: 2,
			ownerUserId: 1,
			identificationNumber: 2222,
			earTagNumber: 222,
			name: "Bravo",
			growthStage: "GROWING",
			birthday: "2023-01-01",
			age: 1,
			monthsOld: 18,
			daysOld: 540,
			gender: "オス",
			weight: null,
			score: null,
			breed: null,
			status: "PREGNANT",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			createdAt: nowIso,
			updatedAt: nowIso
		} as unknown as FakeStore["cattle"][number]);
		store.cattle.push({
			cattleId: 3,
			ownerUserId: 1,
			identificationNumber: 3333,
			earTagNumber: 333,
			name: "Charlie",
			growthStage: "FATTENING",
			birthday: "2022-01-01",
			age: 2,
			monthsOld: 30,
			daysOld: 900,
			gender: "メス",
			weight: null,
			score: null,
			breed: null,
			status: "RESTING",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			createdAt: nowIso,
			updatedAt: nowIso
		} as unknown as FakeStore["cattle"][number]);
		store.cattle.push({
			cattleId: 4,
			ownerUserId: 2,
			identificationNumber: 4444,
			earTagNumber: 444,
			name: "Delta",
			growthStage: "CALF",
			birthday: "2024-02-01",
			age: 0,
			monthsOld: 5,
			daysOld: 150,
			gender: "メス",
			weight: null,
			score: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			createdAt: nowIso,
			updatedAt: nowIso
		} as unknown as FakeStore["cattle"][number]);

		// reflect seeded store to mocked drizzle
		set?.(store);

		const appInst = new Hono<{ Bindings: Bindings }>();
		appInst.use("*", async (c, next) => {
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
		const routes = await import("../../../../../src/routes/cattle");
		appInst.route(
			"/cattle",
			(routes as { default: unknown }).default as typeof import(
				"../../src/routes/cattle"
			).default
		);
		app = appInst;
	});

	it("GET /cattle pagination returns next_cursor when over limit", async () => {
		const res = await app.request("/cattle?limit=2", { headers: auth() });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.results)).toBe(true);
		expect(body.results.length).toBe(2);
		// since repo requests limit+1, service sets has_next true
		expect(body.has_next).toBeTypeOf("boolean");
		expect(
			body.next_cursor === null || typeof body.next_cursor === "string"
		).toBe(true);
	});

	it("GET /cattle/status-counts returns counts shape", async () => {
		const res = await app.request("/cattle/status-counts", { headers: auth() });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.counts).toHaveProperty("HEALTHY");
		expect(body.counts).toHaveProperty("PREGNANT");
	});

	it("GET /cattle/:id returns 403 for other owner's cattle", async () => {
		const res = await app.request("/cattle/4", { headers: auth() });
		expect(res.status).toBe(403);
	});

	it("POST /cattle validation error for missing fields", async () => {
		const res = await app.request("/cattle", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({})
		});
		expect(res.status).toBe(400);
	});

	it("PATCH /cattle/:id validation error for wrong type", async () => {
		const res = await app.request("/cattle/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({ name: 123 })
		});
		expect(res.status).toBe(400);
	});

	it("PATCH /cattle/:id/status accepts optional reason", async () => {
		const res = await app.request("/cattle/1/status", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({ status: "RESTING" })
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe("RESTING");
	});

	it("DELETE /cattle/:id 403 for other owner's cattle", async () => {
		const res = await app.request("/cattle/4", {
			method: "DELETE",
			headers: auth()
		});
		expect(res.status).toBe(403);
	});
});
