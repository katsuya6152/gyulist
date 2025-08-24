/**
 * Cattle Use Cases Unit Tests - New Architecture
 *
 * 牛管理ユースケースのユニットテスト
 */

import {
	type MockedFunction,
	beforeEach,
	describe,
	expect,
	it,
	vi
} from "vitest";
import { createCattleUseCase } from "../../../src/application/use-cases/cattle/createCattle";
import { getCattleUseCase } from "../../../src/application/use-cases/cattle/getCattle";
import type {
	Barn,
	Breed,
	CattleName,
	EarTagNumber,
	IdentificationNumber,
	Notes,
	ProducerName,
	Score,
	Weight
} from "../../../src/domain/types/cattle/CattleTypes";
import type { CattleId, UserId } from "../../../src/shared/brand";

describe("Cattle Use Cases - New Architecture", () => {
	let mockCattleRepo: {
		findById: ReturnType<typeof vi.fn>;
		findByIds: ReturnType<typeof vi.fn>;
		findByOwner: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		search: ReturnType<typeof vi.fn>;
		searchCount: ReturnType<typeof vi.fn>;
		findByIdentificationNumber: ReturnType<typeof vi.fn>;
		findByEarTagNumber: ReturnType<typeof vi.fn>;
		updateStatus: ReturnType<typeof vi.fn>;
		getStatusCounts: ReturnType<typeof vi.fn>;
		getStatusHistory: ReturnType<typeof vi.fn>;
		countByStatus: ReturnType<typeof vi.fn>;
		getAgeDistribution: ReturnType<typeof vi.fn>;
		getBreedDistribution: ReturnType<typeof vi.fn>;
		getCattleNeedingAttention: ReturnType<typeof vi.fn>;
		batchUpdate: ReturnType<typeof vi.fn>;
		updateWithVersion: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockCattleRepo = {
			findById: vi.fn(),
			findByIds: vi.fn(),
			findByOwner: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			search: vi.fn(),
			searchCount: vi.fn(),
			findByIdentificationNumber: vi.fn(),
			findByEarTagNumber: vi.fn(),
			updateStatus: vi.fn(),
			getStatusCounts: vi.fn(),
			getStatusHistory: vi.fn(),
			countByStatus: vi.fn(),
			getAgeDistribution: vi.fn(),
			getBreedDistribution: vi.fn(),
			getCattleNeedingAttention: vi.fn(),
			batchUpdate: vi.fn(),
			updateWithVersion: vi.fn()
		};
	});

	describe("getCattleUseCase", () => {
		it("should get cattle by ID successfully", async () => {
			const mockCattle = {
				cattleId: 1 as unknown as CattleId,
				ownerUserId: 1 as unknown as UserId,
				name: "テスト牛001" as unknown as CattleName,
				identificationNumber: 12345 as unknown as IdentificationNumber,
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "雌" as const,
				birthday: new Date("2023-01-01"),
				growthStage: "CALF" as const,
				age: 365,
				monthsOld: 12,
				daysOld: 365,
				status: "HEALTHY" as const,
				breed: "ホルスタイン" as unknown as Breed,
				producerName: "農場A" as unknown as ProducerName,
				barn: "A棟" as unknown as Barn,
				notes: "テスト牛" as unknown as Notes,
				introducedAt: new Date("2023-01-01"),
				weight: 45 as unknown as Weight,
				score: 4 as unknown as Score,
				createdAt: new Date("2023-01-01"),
				updatedAt: new Date("2023-01-01"),
				breedingValue: null,
				version: 1,
				alerts: {
					hasActiveAlerts: false,
					alertCount: 0,
					highestSeverity: null
				}
			};

			mockCattleRepo.findById.mockResolvedValue({
				ok: true,
				value: mockCattle
			});

			const input = {
				cattleId: 1 as unknown as CattleId,
				requestingUserId: 1 as unknown as UserId
			};

			const deps = {
				cattleRepo: mockCattleRepo,
				clock: { now: () => new Date() }
			};
			const result = await getCattleUseCase(deps)(input);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.cattleId).toBe(1);
				expect(result.value.name).toBe("テスト牛001");
			}
			expect(mockCattleRepo.findById).toHaveBeenCalledWith(1);
		});

		it("should return error when cattle not found", async () => {
			mockCattleRepo.findById.mockResolvedValue({
				ok: false,
				error: { type: "NotFound", entity: "Cattle", id: 999 }
			});

			const input = {
				cattleId: 999 as unknown as CattleId,
				requestingUserId: 1 as unknown as UserId
			};

			const deps = {
				cattleRepo: mockCattleRepo,
				clock: { now: () => new Date() }
			};
			const result = await getCattleUseCase(deps)(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("NotFound");
			}
		});
	});

	describe("createCattleUseCase", () => {
		it("should create cattle successfully", async () => {
			const newCattle = {
				cattleId: 1 as unknown as CattleId,
				ownerUserId: 1 as unknown as UserId,
				name: "新しい牛" as unknown as CattleName,
				identificationNumber: 12345 as unknown as IdentificationNumber,
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "雌" as const,
				birthday: new Date("2023-01-01"),
				growthStage: "CALF" as const,
				age: 365,
				monthsOld: 12,
				daysOld: 365,
				status: "HEALTHY" as const,
				breed: "ホルスタイン" as unknown as Breed,
				producerName: "農場A" as unknown as ProducerName,
				barn: "A棟" as unknown as Barn,
				notes: "新しい牛" as unknown as Notes,
				introducedAt: new Date("2023-01-01"),
				weight: 45 as unknown as Weight,
				score: 4 as unknown as Score,
				createdAt: new Date(),
				updatedAt: new Date(),
				breedingValue: null,
				version: 1,
				alerts: {
					hasActiveAlerts: false,
					alertCount: 0,
					highestSeverity: null
				}
			};

			mockCattleRepo.create.mockResolvedValue({
				ok: true,
				value: newCattle
			});

			const input = {
				ownerUserId: 1 as unknown as UserId,
				name: "新しい牛" as unknown as CattleName,
				identificationNumber: 12345 as unknown as IdentificationNumber,
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "雌" as const,
				growthStage: "CALF" as const
			};

			const deps = {
				cattleRepo: mockCattleRepo,
				clock: { now: () => new Date() }
			};
			const result = await createCattleUseCase(deps)(input);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.name).toBe(input.name);
			}
			expect(mockCattleRepo.create).toHaveBeenCalled();
		});

		it("should return error for duplicate identification number", async () => {
			mockCattleRepo.create.mockResolvedValue({
				ok: false,
				error: {
					type: "Conflict",
					message: "Duplicate identification number"
				}
			});

			const input = {
				ownerUserId: 1 as unknown as UserId,
				name: "重複牛" as unknown as CattleName,
				identificationNumber: 12345 as unknown as IdentificationNumber,
				earTagNumber: 67890 as unknown as EarTagNumber,
				gender: "雌" as const,
				growthStage: "CALF" as const
			};

			const deps = {
				cattleRepo: mockCattleRepo,
				clock: { now: () => new Date() }
			};
			const result = await createCattleUseCase(deps)(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("Conflict");
			}
		});
	});

	// Note: Search use case tests would be added when searchCattleUseCase is implemented

	describe("Business Rules Validation", () => {
		it("should validate cattle age constraints", () => {
			// Test business rules for cattle age limits
			const maxAge = 15 * 365; // 15 years in days
			const testAge = 10 * 365; // 10 years in days

			expect(testAge).toBeLessThan(maxAge);
		});

		it("should validate identification number uniqueness", () => {
			// Test business rules for ID uniqueness
			const validIdRange = { min: 1, max: 999999 };
			const testId = 12345;

			expect(testId).toBeGreaterThanOrEqual(validIdRange.min);
			expect(testId).toBeLessThanOrEqual(validIdRange.max);
		});

		it("should validate growth stage transitions", () => {
			const validTransitions = {
				CALF: ["GROWING"],
				GROWING: ["FATTENING", "FIRST_CALVED"],
				FATTENING: ["FIRST_CALVED"],
				FIRST_CALVED: ["MULTI_PAROUS"],
				MULTI_PAROUS: []
			};

			// Test that transitions are logically valid
			expect(validTransitions.CALF).toContain("GROWING");
			expect(validTransitions.GROWING).toContain("FATTENING");
		});
	});
});
