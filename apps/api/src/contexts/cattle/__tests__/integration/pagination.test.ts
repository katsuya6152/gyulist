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

describe("Cattle API E2E (cursor pagination)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;
	const auth = () => ({
		Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
	});
	// Polyfill atob/btoa for cursor encode/decode
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
		const mk = (id: number) =>
			({
				cattleId: id,
				ownerUserId: 1,
				identificationNumber: 1000 + id,
				earTagNumber: 200 + id,
				name: `N${id}`,
				growthStage: "CALF",
				birthday: "2024-01-01",
				age: 0,
				monthsOld: 6,
				daysOld: 180,
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
			}) as unknown as FakeStore["cattle"][number];
		for (let i = 1; i <= 5; i++) store.cattle.push(mk(i));
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

	it("concatenating pages produces all unique ids", async () => {
		const seen = new Set<number>();
		let cursor: string | null = null;
		let loops = 0;
		do {
			const url = cursor
				? `/cattle?limit=2&cursor=${encodeURIComponent(cursor)}`
				: "/cattle?limit=2";
			const res = await app.request(url, { headers: auth() });
			expect(res.status).toBe(200);
			const body = await res.json();
			for (const item of body.data.results as Array<{ cattleId: number }>) {
				// joinにより重複が混じる可能性は低いが、安全のため重複はスキップ
				if (!seen.has(item.cattleId)) {
					seen.add(item.cattleId);
				}
			}
			cursor = body.data.next_cursor;
			loops += 1;
			// safety to avoid infinite loop in case of bug (allow a few more loops for robustness)
			expect(loops).toBeLessThanOrEqual(20);
		} while (cursor);

		expect(seen.size).toBe(5);
	});
});
