import { describe, expect, it, vi } from "vitest";
import { create } from "../../domain/services/create";
import { delete_ } from "../../domain/services/delete";
import { update } from "../../domain/services/update";
import type { EventId, EventsRepoPort } from "../../ports";

describe("Events domain - create/update/delete", () => {
	it("create returns created event", async () => {
		const now = new Date().toISOString();
		vi.setSystemTime(new Date(now));
		const deps = {
			repo: {
				create: vi.fn().mockResolvedValue({
					eventId: 1,
					cattleId: 1,
					eventType: "CALVING",
					eventDatetime: now,
					notes: null,
					createdAt: now,
					updatedAt: now
				})
			} as unknown as EventsRepoPort
		};
		const res = await create(deps)({
			cattleId: 1,
			eventType: "CALVING",
			eventDatetime: now,
			notes: null
		});
		expect(res.ok).toBe(true);
	});

	it("update returns updated event", async () => {
		const now = new Date().toISOString();
		vi.setSystemTime(new Date(now));
		const deps = {
			repo: {
				update: vi.fn().mockResolvedValue({
					eventId: 1,
					cattleId: 1,
					eventType: "CALVING",
					eventDatetime: now,
					notes: "n",
					createdAt: now,
					updatedAt: now
				})
			} as unknown as EventsRepoPort
		};
		const res = await update(deps)(1 as unknown as EventId, { notes: "n" });
		expect(res.ok).toBe(true);
	});

	it("delete returns success", async () => {
		const deps = {
			repo: {
				delete: vi.fn().mockResolvedValue(undefined)
			} as unknown as EventsRepoPort
		};
		const res = await delete_(deps)(1 as unknown as EventId);
		expect(res.ok).toBe(true);
	});

	it("wraps infra errors", async () => {
		const deps = {
			repo: {
				delete: vi.fn().mockRejectedValue(new Error("db"))
			} as unknown as EventsRepoPort
		};
		const r = await delete_(deps)(1 as unknown as EventId);
		expect(r.ok).toBe(false);
	});
});
