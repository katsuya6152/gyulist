import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import {
	type FakeStore,
	createEmptyStore,
	createFakeD1,
	createFakeDrizzle
} from "../../../../../tests/integration/helpers/fakeDrizzle";
import type { Bindings } from "../../../../index";
import { calculateAgeInfo } from "../../../../shared/utils/data-helpers";

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

describe.skip("Cattle API E2E (recalc & history)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;

	beforeEach(async () => {
		const d1mod = await import("drizzle-orm/d1");
		store = createEmptyStore();
		const fakeDb = createFakeDrizzle(store);
		const appInst = new Hono<{ Bindings: Bindings }>();
		appInst.use("*", async (c, next) => {
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
		const routes = await import("../../../../../src/routes/cattle");
		appInst.route(
			"/cattle",
			(routes as { default: unknown }).default as typeof import(
				"../../../../../src/routes/cattle"
			).default
		);
		app = appInst;
	});

	it("PATCH /cattle/:id with new birthday recalculates age fields", async () => {
		const res = await app.request("/cattle/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
			body: JSON.stringify({ birthday: "2020-01-01" })
		});
		expect(res.status).toBe(200);
		const body = await res.json();

		// 年齢情報が計算されて返されることを確認
		const ageInfo = calculateAgeInfo(new Date("2020-01-01"));
		expect(body.age).toBe(ageInfo.age);
		expect(body.monthsOld).toBe(ageInfo.monthsOld);
		expect(body.daysOld).toBe(ageInfo.daysOld);
	});

	it("PATCH /cattle/:id/status creates history with old/new/changedBy", async () => {
		const res = await app.request("/cattle/1/status", {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...authHeaders },
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

function auth() {
	return {
		Authorization: "Bearer test-token"
	};
}
