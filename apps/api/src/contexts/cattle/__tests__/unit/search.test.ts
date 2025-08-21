import type { CattleId, UserId } from "@/shared/brand";
import { describe, expect, it } from "vitest";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import { search } from "../../domain/services/search";
import type { CattleRepoPort } from "../../ports";

function makeCow(owner: UserId, id: number, name: string): Cattle {
	return {
		cattleId: id as unknown as CattleId,
		ownerUserId: owner,
		identificationNumber: id as unknown as Cattle["identificationNumber"],
		earTagNumber: null,
		name: name as unknown as Cattle["name"],
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
}

function setupRepo(items: Cattle[]): CattleRepoPort {
	const list = [...items];
	return {
		async findById() {
			return null;
		},
		async search(q) {
			return list
				.filter(
					(c) =>
						(c.ownerUserId as unknown as number) ===
						(q.ownerUserId as unknown as number)
				)
				.slice(0, q.limit);
		},
		async create(dto: NewCattleProps): Promise<Cattle> {
			const cattle: Cattle = {
				...dto,
				cattleId: Date.now() as unknown as CattleId,
				age: null,
				monthsOld: null,
				daysOld: null,
				weight: null,
				score: null,
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
				createdAt: new Date(),
				updatedAt: new Date()
			};
			return cattle;
		},
		async update() {
			throw new Error("not used");
		},
		async delete() {},
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

describe("search cattle UC", () => {
	it("returns only owner's cattle up to limit", async () => {
		const owner1 = 1 as unknown as UserId;
		const owner2 = 2 as unknown as UserId;
		const repo = setupRepo([
			makeCow(owner1, 1, "A"),
			makeCow(owner1, 2, "B"),
			makeCow(owner2, 3, "C")
		]);
		const uc = search({ repo });
		const r = await uc({
			ownerUserId: owner1,
			limit: 1,
			sortBy: "id",
			sortOrder: "desc"
		});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value.length).toBe(1);
	});
});
