import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchAlertsUseCase } from "../../../../src/application/use-cases/alerts/searchAlerts";
import type {
	AlertSearchCriteria,
	AlertSearchResult
} from "../../../../src/domain/types/alerts";
import type { UserId } from "../../../../src/shared/brand";
import { ok } from "../../../../src/shared/result";

describe("searchAlertsUseCase", () => {
	let mockAlertRepo: {
		create: ReturnType<typeof vi.fn>;
		findById: ReturnType<typeof vi.fn>;
		listByCattleId: ReturnType<typeof vi.fn>;
		search: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		findActiveAlerts: ReturnType<typeof vi.fn>;
		findBySeverity: ReturnType<typeof vi.fn>;
		findByType: ReturnType<typeof vi.fn>;
		findDueSoon: ReturnType<typeof vi.fn>;
		findOverdue: ReturnType<typeof vi.fn>;
		findByDateRange: ReturnType<typeof vi.fn>;
		getAlertStats: ReturnType<typeof vi.fn>;
		batchUpdateStatus: ReturnType<typeof vi.fn>;
		batchDelete: ReturnType<typeof vi.fn>;
		findOpenDaysOver60NoAI: ReturnType<typeof vi.fn>;
		findCalvingWithin60: ReturnType<typeof vi.fn>;
		findCalvingOverdue: ReturnType<typeof vi.fn>;
		findEstrusOver20NotPregnant: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockAlertRepo = {
			create: vi.fn(),
			findById: vi.fn(),
			listByCattleId: vi.fn(),
			search: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findActiveAlerts: vi.fn(),
			findBySeverity: vi.fn(),
			findByType: vi.fn(),
			findDueSoon: vi.fn(),
			findOverdue: vi.fn(),
			findByDateRange: vi.fn(),
			getAlertStats: vi.fn(),
			batchUpdateStatus: vi.fn(),
			batchDelete: vi.fn(),
			findOpenDaysOver60NoAI: vi.fn(),
			findCalvingWithin60: vi.fn(),
			findCalvingOverdue: vi.fn(),
			findEstrusOver20NotPregnant: vi.fn()
		};
	});

	it("should search alerts successfully", async () => {
		const searchCriteria: AlertSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 10,
			status: "active",
			severity: "high"
		};

		const mockSearchResult: AlertSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockAlertRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockAlertRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 10 // 正規化されたlimit
		});
	});

	it("should normalize limit to minimum value", async () => {
		const searchCriteria: AlertSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 0 // 最小値未満
		};

		const mockSearchResult: AlertSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockAlertRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockAlertRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 20 // デフォルト値（最小値1未満の場合は20が使用される）
		});
	});

	it("should normalize limit to maximum value", async () => {
		const searchCriteria: AlertSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 150 // 最大値超過
		};

		const mockSearchResult: AlertSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockAlertRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockAlertRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 100 // 正規化されたlimit
		});
	});

	it("should use default limit when not specified", async () => {
		const searchCriteria: AlertSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 20
			// limit が指定されていない場合はデフォルト値20が使用される
		};

		const mockSearchResult: AlertSearchResult = {
			results: [],
			nextCursor: null,
			hasNext: false
		};

		mockAlertRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = searchAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(true);
		expect(mockAlertRepo.search).toHaveBeenCalledWith({
			...searchCriteria,
			limit: 20 // デフォルト値
		});
	});

	it("should handle repository error", async () => {
		const searchCriteria: AlertSearchCriteria = {
			ownerUserId: 1 as UserId,
			limit: 10
		};

		mockAlertRepo.search.mockRejectedValue(new Error("Database error"));

		const useCase = searchAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase(searchCriteria);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to search alerts");
		}
	});
});
