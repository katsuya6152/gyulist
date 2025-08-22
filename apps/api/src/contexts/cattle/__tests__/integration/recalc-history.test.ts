import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import type { Bindings } from "../../../../index";
import { calculateAgeInfo } from "../../../../shared/utils/data-helpers";
import { FakeStore } from "../../../../tests/integration/helpers/fakeDrizzle";

describe("Cattle API E2E (recalc & history)", () => {
	let app: Hono<{ Bindings: Bindings }>;
	let store: FakeStore;

	beforeEach(async () => {
		const d1mod = await import("drizzle-orm/d1");
		store = new FakeStore();
		const appInst = new Hono<{ Bindings: Bindings }>();
		appInst.use("*", async (c, next) => {
			c.env.DB = store as unknown as Bindings["DB"];
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
			headers: { "Content-Type": "application/json", ...auth() },
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

function auth() {
	return {
		Authorization: "Bearer test-token"
	};
}
