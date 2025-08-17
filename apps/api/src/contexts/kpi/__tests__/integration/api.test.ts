import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import kpiRoutes from "../../../../../src/routes/kpi";
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
const authHeaders = {
	Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
};

describe("KPI API E2E (no mocks)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;

	beforeEach(async () => {
		const d1mod = await import("drizzle-orm/d1");
		const setter = (d1mod as unknown as { __setStore?: (s: FakeStore) => void })
			.__setStore;
		store = createEmptyStore();
		// seed cattle and relevant events (INSEMINATION/CALVING)
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
			gender: "メス",
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

		const ai1 = new Date("2024-01-15T00:00:00Z").toISOString();
		const ai2 = new Date("2024-03-01T00:00:00Z").toISOString();
		const calving = new Date("2024-11-20T00:00:00Z").toISOString();
		store.events.push({
			eventId: 1,
			cattleId: 1,
			eventType: "INSEMINATION",
			eventDatetime: ai1,
			notes: null,
			createdAt: ai1,
			updatedAt: ai1
		} as unknown as FakeStore["events"][number]);
		store.events.push({
			eventId: 2,
			cattleId: 1,
			eventType: "INSEMINATION",
			eventDatetime: ai2,
			notes: null,
			createdAt: ai2,
			updatedAt: ai2
		} as unknown as FakeStore["events"][number]);
		store.events.push({
			eventId: 3,
			cattleId: 1,
			eventType: "CALVING",
			eventDatetime: calving,
			notes: null,
			createdAt: calving,
			updatedAt: calving
		} as unknown as FakeStore["events"][number]);

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
		app.route("/kpi", kpiRoutes);
	});

	it("GET /kpi/breeding requires auth", async () => {
		const res = await app.request("/kpi/breeding");
		expect(res.status).toBe(401);
	});

	it("GET /kpi/breeding returns metrics", async () => {
		const res = await app.request(
			"/kpi/breeding?from=2024-01-01T00:00:00.000Z&to=2024-12-31T23:59:59.000Z",
			{ headers: authHeaders }
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.data.metrics).toBeDefined();
		expect(body.data.counts).toBeDefined();
	});

	it("GET /kpi/breeding/delta returns shape", async () => {
		const res = await app.request("/kpi/breeding/delta?month=2024-12", {
			headers: authHeaders
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.data).toHaveProperty("month");
		expect(body.data).toHaveProperty("delta");
	});

	it("GET /kpi/breeding/trends returns array", async () => {
		const res = await app.request("/kpi/breeding/trends?months=2", {
			headers: authHeaders
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.data.deltas)).toBe(true);
	});
});
