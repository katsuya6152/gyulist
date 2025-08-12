import type { AnyD1Database } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";

let currentDb: unknown;
vi.mock("drizzle-orm/d1", () => ({ drizzle: () => currentDb }));

import * as repo from "../../../src/repositories/eventRepository";

// no-op helper removed; keep file minimal

describe("eventRepository (D1 path)", () => {
	beforeEach(() => {
		currentDb = undefined;
	});

	it("findEventsByCattleId builds join and returns rows", async () => {
		const rows = [{ eventId: 1 }];
		currentDb = {
			select: () => ({
				from: () => ({
					innerJoin: () => ({
						where: () => ({ orderBy: async () => rows }),
					}),
				}),
			}),
		};
		const result = await repo.findEventsByCattleId(
			{} as unknown as AnyD1Database,
			1,
			10,
		);
		expect(result).toEqual(rows);
	});

	it("searchEvents without filters returns list and hasNext false", async () => {
		const rows = [{ eventId: 1 }];
		currentDb = {
			select: () => ({
				from: () => ({
					innerJoin: () => ({
						where: () => ({
							orderBy: () => ({ limit: async () => rows }),
						}),
					}),
				}),
			}),
		};
		const res = await repo.searchEvents({} as unknown as AnyD1Database, 10, {
			limit: 1,
		} as unknown as Parameters<typeof repo.searchEvents>[2]);
		expect(res.results).toEqual(rows);
		expect(res.hasNext).toBe(false);
		expect(res.nextCursor).toBeNull();
	});

	it("searchEvents with all filters and cursor sets hasNext and nextCursor", async () => {
		const rows = [{ eventId: 1 }, { eventId: 2 }]; // limit+1
		currentDb = {
			select: () => ({
				from: () => ({
					innerJoin: () => ({
						where: () => ({
							orderBy: () => ({ limit: async () => rows }),
						}),
					}),
				}),
			}),
		};
		const res = await repo.searchEvents({} as unknown as AnyD1Database, 5, {
			cattleId: 1,
			eventType: "VACCINATION",
			startDate: "2024-01-01",
			endDate: "2024-12-31",
			cursor: 1,
			limit: 1,
		} as unknown as Parameters<typeof repo.searchEvents>[2]);
		expect(res.hasNext).toBe(true);
		expect(res.nextCursor).toBe(1);
		expect(res.results.length).toBe(1);
	});

	it("findEventById returns null when not found", async () => {
		currentDb = {
			select: () => ({
				from: () => ({
					innerJoin: () => ({ where: () => ({ limit: async () => [] }) }),
				}),
			}),
		};
		const row = await repo.findEventById({} as unknown as AnyD1Database, 99, 1);
		expect(row).toBeNull();
	});

	it("findEventById returns single row", async () => {
		currentDb = {
			select: () => ({
				from: () => ({
					innerJoin: () => ({
						where: () => ({ limit: async () => [{ eventId: 7 }] }),
					}),
				}),
			}),
		};
		const row = await repo.findEventById({} as unknown as AnyD1Database, 7, 1);
		expect(row?.eventId).toBe(7);
	});
});
