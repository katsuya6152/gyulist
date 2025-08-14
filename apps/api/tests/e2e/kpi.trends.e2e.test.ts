import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import kpiRoutes from "../../src/routes/kpi";
import type { Bindings } from "../../src/types";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
	createFakeDrizzle
} from "./helpers/fakeDrizzle";

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

describe("KPI Trends API E2E", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;

	beforeEach(async () => {
		const mod = await import("drizzle-orm/d1");
		const set = (mod as unknown as { __setStore?: (s: FakeStore) => void })
			.__setStore;
		store = createEmptyStore();
		// seed minimal data
		store.cattle.push({
			cattleId: 1,
			ownerUserId: 1,
			identificationNumber: 1,
			earTagNumber: 1,
			name: "A",
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
		set?.(store);

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

	it("GET /kpi/breeding/trends ok", async () => {
		const res = await app.request("/kpi/breeding/trends?months=1", {
			headers: authHeaders
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.deltas)).toBe(true);
	});
});
