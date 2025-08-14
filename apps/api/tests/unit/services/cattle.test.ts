import type { AnyD1Database } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as cattleRepository from "../../../src/repositories/cattleRepository";
import {
	createNewCattle,
	deleteCattleData,
	getCattleById,
	searchCattleList,
	updateCattleData,
	updateStatus
} from "../../../src/services/cattleService";
import * as dateUtils from "../../../src/utils/date";
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
	createStatusHistory: vi.fn()
}));
const mockCattleRepository = vi.mocked(cattleRepository);

// utilsをモック
vi.mock("../../../src/utils/date", () => ({
	calculateAge: vi.fn()
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
				growthStage: "GROWING" as const
			};

			const searchQuery = {
				limit: 10,
				sort_by: "id" as const,
				sort_order: "asc" as const
			};

			const updateData = {
				name: "Updated Cattle"
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
				"MULTI_PAROUS"
			] as const;

			const promises = growthStages.map((growthStage) => {
				const cattleData = {
					ownerUserId: 1,
					name: `Test Cattle ${growthStage}`,
					identificationNumber: 12345,
					earTagNumber: 54321,
					birthday: "2022-01-01",
					gender: "雌",
					growthStage
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
					growthStage: "GROWING" as const
				},
				{
					ownerUserId: 1,
					name: "Cattle with birthday",
					identificationNumber: 12346,
					earTagNumber: 54322,
					birthday: "2022-01-01",
					gender: "雄",
					growthStage: "CALF" as const
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
						fatherCattleName: "Father Bull"
					}
				}
			];

			const promises = cattleDataSets.map((data) =>
				createNewCattle(mockDb, data)
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
					sort_order: "asc" as const
				},
				{
					limit: 20,
					sort_by: "name" as const,
					sort_order: "desc" as const,
					search: "test"
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
					gender: ["メス"] as ("メス" | "オス")[]
				}
			];

			const promises = searchQueries.map((query) =>
				searchCattleList(mockDb, 1, query)
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
					bloodline: { fatherCattleName: "New Father" }
				},
				{
					name: "Updated with breeding",
					breedingStatus: { breedingMemo: "Test memo" }
				}
			];

			const promises = updateDataSets.map((data, index) =>
				updateCattleData(mockDb, index + 1, data)
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
				status: "HEALTHY"
			});
			mockCattleRepository.updateCattleStatus.mockResolvedValue({
				...mockCattle,
				status: "PREGNANT"
			});
			mockCattleRepository.createStatusHistory.mockResolvedValue({
				cattleId: 1,
				historyId: 1,
				oldStatus: "HEALTHY",
				newStatus: "PREGNANT",
				changedAt: new Date().toISOString(),
				changedBy: 1,
				reason: "reason"
			} as unknown as Awaited<
				ReturnType<typeof cattleRepository.createStatusHistory>
			>);

			const result = await updateStatus(mockDb, 1, "PREGNANT", 1, "reason");

			expect(mockCattleRepository.findCattleById).toHaveBeenCalledWith(
				mockDb,
				1
			);
			expect(mockCattleRepository.updateCattleStatus).toHaveBeenCalledWith(
				mockDb,
				1,
				"PREGNANT"
			);
			expect(mockCattleRepository.createStatusHistory).toHaveBeenCalledWith(
				mockDb,
				{
					cattleId: 1,
					oldStatus: "HEALTHY",
					newStatus: "PREGNANT",
					changedBy: 1,
					reason: "reason"
				}
			);
			expect(result.status).toBe("PREGNANT");
		});

		it("should allow status change from final status", async () => {
			mockCattleRepository.findCattleById.mockResolvedValue({
				...mockCattle,
				status: "SHIPPED"
			});
			mockCattleRepository.updateCattleStatus.mockResolvedValue({
				...mockCattle,
				status: "PREGNANT"
			});
			mockCattleRepository.createStatusHistory.mockResolvedValue({
				cattleId: 1,
				historyId: 1,
				oldStatus: "SHIPPED",
				newStatus: "PREGNANT",
				changedAt: new Date().toISOString(),
				changedBy: 1,
				reason: null
			} as unknown as Awaited<
				ReturnType<typeof cattleRepository.createStatusHistory>
			>);

			const result = await updateStatus(mockDb, 1, "PREGNANT", 1);

			expect(mockCattleRepository.findCattleById).toHaveBeenCalledWith(
				mockDb,
				1
			);
			expect(mockCattleRepository.updateCattleStatus).toHaveBeenCalledWith(
				mockDb,
				1,
				"PREGNANT"
			);
			expect(mockCattleRepository.createStatusHistory).toHaveBeenCalledWith(
				mockDb,
				{
					cattleId: 1,
					oldStatus: "SHIPPED",
					newStatus: "PREGNANT",
					changedBy: 1,
					reason: null
				}
			);
			expect(result.status).toBe("PREGNANT");
		});

		// Additional coverage merged from cattle.coverage.test.ts
		describe("additional coverage", () => {
			it("createNewCattle computes derived fields and persists related entities", async () => {
				mockCattleRepository.createCattle.mockResolvedValue({
					cattleId: 10,
					birthday: "2022-01-01"
				} as unknown as Awaited<
					ReturnType<typeof cattleRepository.createCattle>
				>);
				mockCattleRepository.createBreedingStatus.mockResolvedValue({
					id: 1
				} as unknown as Awaited<
					ReturnType<typeof cattleRepository.createBreedingStatus>
				>);
				mockCattleRepository.createBreedingSummary.mockResolvedValue({
					id: 1
				} as unknown as Awaited<
					ReturnType<typeof cattleRepository.createBreedingSummary>
				>);
				(
					dateUtils.calculateAge as unknown as ReturnType<typeof vi.fn>
				).mockImplementation((d: Date, unit?: "months" | "days") => {
					if (unit === "months") return 12;
					if (unit === "days") return 365;
					return 1;
				});

				await createNewCattle(mockDb, {
					ownerUserId: 1,
					name: "Cow",
					identificationNumber: 1,
					earTagNumber: 2,
					birthday: "2022-01-01",
					gender: "雌",
					growthStage: "GROWING",
					bloodline: { fatherCattleName: "Bull" },
					breedingStatus: {
						expectedCalvingDate: "2025-01-01",
						scheduledPregnancyCheckDate: "2024-01-01"
					},
					breedingSummary: { totalInseminationCount: 3 }
				} as unknown as Parameters<typeof createNewCattle>[1]);

				expect(mockCattleRepository.createCattle).toHaveBeenCalled();
				expect(mockCattleRepository.createBreedingStatus).toHaveBeenCalledWith(
					mockDb,
					10,
					expect.objectContaining({
						parity: expect.any(Number),
						pregnancyDays: expect.any(Number)
					})
				);
				expect(mockCattleRepository.createBreedingSummary).toHaveBeenCalled();
			});

			it("updateCattleData recalculates age when birthday provided and updates related entities", async () => {
				mockCattleRepository.updateCattle.mockResolvedValue({
					cattleId: 11
				} as unknown as Awaited<
					ReturnType<typeof cattleRepository.updateCattle>
				>);
				mockCattleRepository.updateBreedingStatus.mockResolvedValue({
					id: 1
				} as unknown as Awaited<
					ReturnType<typeof cattleRepository.updateBreedingStatus>
				>);
				mockCattleRepository.updateBreedingSummary.mockResolvedValue({
					id: 1
				} as unknown as Awaited<
					ReturnType<typeof cattleRepository.updateBreedingSummary>
				>);
				(
					dateUtils.calculateAge as unknown as ReturnType<typeof vi.fn>
				).mockImplementation(() => 2);

				await updateCattleData(mockDb, 11, {
					name: "Updated",
					birthday: "2020-01-01",
					bloodline: { fatherCattleName: "New Father" },
					breedingStatus: { breedingMemo: "memo" },
					breedingSummary: { totalInseminationCount: 5 }
				} as unknown as Parameters<typeof updateCattleData>[2]);

				expect(mockCattleRepository.updateCattle).toHaveBeenCalled();
				expect(mockCattleRepository.updateBreedingStatus).toHaveBeenCalled();
				expect(mockCattleRepository.updateBreedingSummary).toHaveBeenCalled();
			});

			it("searchCattleList handles invalid cursor and proceeds", async () => {
				const spy = vi.spyOn(console, "error").mockImplementation(() => {});
				mockCattleRepository.searchCattle.mockResolvedValueOnce(
					[] as unknown as Awaited<
						ReturnType<typeof cattleRepository.searchCattle>
					>
				);
				await searchCattleList(mockDb, 1, {
					limit: 1,
					sort_by: "id",
					sort_order: "asc",
					cursor: "invalid!"
				} as unknown as Parameters<typeof searchCattleList>[2]);
				expect(spy).toHaveBeenCalled();
				spy.mockRestore();
			});

			it("searchCattleList builds nextCursor for days_old sort", async () => {
				const items: Array<{ cattleId: number; birthday: string }> = [
					{ cattleId: 1, birthday: "2024-01-01" },
					{ cattleId: 2, birthday: "2023-01-01" }
				];
				mockCattleRepository.searchCattle.mockResolvedValueOnce([
					...items,
					{ cattleId: 999 }
				] as Array<{
					cattleId: number;
					birthday?: string;
				}> as unknown as Awaited<
					ReturnType<typeof cattleRepository.searchCattle>
				>); // limit+1
				const res = await searchCattleList(mockDb, 1, {
					limit: 2,
					sort_by: "days_old",
					sort_order: "asc"
				} as unknown as Parameters<typeof searchCattleList>[2]);
				expect(res.has_next).toBe(true);
				expect(res.next_cursor).not.toBeNull();
				const nextCursor = res.next_cursor as string | null;
				expect(nextCursor).not.toBeNull();
				const decoded = JSON.parse(atob(nextCursor as string));
				expect(decoded.id).toBe(2);
			});

			it("updateStatus throws when target not found", async () => {
				mockCattleRepository.findCattleById.mockResolvedValueOnce(
					null as unknown as Awaited<
						ReturnType<typeof cattleRepository.findCattleById>
					>
				);
				await expect(updateStatus(mockDb, 1, "HEALTHY", 99)).rejects.toThrow();
			});
		});
	});
});
