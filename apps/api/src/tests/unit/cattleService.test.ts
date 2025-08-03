import { beforeEach, describe, expect, it, vi } from "vitest";
import * as cattleRepository from "../../repositories/cattleRepository";
import {
	createNewCattle,
	deleteCattleData,
	getCattleById,
	searchCattleList,
	updateCattleData,
} from "../../services/cattleService";
import { createMockDB, mockCattle } from "../mocks/database";

// Mock the repository module
vi.mock("../../repositories/cattleRepository");

const mockCattleRepository = vi.mocked(cattleRepository);

describe("CattleService", () => {
	const mockDB = createMockDB();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getCattleById", () => {
		it("should return cattle when found", async () => {
			// Arrange
			mockCattleRepository.findCattleById.mockResolvedValue(mockCattle);

			// Act
			const result = await getCattleById(mockDB, 1);

			// Assert
			expect(result).toEqual(mockCattle);
			expect(mockCattleRepository.findCattleById).toHaveBeenCalledWith(
				mockDB,
				1,
			);
		});

		it("should return null when cattle not found", async () => {
			// Arrange
			mockCattleRepository.findCattleById.mockResolvedValue(null);

			// Act
			const result = await getCattleById(mockDB, 999);

			// Assert
			expect(result).toBeNull();
			expect(mockCattleRepository.findCattleById).toHaveBeenCalledWith(
				mockDB,
				999,
			);
		});
	});

	describe("createNewCattle", () => {
		const createInput = {
			ownerUserId: 1,
			identificationNumber: 1001,
			earTagNumber: 1234,
			name: "テスト牛",
			gender: "オス",
			birthday: "2023-01-01",
			growthStage: "CALF" as const,
			breed: null,
			notes: null,
			bloodline: {
				fatherCattleName: "父牛",
				motherFatherCattleName: "母方祖父牛",
			},
			breedingStatus: {
				expectedCalvingDate: "2024-01-01",
				scheduledPregnancyCheckDate: "2023-06-01",
			},
		};

		it("should create cattle with all related data", async () => {
			// Arrange
			mockCattleRepository.createCattle.mockResolvedValue(mockCattle);
			// @ts-expect-error: Repository can return null for not found
			mockCattleRepository.createBloodline.mockResolvedValue(undefined);
			// @ts-expect-error: Repository can return null for not found
			mockCattleRepository.createBreedingStatus.mockResolvedValue(undefined);
			// @ts-expect-error: Repository can return null for not found
			mockCattleRepository.createBreedingSummary.mockResolvedValue(undefined);

			// Act
			const result = await createNewCattle(mockDB, createInput);

			// Assert
			expect(result).toEqual(mockCattle);
			expect(mockCattleRepository.createCattle).toHaveBeenCalledWith(
				mockDB,
				expect.objectContaining({
					...createInput,
					age: expect.any(Number),
					monthsOld: expect.any(Number),
					daysOld: expect.any(Number),
				}),
			);
			expect(mockCattleRepository.createBloodline).toHaveBeenCalledWith(
				mockDB,
				mockCattle.cattleId,
				createInput.bloodline,
			);
			expect(mockCattleRepository.createBreedingStatus).toHaveBeenCalled();
			expect(mockCattleRepository.createBreedingSummary).toHaveBeenCalled();
		});
	});

	describe("updateCattleData", () => {
		const updateInput = {
			name: "更新された牛の名前",
			bloodline: {
				fatherCattleName: "更新された父牛",
			},
			breedingStatus: {
				breedingMemo: "更新されたメモ",
			},
			breedingSummary: {
				totalInseminationCount: 5,
			},
		};

		it("should update cattle with all related data", async () => {
			// Arrange
			mockCattleRepository.updateCattle.mockResolvedValue({
				...mockCattle,
				name: updateInput.name,
			});
			// @ts-expect-error: Repository can return null for not found
			mockCattleRepository.updateBloodline.mockResolvedValue(undefined);
			// @ts-expect-error: Repository can return null for not found
			mockCattleRepository.updateBreedingStatus.mockResolvedValue(undefined);
			// @ts-expect-error: Repository can return null for not found
			mockCattleRepository.updateBreedingSummary.mockResolvedValue(undefined);

			// Act
			const result = await updateCattleData(mockDB, 1, updateInput);

			// Assert
			expect(result.name).toBe(updateInput.name);
			expect(mockCattleRepository.updateCattle).toHaveBeenCalledWith(
				mockDB,
				1,
				expect.objectContaining({ name: updateInput.name }),
			);
			expect(mockCattleRepository.updateBloodline).toHaveBeenCalledWith(
				mockDB,
				1,
				updateInput.bloodline,
			);
			expect(mockCattleRepository.updateBreedingStatus).toHaveBeenCalledWith(
				mockDB,
				1,
				expect.objectContaining({
					breedingMemo: updateInput.breedingStatus.breedingMemo,
				}),
			);
			expect(mockCattleRepository.updateBreedingSummary).toHaveBeenCalledWith(
				mockDB,
				1,
				updateInput.breedingSummary,
			);
		});
	});

	describe("deleteCattleData", () => {
		it("should delete cattle", async () => {
			// Arrange
			mockCattleRepository.deleteCattle.mockResolvedValue(undefined);

			// Act
			await deleteCattleData(mockDB, 1);

			// Assert
			expect(mockCattleRepository.deleteCattle).toHaveBeenCalledWith(mockDB, 1);
		});
	});

	describe("searchCattleList", () => {
		const searchQuery = {
			limit: 20,
			sort_by: "id" as const,
			sort_order: "desc" as const,
		};

		it("should return search results with pagination", async () => {
			// Arrange
			const mockResults = [mockCattle, { ...mockCattle, cattleId: 2 }];
			mockCattleRepository.searchCattle.mockResolvedValue(mockResults);

			// Act
			const result = await searchCattleList(mockDB, 1, searchQuery);

			// Assert
			expect(result).toEqual({
				results: mockResults,
				next_cursor: null,
				has_next: false,
			});
			expect(mockCattleRepository.searchCattle).toHaveBeenCalledWith(
				mockDB,
				1,
				expect.objectContaining(searchQuery),
			);
		});

		it("should handle cursor-based pagination", async () => {
			// Arrange
			const mockResults = Array(21)
				.fill(null)
				.map((_, i) => ({
					...mockCattle,
					cattleId: i + 1,
				}));
			mockCattleRepository.searchCattle.mockResolvedValue(mockResults);

			// Act
			const result = await searchCattleList(mockDB, 1, searchQuery);

			// Assert
			expect(result.results).toHaveLength(20);
			expect(result.has_next).toBe(true);
			expect(result.next_cursor).toBeTruthy();
		});

		it("should handle invalid cursor gracefully", async () => {
			// Arrange
			const queryWithInvalidCursor = {
				...searchQuery,
				cursor: "invalid-cursor",
			};
			mockCattleRepository.searchCattle.mockResolvedValue([mockCattle]);

			// Act
			const result = await searchCattleList(mockDB, 1, queryWithInvalidCursor);

			// Assert
			expect(result.results).toEqual([mockCattle]);
			expect(result.next_cursor).toBeNull();
			expect(result.has_next).toBe(false);
		});
	});
});
