import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Fake drizzle for repositories (no real DB)
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
	createFakeDrizzle
} from "../../../../../tests/integration/helpers/fakeDrizzle";

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
		}
	};
});

// Import after mocking
import cattleRoutes from "../../../../../src/routes/cattle";
import type { Bindings } from "../../../../../src/types";

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
			WEB_ORIGIN: "http://localhost:3000"
		} as unknown as Bindings;
		await next();
	});

	app.route("/cattle", cattleRoutes);
	return app;
};

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
		expect(Array.isArray(body.data.results)).toBe(true);
		expect(body.data.results[0].name).toBe("テスト牛");
	});

	it("POST /cattle creates new cattle", async () => {
		const uniqueId = Date.now() + Math.floor(Math.random() * 1000); // Generate truly unique ID
		const payload = {
			identificationNumber: uniqueId,
			earTagNumber: 5678,
			name: "新規牛",
			gender: "オス",
			birthday: "2024-01-01",
			growthStage: "CALF",
			breed: null,
			notes: null
		};
		const res = await app.request("/cattle", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify(payload)
		});
		if (res.status !== 201) {
			console.log("Error response:", await res.text());
		}
		expect(res.status).toBe(201);
		const created = await res.json();
		expect(created.data.cattleId).toBeDefined();

		expect(created.data.ownerUserId).toBe(1);
	});

	it("PATCH /cattle/:id updates name and birthday (age recalculation path)", async () => {
		const res = await app.request("/cattle/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ name: "更新後", birthday: "2020-01-01" })
		});
		expect(res.status).toBe(200);
		const updated = await res.json();
		expect(updated.data.name).toBe("更新後");
	});

	it("PATCH /cattle/:id/status updates status and creates history", async () => {
		const res = await app.request("/cattle/1/status", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ status: "PREGNANT" })
		});
		expect(res.status).toBe(200);
		const updated = await res.json();
		expect(updated.data.status).toBe("PREGNANT");
		expect(store.statusHistory.length).toBeGreaterThan(0);
	});

	it("GET /cattle/:id includes events, bloodline, and breeding data in response", async () => {
		// イベントデータを追加
		store.events.push({
			eventId: 1,
			cattleId: 1,
			eventType: "INSEMINATION",
			eventDatetime: "2023-06-01T10:00:00Z",
			notes: "人工授精実施",
			createdAt: "2023-06-01T10:00:00Z",
			updatedAt: "2023-06-01T10:00:00Z"
		});

		// 血統データを追加
		store.bloodline.push({
			bloodlineId: 1,
			cattleId: 1,
			fatherCattleName: "テスト父牛",
			motherFatherCattleName: "テスト母父牛",
			motherGrandFatherCattleName: "テスト母祖父牛",
			motherGreatGrandFatherCattleName: "テスト母曽祖父牛"
		});

		// 母情報データを追加
		store.motherInfo.push({
			motherInfoId: 1,
			cattleId: 1,
			motherCattleId: 2,
			motherName: "テスト母牛",
			motherIdentificationNumber: "12345",
			motherScore: 85
		});

		// 繁殖状態データを追加
		store.breedingStatus.push({
			breedingStatusId: 1,
			cattleId: 1,
			parity: 2,
			expectedCalvingDate: "2024-06-01",
			scheduledPregnancyCheckDate: "2024-04-01",
			daysAfterCalving: 120,
			daysOpen: 90,
			pregnancyDays: 180,
			daysAfterInsemination: 30,
			inseminationCount: 2,
			breedingMemo: "繁殖順調",
			isDifficultBirth: false,
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-12-01T00:00:00Z"
		});

		// 繁殖統計データを追加
		store.breedingSummary.push({
			breedingSummaryId: 1,
			cattleId: 1,
			totalInseminationCount: 5,
			averageDaysOpen: 85,
			averagePregnancyPeriod: 280,
			averageCalvingInterval: 365,
			difficultBirthCount: 0,
			pregnancyHeadCount: 3,
			pregnancySuccessRate: 80,
			createdAt: "2023-01-01T00:00:00Z",
			updatedAt: "2023-12-01T00:00:00Z"
		});

		const res = await app.request("/cattle/1", {
			method: "GET",
			headers: authHeaders
		});

		expect(res.status).toBe(200);
		const data = await res.json();

		// イベントが含まれているかを確認
		expect(data.data).toHaveProperty("events");
		expect(Array.isArray(data.data.events)).toBe(true);
		expect(data.data.events.length).toBe(1);

		// 血統情報が含まれているかを確認
		expect(data.data).toHaveProperty("bloodline");
		expect(data.data.bloodline).toMatchObject({
			bloodlineId: 1,
			cattleId: 1,
			fatherCattleName: "テスト父牛",
			motherFatherCattleName: "テスト母父牛"
		});

		// 母情報が含まれているかを確認
		expect(data.data).toHaveProperty("motherInfo");
		expect(data.data.motherInfo).toMatchObject({
			motherInfoId: 1,
			cattleId: 1,
			motherName: "テスト母牛",
			motherIdentificationNumber: "12345",
			motherScore: 85
		});

		// 繁殖状態が含まれているかを確認
		expect(data.data).toHaveProperty("breedingStatus");
		expect(data.data.breedingStatus).toMatchObject({
			breedingStatusId: 1,
			cattleId: 1,
			parity: 2,
			expectedCalvingDate: "2024-06-01"
		});

		// 繁殖統計が含まれているかを確認
		expect(data.data).toHaveProperty("breedingSummary");
		expect(data.data.breedingSummary).toMatchObject({
			breedingSummaryId: 1,
			cattleId: 1,
			totalInseminationCount: 5,
			pregnancySuccessRate: 80
		});
	});

	it("DELETE /cattle/:id removes cattle", async () => {
		const res = await app.request("/cattle/1", {
			method: "DELETE",
			headers: authHeaders
		});
		expect(res.status).toBe(204);

		const getRes = await app.request("/cattle/1", { headers: authHeaders });
		expect(getRes.status).toBe(404);
	});
});
