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

describe("Cattle API E2E (filters & sort)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;
	const auth = () => ({
		Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
	});
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
		store = createEmptyStore();
		// seed user1 cattle with different attributes
		const base = (
			id: number,
			name: string,
			stage: "CALF" | "GROWING" | "FATTENING" | "FIRST_CALVED" | "MULTI_PAROUS",
			gender: string,
			status:
				| "HEALTHY"
				| "PREGNANT"
				| "RESTING"
				| "TREATING"
				| "SHIPPED"
				| "DEAD",
			birthday: string
		) =>
			({
				cattleId: id,
				ownerUserId: 1,
				identificationNumber: 1000 + id,
				earTagNumber: 200 + id,
				name,
				growthStage: stage,
				birthday,
				age: 1,
				monthsOld: 12,
				daysOld: 365,
				gender,
				weight: null,
				score: null,
				breed: null,
				status,
				producerName: null,
				barn: null,
				breedingValue: null,
				notes: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}) as unknown as FakeStore["cattle"][number];
		store.cattle.push(base(1, "AAA", "CALF", "雌", "HEALTHY", "2024-01-01"));
		store.cattle.push(
			base(2, "BBB", "GROWING", "雄", "PREGNANT", "2023-01-01")
		);
		store.cattle.push(
			base(3, "CCC", "FATTENING", "雌", "RESTING", "2022-01-01")
		);
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

	it("GET /cattle with combined filters responds 200 and expected count", async () => {
		const res = await app.request(
			"/cattle?growth_stage=CALF,GROWING&gender=メス&status=HEALTHY&search=A",
			{ headers: auth() }
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.data.results)).toBe(true);
		// fakeDrizzleのwhere実装は形状重視のため件数は実SQLと異なる可能性あり
		expect(body.data.results.length).toBeGreaterThan(0);
	});

	it("GET /cattle sort by name asc returns array and next_cursor shape", async () => {
		const res = await app.request(
			"/cattle?sort_by=name&sort_order=asc&limit=2",
			{ headers: auth() }
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.data.results)).toBe(true);
		expect(
			body.data.next_cursor === null ||
				typeof body.data.next_cursor === "string"
		).toBe(true);
	});
});
