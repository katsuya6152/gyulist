import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import { createCattleUseCase as create } from "../../domain/services/createCattle";
import type { CattleRepoPort } from "../../ports";

const fixedNow = new Date("2024-01-01T00:00:00.000Z");
const clock = { now: () => fixedNow };

function makeRepo(): CattleRepoPort {
	let seq = 1;
	const map = new Map<number, Cattle>();
	return {
		async findById(id) {
			return map.get(id as unknown as number) ?? null;
		},
		async findByIds(ids: CattleId[]) {
			return ids
				.map((id) => map.get(id as unknown as number))
				.filter(Boolean) as Cattle[];
		},
		async findByIdentificationNumber(
			ownerUserId: UserId,
			identificationNumber: number
		) {
			return (
				Array.from(map.values()).find(
					(c) =>
						(c.ownerUserId as unknown as number) ===
							(ownerUserId as unknown as number) &&
						(c.identificationNumber as unknown as number) ===
							identificationNumber
				) ?? null
			);
		},
		async search() {
			return Array.from(map.values());
		},
		async create(dto: NewCattleProps) {
			const id = seq++ as number;
			const created: Cattle = {
				cattleId: id as unknown as CattleId,
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
				createdAt: fixedNow,
				updatedAt: fixedNow,
				version: 1
			};
			map.set(id, created);
			return created;
		},
		async update(id, partial) {
			const curr = map.get(id as unknown as number);
			if (!curr) throw new Error("not found");
			const next = { ...curr, ...partial } as Cattle;
			map.set(id as unknown as number, next);
			return next;
		},
		async delete(id) {
			map.delete(id as unknown as number);
		},
		async countByStatus() {
			return [];
		},
		async searchCount() {
			return 0;
		},
		async updateStatus(id, newStatus, changedBy, reason) {
			const cattle = map.get(id as unknown as number);
			if (!cattle) throw new Error("Not found");
			const updated = { ...cattle, status: newStatus };
			map.set(id as unknown as number, updated);
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

describe("create cattle UC", () => {
	it("creates cattle with clock timestamps", async () => {
		const repo = makeRepo();
		const uc = create({ cattleRepo: repo, clock });
		const r = await uc({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "メス",
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.createdAt).toEqual(fixedNow);
			expect(r.value.updatedAt).toEqual(fixedNow);
		}
	});
});
