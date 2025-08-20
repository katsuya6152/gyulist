import type { CattleId, UserId } from "@/shared/brand";
import { describe, expect, it } from "vitest";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import { delete_ } from "../../domain/services/delete";
import type { CattleRepoPort } from "../../ports";

function setupRepo(initial?: Cattle): CattleRepoPort {
	const map = new Map<number, Cattle>();
	if (initial) map.set(initial.cattleId as unknown as number, initial);
	return {
		async findById(id) {
			return map.get(id as unknown as number) ?? null;
		},
		async search() {
			return Array.from(map.values());
		},
		async create(dto: NewCattleProps): Promise<Cattle> {
			const cattle: Cattle = {
				...dto,
				cattleId: Date.now() as unknown as CattleId,
				age: null,
				monthsOld: null,
				daysOld: null,
				version: 1,
				earTagNumber: dto.earTagNumber ?? null,
				name: (dto.name ?? null) as unknown as Cattle["name"],
				gender: dto.gender ?? null,
				birthday: dto.birthday ?? null,
				growthStage: dto.growthStage ?? null,
				breed: (dto.breed ?? null) as unknown as Cattle["breed"],
				status: dto.status ?? null,
				producerName: (dto.producerName ??
					null) as unknown as Cattle["producerName"],
				barn: (dto.barn ?? null) as unknown as Cattle["barn"],
				breedingValue: (dto.breedingValue ??
					null) as unknown as Cattle["breedingValue"],
				notes: (dto.notes ?? null) as unknown as Cattle["notes"],
				weight: null,
				score: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			map.set(cattle.cattleId as unknown as number, cattle);
			return cattle;
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
		async appendStatusHistory() {},
		async findByIds() {
			return [];
		},
		async findByIdentificationNumber() {
			return null;
		},
		async searchCount() {
			return 0;
		},
		async updateStatus() {
			return {} as Cattle;
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
		async updateWithVersion() {
			return {} as Cattle;
		}
	};
}

describe("delete cattle UC", () => {
	it("deletes when owner matches", async () => {
		const owner = 1 as unknown as UserId;
		const cow: Cattle = {
			cattleId: 1 as unknown as CattleId,
			ownerUserId: owner,
			identificationNumber: 1 as unknown as Cattle["identificationNumber"],
			earTagNumber: null,
			name: "A" as unknown as Cattle["name"],
			gender: "雌",
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
			weight: null,
			score: null,
			version: 1,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		const repo = setupRepo(cow);
		const r = await delete_({ repo })({
			requesterUserId: owner,
			id: cow.cattleId
		});
		expect(r.ok).toBe(true);
	});
});
