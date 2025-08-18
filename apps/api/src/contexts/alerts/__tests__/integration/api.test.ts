import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import alertsRoutes from "../../../../../src/routes/alerts";
import type { Bindings } from "../../../../../src/types";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
	createFakeDrizzle
} from "../../../../../tests/integration/helpers/fakeDrizzle";

// Replace drizzle with in-memory
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
const authHeaders = {
	Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
};

describe("Alerts API E2E (no mocks)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;

	beforeEach(async () => {
		// set store for mocked drizzle
		const d1mod = await import("drizzle-orm/d1");
		const setter = (d1mod as unknown as { __setStore?: (s: FakeStore) => void })
			.__setStore;
		store = createEmptyStore();

		// seed minimal data
		store.cattle.push({
			cattleId: 1,
			ownerUserId: 1,
			identificationNumber: 1001,
			earTagNumber: 1234,
			name: "テスト牛",
			growthStage: "COW",
			birthday: "2020-01-01",
			age: 4,
			monthsOld: 48,
			daysOld: 1460,
			gender: "雌",
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
		} as unknown as FakeStore["cattle"][number]);

		// events: last CALVING 70 days ago, and no AI since then
		const lastCalving = new Date(
			Date.now() - 70 * 24 * 60 * 60 * 1000
		).toISOString();
		store.events.push({
			eventId: 1,
			cattleId: 1,
			eventType: "CALVING",
			eventDatetime: lastCalving,
			notes: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as unknown as FakeStore["events"][number]);

		// breeding_status: no expectedCalvingDate
		store.breedingStatus.push({
			cattleId: 1,
			expectedCalvingDate: null,
			isPregnant: null,
			lastInseminationDate: null,
			lastCalvingDate: lastCalving,
			updatedAt: new Date().toISOString()
		} as unknown as FakeStore["breedingStatus"][number]);

		setter?.(store);

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
		app.route("/alerts", alertsRoutes);
	});

	it("GET /alerts unauthorized without token", async () => {
		const res = await app.request("/alerts");
		expect(res.status).toBe(401);
	});

	it("GET /alerts returns derived alerts", async () => {
		const res = await app.request("/alerts", { headers: authHeaders });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.data.results)).toBe(true);
		expect(body.data.results.length).toBeGreaterThan(0);
		expect(body.data.results[0]).toHaveProperty("type");
	});
});
