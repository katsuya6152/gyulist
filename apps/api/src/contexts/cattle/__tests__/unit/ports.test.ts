import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
import type { CattleRepoPort } from "../../ports";

function makeFakeRepo(): CattleRepoPort {
	const store = new Map<number, Cattle>();
	return {
		async findById(id: CattleId) {
			return store.get(id as unknown as number) ?? null;
		},
		async search(q) {
			const items = Array.from(store.values()).filter(
				(i) =>
					(i.ownerUserId as unknown as number) ===
					(q.ownerUserId as unknown as number)
			);
			return items.slice(0, q.limit);
		},
		async create(dto) {
			store.set(dto.cattleId as unknown as number, dto);
			return dto;
		},
		async update(id, partial) {
			const curr = store.get(id as unknown as number);
			if (!curr) throw new Error("not found");
			const next = { ...curr, ...partial } as Cattle;
			store.set(id as unknown as number, next);
			return next;
		},
		async delete(id) {
			store.delete(id as unknown as number);
		},
		async countByStatus(ownerUserId: UserId) {
			const items = Array.from(store.values()).filter(
				(i) =>
					(i.ownerUserId as unknown as number) ===
					(ownerUserId as unknown as number)
			);
			const groups = new Map<string, number>();
			for (const i of items) {
				const key = (i.status ?? "HEALTHY") as string;
				groups.set(key, (groups.get(key) ?? 0) + 1);
			}
			return Array.from(groups.entries()).map(([status, count]) => ({
				status: status as Cattle["status"],
				count
			}));
		},
		async appendStatusHistory() {
			// no-op for fake
		}
	};
}

describe("CattleRepoPort contract", () => {
	it("can create, get, update, delete, and search", async () => {
		const repo = makeFakeRepo();
		const owner = 1 as unknown as UserId;
		const cow: Cattle = {
			cattleId: 1 as unknown as CattleId,
			ownerUserId: owner,
			identificationNumber: 111 as unknown as Cattle["identificationNumber"],
			earTagNumber: null,
			name: "A",
			gender: "メス",
			birthday: null,
			growthStage: null,
			age: null,
			monthsOld: null,
			daysOld: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		await repo.create(cow);
		const found = await repo.findById(cow.cattleId);
		expect(found?.name).toBe("A");
		const list = await repo.search({
			ownerUserId: owner,
			limit: 10,
			sortBy: "id",
			sortOrder: "desc"
		});
		expect(list.length).toBe(1);
		await repo.update(cow.cattleId, { name: "B" });
		expect((await repo.findById(cow.cattleId))?.name).toBe("B");
		await repo.delete(cow.cattleId);
		expect(await repo.findById(cow.cattleId)).toBeNull();
	});
});
