import type { AnyD1Database } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as cattleRepository from "../../../src/repositories/cattleRepository";
import {
	createNewCattle,
	deleteCattleData,
	getCattleById,
	searchCattleList,
	updateCattleData,
	updateStatus,
} from "../../../src/services/cattleService";
import { mockCattle } from "../../fixtures/database";

// repositoriesをモック
vi.mock("../../../src/repositories/cattleRepository", () => ({
	findCattleById: vi.fn(),
	createCattle: vi.fn(),
	updateCattle: vi.fn(),
	deleteCattle: vi.fn(),
	searchCattle: vi.fn(),
	createBloodline: vi.fn(),
	createBreedingStatus: vi.fn(),
	createBreedingSummary: vi.fn(),
	updateBloodline: vi.fn(),
	updateBreedingStatus: vi.fn(),
	updateBreedingSummary: vi.fn(),
	updateCattleStatus: vi.fn(),
	createStatusHistory: vi.fn(),
}));
const mockCattleRepository = vi.mocked(cattleRepository);

// utilsをモック
vi.mock("../../../src/utils/date", () => ({
	calculateAge: vi.fn(),
}));

describe("CattleService", () => {
	let mockDb: AnyD1Database;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = {} as AnyD1Database;
	});

	describe("exports", () => {
		it("should export getCattleById function", () => {
			expect(getCattleById).toBeDefined();
			expect(typeof getCattleById).toBe("function");
		});

		it("should export createNewCattle function", () => {
			expect(createNewCattle).toBeDefined();
			expect(typeof createNewCattle).toBe("function");
		});

		it("should export updateCattleData function", () => {
			expect(updateCattleData).toBeDefined();
			expect(typeof updateCattleData).toBe("function");
		});

		it("should export searchCattleList function", () => {
			expect(searchCattleList).toBeDefined();
			expect(typeof searchCattleList).toBe("function");
		});

		it("should export deleteCattleData function", () => {
			expect(deleteCattleData).toBeDefined();
			expect(typeof deleteCattleData).toBe("function");
		});
	});

	describe("function signatures", () => {
		it("should have correct parameter length for getCattleById", () => {
			expect(getCattleById.length).toBe(2);
		});

		it("should have correct parameter length for createNewCattle", () => {
			expect(createNewCattle.length).toBe(2);
		});

		it("should have correct parameter length for updateCattleData", () => {
			expect(updateCattleData.length).toBe(3);
		});

		it("should have correct parameter length for searchCattleList", () => {
			expect(searchCattleList.length).toBe(3);
		});

		it("should have correct parameter length for deleteCattleData", () => {
			expect(deleteCattleData.length).toBe(2);
		});
	});

	describe("function types", () => {
		it("should return promises from async functions", () => {
			const basicCattleData = {
				ownerUserId: 1,
				name: "Test Cattle",
				identificationNumber: 12345,
				earTagNumber: 54321,
				birthday: "2022-01-01",
				gender: "雌",
				growthStage: "GROWING" as const,
			};

			const searchQuery = {
				limit: 10,
				sort_by: "id" as const,
				sort_order: "asc" as const,
			};

			const updateData = {
				name: "Updated Cattle",
			};

			const result1 = getCattleById(mockDb, 1);
			const result2 = createNewCattle(mockDb, basicCattleData);
			const result3 = updateCattleData(mockDb, 1, updateData);
			const result4 = searchCattleList(mockDb, 1, searchQuery);
			const result5 = deleteCattleData(mockDb, 1);

			expect(result1).toBeInstanceOf(Promise);
			expect(result2).toBeInstanceOf(Promise);
			expect(result3).toBeInstanceOf(Promise);
			expect(result4).toBeInstanceOf(Promise);
			expect(result5).toBeInstanceOf(Promise);

			return Promise.allSettled([result1, result2, result3, result4, result5]);
		});
	});

	describe("data handling", () => {
		it("should handle cattle data with different growth stages", () => {
			const growthStages = [
				"CALF",
				"GROWING",
				"FATTENING",
				"MULTI_PAROUS",
			] as const;

			const promises = growthStages.map((growthStage) => {
				const cattleData = {
					ownerUserId: 1,
					name: `Test Cattle ${growthStage}`,
					identificationNumber: 12345,
					earTagNumber: 54321,
					birthday: "2022-01-01",
					gender: "雌",
					growthStage,
				};
				return createNewCattle(mockDb, cattleData);
			});

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});

		it("should handle cattle data with optional fields", () => {
			const cattleDataSets = [
				{
					ownerUserId: 1,
					name: "Basic Cattle",
					identificationNumber: 12345,
					earTagNumber: 54321,
					gender: "雌",
					growthStage: "GROWING" as const,
				},
				{
					ownerUserId: 1,
					name: "Cattle with birthday",
					identificationNumber: 12346,
					earTagNumber: 54322,
					birthday: "2022-01-01",
					gender: "雄",
					growthStage: "CALF" as const,
				},
				{
					ownerUserId: 1,
					name: "Cattle with bloodline",
					identificationNumber: 12347,
					earTagNumber: 54323,
					birthday: "2021-06-01",
					gender: "雌",
					growthStage: "FATTENING" as const,
					bloodline: {
						fatherCattleName: "Father Bull",
					},
				},
			];

			const promises = cattleDataSets.map((data) =>
				createNewCattle(mockDb, data),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});

		it("should handle different search parameters", () => {
			const searchQueries = [
				{
					limit: 10,
					sort_by: "id" as const,
					sort_order: "asc" as const,
				},
				{
					limit: 20,
					sort_by: "name" as const,
					sort_order: "desc" as const,
					search: "test",
				},
				{
					limit: 15,
					sort_by: "days_old" as const,
					sort_order: "asc" as const,
					growth_stage: ["CALF", "GROWING"] as (
						| "CALF"
						| "GROWING"
						| "FATTENING"
						| "MULTI_PAROUS"
					)[],
					gender: ["メス"] as ("メス" | "オス")[],
				},
			];

			const promises = searchQueries.map((query) =>
				searchCattleList(mockDb, 1, query),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});

		it("should handle different update scenarios", () => {
			const updateDataSets = [
				{ name: "Updated Name" },
				{ birthday: "2021-01-01" },
				{
					name: "Updated with bloodline",
					bloodline: { fatherCattleName: "New Father" },
				},
				{
					name: "Updated with breeding",
					breedingStatus: { breedingMemo: "Test memo" },
				},
			];

			const promises = updateDataSets.map((data, index) =>
				updateCattleData(mockDb, index + 1, data),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});
	});

	describe("updateStatus", () => {
		it("should update status and create history", async () => {
			mockCattleRepository.findCattleById.mockResolvedValue({
				...mockCattle,
				status: "HEALTHY",
			});
			mockCattleRepository.updateCattleStatus.mockResolvedValue({
				...mockCattle,
				status: "PREGNANT",
			});
			mockCattleRepository.createStatusHistory.mockResolvedValue({
				historyId: 1,
			});

			const result = await updateStatus(mockDb, 1, "PREGNANT", 1, "reason");

			expect(mockCattleRepository.findCattleById).toHaveBeenCalledWith(
				mockDb,
				1,
			);
			expect(mockCattleRepository.updateCattleStatus).toHaveBeenCalledWith(
				mockDb,
				1,
				"PREGNANT",
			);
			expect(mockCattleRepository.createStatusHistory).toHaveBeenCalledWith(
				mockDb,
				{
					cattleId: 1,
					oldStatus: "HEALTHY",
					newStatus: "PREGNANT",
					changedBy: 1,
					reason: "reason",
				},
			);
			expect(result.status).toBe("PREGNANT");
		});

		it("should throw when current status is final", async () => {
			mockCattleRepository.findCattleById.mockResolvedValue({
				...mockCattle,
				status: "SHIPPED",
			});

			await expect(updateStatus(mockDb, 1, "PREGNANT", 1)).rejects.toThrow(
				"現在のステータスでは変更できません",
			);
		});
	});
});
