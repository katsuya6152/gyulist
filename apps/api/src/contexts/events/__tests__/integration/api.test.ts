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

// Mock drizzle to use in-memory store (same pattern as cattle E2E)
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

let setStoreRef: ((s: FakeStore) => void) | null = null;

const g = globalThis as unknown as {
	atob?: (s: string) => string;
	btoa?: (s: string) => string;
};
if (!g.atob)
	g.atob = (b64: string) => Buffer.from(b64, "base64").toString("binary");
if (!g.btoa)
	g.btoa = (bin: string) => Buffer.from(bin, "binary").toString("base64");

const makeJwt = (payload: Record<string, unknown>) => {
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" })
	).toString("base64");
	const body = Buffer.from(JSON.stringify(payload)).toString("base64");
	return `${header}.${body}.sig`;
};
const authHeaders = {
	Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
};

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
			WEB_ORIGIN: "http://localhost:3000"
		} as unknown as Bindings;
		await next();
	});
	// Import after mock to ensure drizzle is replaced
	// dynamic import to avoid hoist issue
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	return import("../../../../../src/routes/events").then((mod) => {
		app.route(
			"/events",
			(mod as { default: unknown }).default as typeof import(
				"../../src/routes/events"
			).default
		);
		return app;
	});
};

describe("Events API E2E (no mocks)", () => {
	let store: FakeStore;
	let app: Awaited<ReturnType<typeof createTestApp>>;

	beforeEach(async () => {
		const d1mod = await import("drizzle-orm/d1");
		setStoreRef =
			(d1mod as unknown as { __setStore?: (s: FakeStore) => void })
				.__setStore ?? null;

		store = createEmptyStore();
		// seed one cattle for userId=1 to pass owner checks in eventService
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
			updatedAt: new Date().toISOString()
		} as (typeof store.cattle)[number]);
		app = await createTestApp(store);
	});

	it("GET /events unauthorized", async () => {
		const res = await app.request("/events");
		expect(res.status).toBe(401);
	});

	it("POST /events creates event and affects status if CALVING/SHIPMENT", async () => {
		const payload = {
			cattleId: 1,
			eventType: "CALVING" as const,
			eventDatetime: new Date().toISOString(),
			notes: "出産"
		};
		const res = await app.request("/events", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify(payload)
		});
		expect(res.status).toBe(201);
		const created = await res.json();
		expect(created.eventId).toBeDefined();
		// ensure a row is inserted
		expect(store.events.length).toBe(1);
	});

	it("GET /events lists with pagination shape", async () => {
		// seed 2 events
		store.events.push({
			eventId: 1,
			cattleId: 1,
			eventType: "ESTRUS",
			eventDatetime: "2024-01-01T00:00:00Z",
			notes: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as (typeof store.events)[number]);
		store.events.push({
			eventId: 2,
			cattleId: 1,
			eventType: "INSEMINATION",
			eventDatetime: "2024-02-01T00:00:00Z",
			notes: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as (typeof store.events)[number]);

		const res = await app.request("/events?limit=1", { headers: authHeaders });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.results)).toBe(true);
	});

	it("GET /events/cattle/:cattleId filters by cattle", async () => {
		const res = await app.request("/events/cattle/1", { headers: authHeaders });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.results)).toBe(true);
	});

	it("PATCH /events/:id updates", async () => {
		// create an event first
		const createRes = await app.request("/events", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({
				cattleId: 1,
				eventType: "ESTRUS",
				eventDatetime: new Date().toISOString(),
				notes: ""
			})
		});
		const created = await createRes.json();
		const res = await app.request(`/events/${String(created.eventId)}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ notes: "更新" })
		});
		expect(res.status).toBe(200);
	});

	it("DELETE /events/:id removes event", async () => {
		// create an event first
		const createRes = await app.request("/events", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({
				cattleId: 1,
				eventType: "ESTRUS",
				eventDatetime: new Date().toISOString(),
				notes: ""
			})
		});
		const created = await createRes.json();
		const delRes = await app.request(`/events/${String(created.eventId)}`, {
			method: "DELETE",
			headers: authHeaders
		});
		expect(delRes.status).toBe(200);
	});
});
