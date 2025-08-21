import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../../shared/brand";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import {
	create,
	generateCattleDefaults,
	validateCreateCattleCmd
} from "../../domain/services/create";
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
			gender: "雌",
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

	it("handles repository errors gracefully", async () => {
		const repo = makeRepo();
		// Mock repository to throw error
		const originalCreate = repo.create;
		repo.create = async () => {
			throw new Error("Database connection failed");
		};

		const uc = create({ cattleRepo: repo, clock });
		const r = await uc({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌",
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

		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error.type).toBe("InfraError");
			expect(r.error.message).toBe("Failed to create cattle");
		}

		// Restore original method
		repo.create = originalCreate;
	});

	it("handles domain validation errors", async () => {
		const repo = makeRepo();
		const uc = create({ cattleRepo: repo, clock });

		// Test with invalid data that should fail domain validation
		const r = await uc({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 0 as Cattle["identificationNumber"], // Invalid: should be positive
			name: "X",
			gender: "雌",
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

		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error.type).toBe("ValidationError");
			if (r.error.type === "ValidationError") {
				expect(r.error.field).toBe("identificationNumber");
			}
		}
	});
});

describe("validateCreateCattleCmd", () => {
	it("validates required fields", () => {
		// Test missing ownerUserId
		const result1 = validateCreateCattleCmd({
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		} as Parameters<typeof validateCreateCattleCmd>[0]);

		expect(result1.ok).toBe(false);
		if (!result1.ok) {
			expect(result1.error.type).toBe("ValidationError");
			if (result1.error.type === "ValidationError") {
				expect(result1.error.field).toBe("ownerUserId");
			}
		}

		// Test missing identificationNumber
		const result2 = validateCreateCattleCmd({
			ownerUserId: 1 as unknown as UserId,
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		} as Parameters<typeof validateCreateCattleCmd>[0]);

		expect(result2.ok).toBe(false);
		if (!result2.ok) {
			expect(result2.error.type).toBe("ValidationError");
			if (result2.error.type === "ValidationError") {
				expect(result2.error.field).toBe("identificationNumber");
			}
		}
	});

	it("validates business rules", () => {
		// Test invalid identification number
		const result1 = validateCreateCattleCmd({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 0 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		} as Parameters<typeof validateCreateCattleCmd>[0]);

		expect(result1.ok).toBe(false);
		if (!result1.ok) {
			expect(result1.error.type).toBe("ValidationError");
			if (result1.error.type === "ValidationError") {
				expect(result1.error.field).toBe("identificationNumber");
			}
		}

		// Test invalid weight
		const result2 = validateCreateCattleCmd({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null,
			weight: 0
		} as Parameters<typeof validateCreateCattleCmd>[0]);

		expect(result2.ok).toBe(false);
		if (!result2.ok) {
			expect(result2.error.type).toBe("ValidationError");
			if (result2.error.type === "ValidationError") {
				expect(result2.error.field).toBe("weight");
			}
		}

		// Test invalid score
		const result3 = validateCreateCattleCmd({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null,
			score: 101
		} as Parameters<typeof validateCreateCattleCmd>[0]);

		expect(result3.ok).toBe(false);
		if (!result3.ok) {
			expect(result3.error.type).toBe("ValidationError");
			if (result3.error.type === "ValidationError") {
				expect(result3.error.field).toBe("score");
			}
		}
	});

	it("accepts valid data", () => {
		const result = validateCreateCattleCmd({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null,
			weight: 500,
			score: 85
		} as Parameters<typeof validateCreateCattleCmd>[0]);

		expect(result.ok).toBe(true);
	});
});

describe("generateCattleDefaults", () => {
	it("generates default values", () => {
		const cmd = {
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: null,
			breed: null,
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		} as Parameters<typeof generateCattleDefaults>[0];

		const result = generateCattleDefaults(cmd, fixedNow);

		expect(result.status).toBe("HEALTHY");
		expect(result.growthStage).toBeNull(); // No birthday provided
	});

	it("infers growth stage from birthday", () => {
		const birthday = new Date("2024-01-01T00:00:00.000Z");
		const cmd = {
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday,
			growthStage: null,
			breed: null,
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		};

		const result = generateCattleDefaults(
			cmd,
			new Date("2024-07-01T00:00:00.000Z")
		); // 6 months later

		expect(result.status).toBe("HEALTHY");
		expect(result.growthStage).toBe("CALF"); // 6 months = CALF
	});

	it("preserves existing values", () => {
		const cmd = {
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001 as Cattle["identificationNumber"],
			name: "X",
			gender: "雌" as Cattle["gender"],
			birthday: null,
			growthStage: "GROWING" as Cattle["growthStage"],
			breed: null,
			status: "SICK" as Cattle["status"],
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		};

		const result = generateCattleDefaults(cmd, fixedNow);

		expect(result.status).toBe("SICK"); // Preserved
		expect(result.growthStage).toBe("GROWING"); // Preserved
	});
});
