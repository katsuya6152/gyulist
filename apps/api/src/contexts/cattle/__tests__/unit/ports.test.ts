import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import type { CattleRepoPort } from "../../ports";

function makeFakeRepo(): CattleRepoPort {
	const store = new Map<number, Cattle>();
	return {
		async findById(id: CattleId) {
			return store.get(id as unknown as number) ?? null;
		},
		async findByIds(ids: CattleId[]) {
			return ids
				.map((id) => store.get(id as unknown as number))
				.filter(Boolean) as Cattle[];
		},
		async findByIdentificationNumber(
			ownerUserId: UserId,
			identificationNumber: number
		) {
			return (
				Array.from(store.values()).find(
					(c) =>
						(c.ownerUserId as unknown as number) ===
							(ownerUserId as unknown as number) &&
						(c.identificationNumber as unknown as number) ===
							identificationNumber
				) ?? null
			);
		},
		async search(q) {
			const items = Array.from(store.values()).filter(
				(i) =>
					(i.ownerUserId as unknown as number) ===
					(q.ownerUserId as unknown as number)
			);
			return items.slice(0, q.limit);
		},
		async create(dto: NewCattleProps) {
			const cattleId = Math.floor(Math.random() * 10000) as unknown as CattleId;
			const cattle: Cattle = {
				cattleId,
				ownerUserId: dto.ownerUserId,
				identificationNumber: dto.identificationNumber,
				name: (dto.name as Cattle["name"]) ?? null,
				earTagNumber: dto.earTagNumber ?? null,
				gender: dto.gender ?? null,
				birthday: dto.birthday ?? null,
				growthStage: dto.growthStage ?? null,
				breed: (dto.breed ?? null) as Cattle["breed"],
				status: dto.status ?? null,
				producerName: (dto.producerName ?? null) as Cattle["producerName"],
				barn: (dto.barn ?? null) as Cattle["barn"],
				breedingValue: (dto.breedingValue ?? null) as Cattle["breedingValue"],
				notes: (dto.notes ?? null) as Cattle["notes"],
				weight: (dto.weight ?? null) as Cattle["weight"],
				score: (dto.score ?? null) as Cattle["score"],
				age: null,
				monthsOld: null,
				daysOld: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				version: 1
			};
			store.set(cattleId as unknown as number, cattle);
			return cattle;
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

		async searchCount() {
			return 0;
		},
		async updateStatus(id, newStatus, changedBy, reason) {
			const cattle = store.get(id as unknown as number);
			if (!cattle) throw new Error("Not found");
			const updated = { ...cattle, status: newStatus };
			store.set(id as unknown as number, updated);
			return updated;
		},
		async getStatusHistory() {
			return [];
		},
		async getAgeDistribution() {
			return [];
		},
		async getBreedDistribution() {
			return [];
		},
		async getCattleNeedingAttention() {
			return [];
		},
		async batchUpdate() {
			return [];
		},
		async updateWithVersion(id, updates, expectedVersion) {
			return this.update(id, updates);
		},
		async appendStatusHistory(e) {
			// Mock implementation - no-op
		},
		async upsertBreedingStatus(cattleId, data) {
			// Mock implementation - no-op
		},
		async upsertBreedingSummary(cattleId, data) {
			// Mock implementation - no-op
		}
	};
}

describe("CattleRepoPort contract", () => {
	it("can create, get, update, delete, and search", async () => {
		const repo = makeFakeRepo();
		const owner = 1 as unknown as UserId;
		const newCow = {
			ownerUserId: owner,
			identificationNumber: 111 as unknown as Cattle["identificationNumber"],
			name: "A",
			gender: "メス" as const,
			status: "HEALTHY" as const
		};
		const created = await repo.create(newCow);
		const found = await repo.findById(created.cattleId);
		expect(found?.name).toBe("A");
		const list = await repo.search({
			ownerUserId: owner,
			limit: 10,
			sortBy: "id",
			sortOrder: "desc"
		});
		expect(list.length).toBe(1);
		await repo.update(created.cattleId, { name: "B" });
		expect((await repo.findById(created.cattleId))?.name).toBe("B");
		await repo.delete(created.cattleId);
		expect(await repo.findById(created.cattleId)).toBeNull();
	});
});
