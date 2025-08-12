import type { AnyD1Database } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Dynamic fake DB used by mocked drizzle()
let currentDb: unknown;

vi.mock("drizzle-orm/d1", () => ({
	drizzle: () => currentDb,
}));

// Import after mocking drizzle
import * as repo from "../../../src/repositories/cattleRepository";

const makeArray = <T>(value: T[]): T[] => value;

describe("cattleRepository (D1 path)", () => {
	beforeEach(() => {
		currentDb = undefined;
	});

	it("findCattleList returns rows", async () => {
		currentDb = {
			select() {
				return {
					from: () => ({
						where: async () => makeArray([{ cattleId: 1 }]),
					}),
				};
			},
		};
		const rows = await repo.findCattleList({} as unknown as AnyD1Database, 123);
		expect(rows[0].cattleId).toBe(1);
	});

	it("searchCattle with filters and cursor returns paginated list", async () => {
		currentDb = {
			select() {
				return {
					from: () => ({
						where: () => ({
							orderBy: () => ({
								limit: async () =>
									makeArray([
										{ cattleId: 1 },
										{ cattleId: 2 },
										{ cattleId: 3 },
									]),
							}),
						}),
					}),
				};
			},
		};
		const rows = await repo.searchCattle({} as unknown as AnyD1Database, 1, {
			cursor: { id: 1, value: 10 },
			limit: 2,
			sort_by: "name",
			sort_order: "desc",
			search: "abc",
			growth_stage: ["CALF"],
			gender: ["雌"],
			status: ["HEALTHY"],
		} as unknown as Parameters<typeof repo.searchCattle>[2]);
		expect(rows.length).toBeGreaterThan(0);
	});

	it("findCattleById returns null when not found", async () => {
		currentDb = {
			select() {
				const chain: Record<string, unknown> = {
					from: () => chain,
					leftJoin: () => chain,
					where: async () => makeArray([]),
				};
				return chain;
			},
		};
		const row = await repo.findCattleById({} as unknown as AnyD1Database, 99);
		expect(row).toBeNull();
	});

	it("findCattleById aggregates joined rows and sorts events desc", async () => {
		const rows = [
			{
				cattle: { cattleId: 1, status: "HEALTHY" },
				bloodline: { x: 1 },
				motherInfo: { y: 1 },
				breedingStatus: { z: 1 },
				breedingSummary: { w: 1 },
				events: { eventDatetime: "2024-01-01T00:00:00Z" },
			},
			{
				cattle: { cattleId: 1, status: "HEALTHY" },
				bloodline: { x: 1 },
				motherInfo: { y: 1 },
				breedingStatus: { z: 1 },
				breedingSummary: { w: 1 },
				events: { eventDatetime: "2024-02-01T00:00:00Z" },
			},
		];
		currentDb = {
			select() {
				const chain: Record<string, unknown> = {
					from: () => chain,
					leftJoin: () => chain,
					where: async () => makeArray(rows),
				};
				return chain;
			},
		};
		const result = await repo.findCattleById({} as unknown as AnyD1Database, 1);
		expect(result?.events?.[0]?.eventDatetime).toBe("2024-02-01T00:00:00Z");
	});

	it("updateBloodline updates if exists, otherwise creates", async () => {
		// Case 1: exists -> update
		currentDb = {
			select: () => ({
				from: () => ({ where: () => ({ limit: () => makeArray([{}]) }) }),
			}),
			update: () => ({
				set: () => ({ where: () => ({ returning: async () => [{ ok: 1 }] }) }),
			}),
		};
		const updated = await repo.updateBloodline(
			{} as unknown as AnyD1Database,
			1,
			{},
		);
		expect(updated).toEqual({ ok: 1 });

		// Case 2: not exists -> create
		currentDb = {
			select: () => ({
				from: () => ({ where: () => ({ limit: () => makeArray([]) }) }),
			}),
			insert: () => ({
				values: () => ({ returning: async () => [{ created: 1 }] }),
			}),
		};
		const created = await repo.updateBloodline(
			{} as unknown as AnyD1Database,
			1,
			{},
		);
		expect(created).toEqual({ created: 1 });
	});

	it("updateBreedingStatus and updateBreedingSummary update if exists else create", async () => {
		// exists path
		currentDb = {
			select: () => ({
				from: () => ({ where: () => ({ limit: () => makeArray([{}]) }) }),
			}),
			update: () => ({
				set: () => ({ where: () => ({ returning: async () => [{ ok: 1 }] }) }),
			}),
		};
		const s1 = await repo.updateBreedingStatus(
			{} as unknown as AnyD1Database,
			1,
			{},
		);
		expect(s1).toEqual({ ok: 1 });

		// create path
		currentDb = {
			select: () => ({
				from: () => ({ where: () => ({ limit: () => makeArray([]) }) }),
			}),
			insert: () => ({
				values: () => ({ returning: async () => [{ created: 2 }] }),
			}),
		};
		const s2 = await repo.updateBreedingSummary(
			{} as unknown as AnyD1Database,
			1,
			{},
		);
		expect(s2).toEqual({ created: 2 });
	});

	it("create/update/delete basic operations return values or resolve", async () => {
		currentDb = {
			insert: () => ({
				values: () => ({ returning: async () => [{ id: 1 }] }),
			}),
			update: () => ({
				set: () => ({ where: () => ({ returning: async () => [{ id: 2 }] }) }),
			}),
			delete: () => ({ where: async () => {} }),
		};
		const c = await repo.createCattle(
			{} as unknown as AnyD1Database,
			{ ownerUserId: 1 } as unknown as Parameters<typeof repo.createCattle>[1],
		);
		expect(c).toEqual({ id: 1 });
		const u = await repo.updateCattle({} as unknown as AnyD1Database, 1, {
			name: "n",
		} as unknown as Parameters<typeof repo.updateCattle>[2]);
		expect(u).toEqual({ id: 2 });
		await repo.deleteCattle({} as unknown as AnyD1Database, 1);
	});
});
