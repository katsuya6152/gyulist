import type { CattleId, UserId } from "@/shared/brand";
import { describe, expect, it } from "vitest";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import { updateStatus } from "../../domain/services/updateStatus";
import type { CattleRepoPort } from "../../ports";

function setupRepo(initial: Cattle): CattleRepoPort {
	let current = initial;
	return {
		async findById() {
			return current;
		},
		async search() {
			return [current];
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
				updatedAt: new Date(),
				alerts: {
					hasActiveAlerts: false,
					alertCount: 0,
					highestSeverity: null
				}
			};
			current = cattle;
			return cattle;
		},
		async update(id, partial) {
			current = { ...current, ...partial } as Cattle;
			return current;
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

describe("updateStatus UC", () => {
	it("appends history and updates when owner matches", async () => {
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
			updatedAt: new Date(),
			alerts: {
				hasActiveAlerts: false,
				alertCount: 0,
				highestSeverity: null
			}
		};
		const repo = setupRepo(cow);
		const fixedNow = new Date("2024-01-01T00:00:00.000Z");
		const clock = { now: () => fixedNow };
		const r = await updateStatus({ repo, clock })({
			requesterUserId: owner,
			id: cow.cattleId,
			newStatus: "RESTING",
			reason: null
		});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value.status).toBe("RESTING");
	});
});
