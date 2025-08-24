import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAlertsUseCase } from "../../../../src/application/use-cases/alerts/getAlerts";
import type { AlertRepository } from "../../../../src/domain/ports/alerts";
import type { Alert } from "../../../../src/domain/types/alerts";
import type {
	AlertId,
	AlertMessage,
	DueDate
} from "../../../../src/domain/types/alerts/AlertTypes";
import type { CattleId, UserId } from "../../../../src/shared/brand";
import { ok } from "../../../../src/shared/result";

describe("getAlertsUseCase", () => {
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

	it("should get alerts successfully", async () => {
		const currentTime = new Date("2024-01-01T00:00:00Z");
		const dueDate = new Date("2024-01-15T00:00:00Z");

		const mockAlerts: Alert[] = [
			{
				id: 1 as AlertId,
				type: "OPEN_DAYS_OVER60_NO_AI",
				severity: "high",
				status: "active",
				cattleId: 1 as CattleId,
				cattleName: "Test Cow 1",
				cattleEarTagNumber: 12345,
				dueAt: dueDate as DueDate,
				message: "High priority alert" as AlertMessage,
				memo: "Test memo",
				ownerUserId: 1 as UserId,
				createdAt: currentTime,
				updatedAt: currentTime,
				acknowledgedAt: null,
				resolvedAt: null
			},
			{
				id: 2 as AlertId,
				type: "CALVING_WITHIN_60",
				severity: "medium",
				status: "active",
				cattleId: 2 as CattleId,
				cattleName: "Test Cow 2",
				cattleEarTagNumber: 12346,
				dueAt: null,
				message: "Medium priority alert" as AlertMessage,
				memo: null,
				ownerUserId: 1 as UserId,
				createdAt: currentTime,
				updatedAt: currentTime,
				acknowledgedAt: null,
				resolvedAt: null
			}
		];

		mockAlertRepo.findActiveAlerts.mockResolvedValue(ok(mockAlerts));

		const useCase = getAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase({
			ownerUserId: 1 as UserId,
			limit: 10
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.results).toHaveLength(2);
			expect(result.value.total).toBe(2);
			expect(result.value.summary.high).toBe(1);
			expect(result.value.summary.medium).toBe(1);
			expect(result.value.summary.low).toBe(0);
			expect(result.value.summary.active).toBe(2);
		}
		expect(mockAlertRepo.findActiveAlerts).toHaveBeenCalledWith(1, 10);
	});

	it("should handle repository error", async () => {
		mockAlertRepo.findActiveAlerts.mockRejectedValue(
			new Error("Database error")
		);

		const useCase = getAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase({
			ownerUserId: 1 as UserId
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to get alerts");
		}
	});

	it("should return empty results when no alerts found", async () => {
		mockAlertRepo.findActiveAlerts.mockResolvedValue(ok([]));

		const useCase = getAlertsUseCase({
			alertRepo: mockAlertRepo
		});

		const result = await useCase({
			ownerUserId: 1 as UserId
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.results).toHaveLength(0);
			expect(result.value.total).toBe(0);
			expect(result.value.summary.high).toBe(0);
			expect(result.value.summary.medium).toBe(0);
			expect(result.value.summary.low).toBe(0);
		}
	});
});
