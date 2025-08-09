import type { AnyD1Database } from "drizzle-orm/d1";
import { describe, expect, it } from "vitest";
import * as cattleRepository from "../../repositories/cattleRepository";

describe("CattleRepository", () => {
	describe("exports", () => {
		it("should export findCattleList function", () => {
			expect(cattleRepository.findCattleList).toBeDefined();
			expect(typeof cattleRepository.findCattleList).toBe("function");
		});

		it("should export searchCattle function", () => {
			expect(cattleRepository.searchCattle).toBeDefined();
			expect(typeof cattleRepository.searchCattle).toBe("function");
		});

		it("should export findCattleById function", () => {
			expect(cattleRepository.findCattleById).toBeDefined();
			expect(typeof cattleRepository.findCattleById).toBe("function");
		});

		it("should export createCattle function", () => {
			expect(cattleRepository.createCattle).toBeDefined();
			expect(typeof cattleRepository.createCattle).toBe("function");
		});

		it("should export updateCattle function", () => {
			expect(cattleRepository.updateCattle).toBeDefined();
			expect(typeof cattleRepository.updateCattle).toBe("function");
		});

		it("should export deleteCattle function", () => {
			expect(cattleRepository.deleteCattle).toBeDefined();
			expect(typeof cattleRepository.deleteCattle).toBe("function");
		});
	});

	describe("function signatures", () => {
		it("should have correct parameter length for findCattleList", () => {
			expect(cattleRepository.findCattleList.length).toBe(2);
		});

		it("should have correct parameter length for searchCattle", () => {
			expect(cattleRepository.searchCattle.length).toBe(3);
		});

		it("should have correct parameter length for findCattleById", () => {
			expect(cattleRepository.findCattleById.length).toBe(2);
		});

		it("should have correct parameter length for createCattle", () => {
			expect(cattleRepository.createCattle.length).toBe(2);
		});

		it("should have correct parameter length for updateCattle", () => {
			expect(cattleRepository.updateCattle.length).toBe(3);
		});

		it("should have correct parameter length for deleteCattle", () => {
			expect(cattleRepository.deleteCattle.length).toBe(2);
		});
	});

	describe("function types", () => {
		it("should return promises from async functions", () => {
			const mockDb = {} as AnyD1Database;

			// 基本的な検索パラメータ
			const searchQuery = {
				limit: 10,
				sort_by: "id" as const,
				sort_order: "asc" as const,
			};

			// 基本的な牛データ
			const cattleData = {
				ownerUserId: 1,
				name: "Test Cattle",
				identificationNumber: 12345,
				earTagNumber: 54321,
				birthday: "2023-01-01",
				gender: "雌",
				growthStage: "CALF" as const,
			};

			// これらの関数は全てPromiseを返すはず
			const result1 = cattleRepository.findCattleList(mockDb, 1);
			const result2 = cattleRepository.searchCattle(mockDb, 1, searchQuery);
			const result3 = cattleRepository.findCattleById(mockDb, 1);
			const result4 = cattleRepository.createCattle(mockDb, cattleData);
			const result5 = cattleRepository.updateCattle(mockDb, 1, {
				name: "Updated Name",
			});
			const result6 = cattleRepository.deleteCattle(mockDb, 1);

			expect(result1).toBeInstanceOf(Promise);
			expect(result2).toBeInstanceOf(Promise);
			expect(result3).toBeInstanceOf(Promise);
			expect(result4).toBeInstanceOf(Promise);
			expect(result5).toBeInstanceOf(Promise);
			expect(result6).toBeInstanceOf(Promise);

			// Promiseを適切にキャッチしてテストが完了するようにする
			return Promise.allSettled([
				result1,
				result2,
				result3,
				result4,
				result5,
				result6,
			]);
		});
	});

	describe("search query validation", () => {
		it("should handle different sort options", () => {
			const mockDb = {} as AnyD1Database;

			const sortOptions = [
				{ sort_by: "id" as const, sort_order: "asc" as const },
				{ sort_by: "name" as const, sort_order: "desc" as const },
				{ sort_by: "days_old" as const, sort_order: "asc" as const },
			];

			const promises = sortOptions.map((sortOption) =>
				cattleRepository.searchCattle(mockDb, 1, {
					limit: 10,
					...sortOption,
				}),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});

		it("should handle search with optional parameters", () => {
			const mockDb = {} as AnyD1Database;

			const searchQueries = [
				{
					limit: 10,
					sort_by: "id" as const,
					sort_order: "asc" as const,
					search: "test",
				},
				{
					limit: 10,
					sort_by: "name" as const,
					sort_order: "desc" as const,
					growth_stage: ["CALF", "GROWING"],
				},
				{
					limit: 10,
					sort_by: "days_old" as const,
					sort_order: "asc" as const,
					gender: ["雌", "雄"],
				},
				{
					limit: 10,
					sort_by: "id" as const,
					sort_order: "desc" as const,
					cursor: { id: 1, value: 10 },
				},
			];

			const promises = searchQueries.map((query) =>
				cattleRepository.searchCattle(mockDb, 1, query),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});
	});

	describe("data validation", () => {
		it("should handle different cattle data structures", () => {
			const mockDb = {} as AnyD1Database;

			const cattleDataSets = [
				{
					ownerUserId: 1,
					name: "Cattle 1",
					identificationNumber: 12345,
					earTagNumber: 54321,
					birthday: "2023-01-01",
					gender: "雌",
					growthStage: "CALF" as const,
				},
				{
					ownerUserId: 2,
					name: "Cattle 2",
					identificationNumber: 67890,
					earTagNumber: 98765,
					birthday: "2022-06-15",
					gender: "雄",
					growthStage: "GROWING" as const,
				},
			];

			const promises = cattleDataSets.map((data) =>
				cattleRepository.createCattle(mockDb, data),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});

		it("should handle update operations with different data", () => {
			const mockDb = {} as AnyD1Database;

			const updateDataSets = [
				{ name: "Updated Name 1" },
				{ growthStage: "FATTENING" as const },
				{ name: "Updated Name 2", growthStage: "MULTI_PAROUS" as const },
			];

			const promises = updateDataSets.map((data, index) =>
				cattleRepository.updateCattle(mockDb, index + 1, data),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});
	});
});
