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

describe("Events API E2E (success flows)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;
	const auth = () => ({
		Authorization: `Bearer ${makeJwt({ userId: 1, exp: Math.floor(Date.now() / 1000) + 3600 })}`
	});

	beforeEach(async () => {
		const mod = await import("drizzle-orm/d1");
		const set = (mod as unknown as { __setStore?: (s: FakeStore) => void })
			.__setStore;
		store = createEmptyStore();
		// seed cattle owned by user 1
		store.cattle.push({
			cattleId: 1,
			ownerUserId: 1,
			identificationNumber: 1001,
			earTagNumber: 1234,
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
		} as unknown as (typeof store.cattle)[number]);
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
		const mod2 = await import("../../../../../src/routes/events");
		app.route(
			"/events",
			(mod2 as { default: unknown }).default as typeof import(
				"../../src/routes/events"
			).default
		);
	});

	it("POST -> GET -> PATCH -> DELETE event happy path", async () => {
		const create = await app.request("/events", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({
				cattleId: 1,
				eventType: "ESTRUS",
				eventDatetime: new Date().toISOString(),
				notes: ""
			})
		});
		expect(create.status).toBe(201);
		const created = await create.json();

		const get = await app.request(`/events/${String(created.eventId)}`, {
			headers: auth()
		});
		expect(get.status).toBe(200);

		const patch = await app.request(`/events/${String(created.eventId)}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...auth() },
			body: JSON.stringify({ notes: "x" })
		});
		expect(patch.status).toBe(200);

		const del = await app.request(`/events/${String(created.eventId)}`, {
			method: "DELETE",
			headers: auth()
		});
		expect(del.status).toBe(200);
	});
});
