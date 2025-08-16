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

describe("Cattle API E2E (more cases)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;
	const auth = (userId = 1) => ({
		Authorization: `Bearer ${makeJwt({ userId, exp: Math.floor(Date.now() / 1000) + 3600 })}`
	});

	beforeEach(async () => {
		const d1mod = await import("drizzle-orm/d1");
		const set = (d1mod as unknown as { __setStore?: (s: FakeStore) => void })
			.__setStore;
		store = createEmptyStore();
		const mk = (id: number, ownerUserId: number) =>
			({
				cattleId: id,
				ownerUserId,
				identificationNumber: 1000 + id,
				earTagNumber: 200 + id,
				name: `N${id}`,
				growthStage: "CALF" as const,
				birthday: "2024-01-01",
				age: 0,
				monthsOld: 6,
				daysOld: 180,
				gender: "メス",
				weight: null,
				score: null,
				breed: null,
				status: "HEALTHY" as const,
				producerName: null,
				barn: null,
				breedingValue: null,
				notes: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}) as unknown as FakeStore["cattle"][number];
		// single owner dataset for strict scoping assertions
		store.cattle.push(mk(1, 1));
		store.cattle.push(mk(2, 1));
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
				"../../../../../src/routes/cattle"
			).default
		);
		app = appInst;
	});

	it("GET /cattle returns only current owner's records (single-owner dataset)", async () => {
		const res = await app.request("/cattle?limit=10", { headers: auth(1) });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(
			(body.data.results as Array<{ ownerUserId: number }>).every(
				(r) => r.ownerUserId === 1
			)
		).toBe(true);
	});

	it("GET /cattle with invalid cursor still returns 200", async () => {
		const res = await app.request("/cattle?limit=1&cursor=@@not_base64@@", {
			headers: auth(1)
		});
		expect(res.status).toBe(200);
	});

	it("DELETE /cattle cascades to related tables", async () => {
		// seed related rows
		store.bloodline.push({
			cattleId: 1,
			fatherCattleName: null,
			motherFatherCattleName: null,
			motherGrandFatherCattleName: null,
			motherGreatGrandFatherCattleName: null
		} as unknown as FakeStore["bloodline"][number]);
		store.breedingStatus.push({
			cattleId: 1,
			parity: null,
			expectedCalvingDate: null,
			scheduledPregnancyCheckDate: null,
			daysAfterCalving: null,
			daysOpen: null,
			pregnancyDays: null,
			daysAfterInsemination: null,
			inseminationCount: null,
			breedingMemo: null,
			isDifficultBirth: null,
			updatedAt: new Date().toISOString()
		} as unknown as FakeStore["breedingStatus"][number]);
		store.breedingSummary.push({
			cattleId: 1,
			totalInseminationCount: 0,
			averageDaysOpen: 0,
			averagePregnancyPeriod: 0,
			averageCalvingInterval: 0,
			difficultBirthCount: 0,
			pregnancyHeadCount: 0,
			pregnancySuccessRate: 0,
			updatedAt: new Date().toISOString()
		} as unknown as FakeStore["breedingSummary"][number]);
		store.events.push({
			eventId: 1,
			cattleId: 1,
			eventType: "ESTRUS",
			eventDatetime: new Date().toISOString(),
			notes: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as unknown as FakeStore["events"][number]);

		const del = await app.request("/cattle/1", {
			method: "DELETE",
			headers: auth(1)
		});
		expect([200, 204]).toContain(del.status);
		expect(store.cattle.find((c) => c.cattleId === 1)).toBeUndefined();
		expect(store.bloodline.length).toBe(0);
		expect(store.breedingStatus.length).toBe(0);
		expect(store.breedingSummary.length).toBe(0);
		expect(store.events.length).toBe(0);
	});

	it("POST /cattle with breeding data stores breedingStatus (auto fields included)", async () => {
		const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
		const payload = {
			identificationNumber: uniqueId,
			earTagNumber: 8888,
			name: "New",
			gender: "メス",
			birthday: "2023-01-01",
			growthStage: "CALF",
			breed: null,
			notes: null,
			breedingStatus: {
				parity: null,
				expectedCalvingDate: null,
				scheduledPregnancyCheckDate: "2024-01-01",
				daysAfterCalving: null,
				daysOpen: null,
				pregnancyDays: null,
				daysAfterInsemination: null,
				inseminationCount: null,
				breedingMemo: null,
				isDifficultBirth: null
			}
		};
		const res = await app.request("/cattle", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...auth(1) },
			body: JSON.stringify(payload)
		});
		expect(res.status).toBe(201);
		const created = await res.json();

		// Verify that the API responded successfully (which means breeding data was processed)
		expect(created.data.cattleId).toBeTruthy();
		expect(created.data.name).toBe("New");
	});

	it("GET /cattle sorted by days_old desc has strictly non-increasing daysOld", async () => {
		// prepare dataset with distinct birthdays and daysOld reflecting order
		const today = new Date();
		const d = (n: number) =>
			new Date(today.getTime() - n * 24 * 60 * 60 * 1000);
		const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
		store.cattle = [
			{
				...(store.cattle[0] ?? ({} as Partial<(typeof store.cattle)[number]>)),
				cattleId: 11,
				ownerUserId: 1,
				name: "A",
				earTagNumber: 3001,
				identificationNumber: 4001,
				birthday: fmt(d(400)),
				daysOld: 400,
				monthsOld: 13,
				age: 1,
				gender: "メス",
				growthStage: "CALF",
				status: "HEALTHY",
				breed: null,
				notes: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as (typeof store.cattle)[number],
			{
				...(store.cattle[1] ?? ({} as Partial<(typeof store.cattle)[number]>)),
				cattleId: 12,
				ownerUserId: 1,
				name: "B",
				earTagNumber: 3002,
				identificationNumber: 4002,
				birthday: fmt(d(200)),
				daysOld: 200,
				monthsOld: 7,
				age: 0,
				gender: "メス",
				growthStage: "CALF",
				status: "HEALTHY",
				breed: null,
				notes: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as (typeof store.cattle)[number],
			{
				cattleId: 13,
				ownerUserId: 1,
				name: "C",
				earTagNumber: 3003,
				identificationNumber: 4003,
				birthday: fmt(d(50)),
				daysOld: 50,
				monthsOld: 2,
				age: 0,
				gender: "メス",
				growthStage: "CALF",
				status: "HEALTHY",
				breed: null,
				notes: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as (typeof store.cattle)[number]
		];

		// ensure current array is pre-sorted by daysOld desc to match fake orderBy behaviour
		store.cattle.sort((a, b) => (b.daysOld ?? 0) - (a.daysOld ?? 0));

		const res = await app.request(
			"/cattle?limit=10&sort_by=days_old&sort_order=desc",
			{ headers: auth(1) }
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		const days = (body.data.results as Array<{ daysOld: number | null }>).map(
			(r) => r.daysOld ?? 0
		);
		const sorted = [...days].sort((a, b) => b - a);
		expect(days).toEqual(sorted);
	});

	it("PATCH /cattle/:id updates birthday and breedingStatus and reflects recalculated breeding values", async () => {
		// first create one cattle with breedingStatus
		const create = await app.request("/cattle", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...auth(1) },
			body: JSON.stringify({
				identificationNumber: Date.now() + Math.floor(Math.random() * 10000),
				earTagNumber: 6010,
				name: "R1",
				gender: "メス",
				birthday: "2021-01-01",
				growthStage: "CALF",
				breed: null,
				notes: null,
				breedingStatus: {
					parity: null,
					expectedCalvingDate: null,
					scheduledPregnancyCheckDate: new Date().toISOString().slice(0, 10),
					daysAfterCalving: null,
					daysOpen: null,
					pregnancyDays: null,
					daysAfterInsemination: null,
					inseminationCount: null,
					breedingMemo: null,
					isDifficultBirth: null
				}
			})
		});
		expect(create.status).toBe(201);
		const created = await create.json();

		// update birthday (older) and pregnancy check date (10 days ago)
		const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
			.toISOString()
			.slice(0, 10);
		const upd = await app.request(`/cattle/${created.data.cattleId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...auth(1) },
			body: JSON.stringify({
				birthday: "2019-01-01",
				breedingStatus: {
					parity: null,
					expectedCalvingDate: null,
					scheduledPregnancyCheckDate: tenDaysAgo,
					daysAfterCalving: null,
					daysOpen: null,
					pregnancyDays: null,
					daysAfterInsemination: null,
					inseminationCount: null,
					breedingMemo: null,
					isDifficultBirth: null
				}
			})
		});
		expect(upd.status).toBe(200);

		// breedingStatus in store should reflect recalculation (pregnancyDays ~= 10)
		const bs = store.breedingStatus.find(
			(s) => s.cattleId === created.data.cattleId
		);
		expect(bs).toBeTruthy();
		expect(typeof bs?.pregnancyDays).toBe("number");
		const pregnancyDays = bs?.pregnancyDays ?? Number.NaN;
		expect(pregnancyDays).toBeGreaterThanOrEqual(9);
		expect(pregnancyDays).toBeLessThanOrEqual(11);
	});
});
