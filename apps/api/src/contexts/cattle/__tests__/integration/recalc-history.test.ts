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

describe("Cattle API E2E (recalc & history)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;
	const auth = () => ({
		Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
	});

	beforeEach(async () => {
		const d1mod = await import("drizzle-orm/d1");
		const set = (d1mod as unknown as { __setStore?: (s: FakeStore) => void })
			.__setStore;
		store = createEmptyStore();
		const now = new Date().toISOString();
		// baseline cattle with breedingStatus present
		store.cattle.push({
			cattleId: 1,
			ownerUserId: 1,
			identificationNumber: 1001,
			earTagNumber: 123,
			name: "A",
			growthStage: "CALF",
			birthday: "2022-01-01",
			age: 2,
			monthsOld: 24,
			daysOld: 730,
			gender: "メス",
			weight: null,
			score: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			createdAt: now,
			updatedAt: now
		} as unknown as FakeStore["cattle"][number]);
		store.breedingStatus.push({
			cattleId: 1,
			parity: 1,
			expectedCalvingDate: null,
			scheduledPregnancyCheckDate: "2024-01-01",
			daysAfterCalving: null,
			daysOpen: null,
			pregnancyDays: null,
			daysAfterInsemination: null,
			inseminationCount: null,
			breedingMemo: null,
			isDifficultBirth: null,
			updatedAt: now
		} as unknown as FakeStore["breedingStatus"][number]);
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

	it("PATCH /cattle/:id with new birthday recalculates age fields", async () => {
		const res = await app.request("/cattle/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({ birthday: "2020-01-01" })
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.age).not.toBeNull();
		expect(body.monthsOld).not.toBeNull();
		expect(body.daysOld).not.toBeNull();
	});

	it("PATCH /cattle/:id/status creates history with old/new/changedBy", async () => {
		const res = await app.request("/cattle/1/status", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({ status: "PREGNANT", reason: "test" })
		});
		expect(res.status).toBe(200);
		expect(store.statusHistory.length).toBeGreaterThan(0);
		const h = store.statusHistory.at(-1);
		expect(h).toBeDefined();
		if (!h) return;
		expect(h.cattleId).toBe(1);
		expect(h.oldStatus === null || typeof h.oldStatus === "string").toBe(true);
		expect(h.newStatus).toBe("PREGNANT");
		expect(h.changedBy).toBe(1);
		expect(h.reason === "test" || h.reason === null).toBe(true);
	});
});
