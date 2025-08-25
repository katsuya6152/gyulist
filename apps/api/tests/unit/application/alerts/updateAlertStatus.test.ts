import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAlertStatusUseCase } from "../../../../src/application/use-cases/alerts/updateAlertStatus";
import type { Alert, AlertStatus } from "../../../../src/domain/types/alerts";
import type {
	AlertMessage,
	AlertId as DomainAlertId,
	DueDate
} from "../../../../src/domain/types/alerts/AlertTypes";
import type { AlertId, CattleId, UserId } from "../../../../src/shared/brand";
import { ok } from "../../../../src/shared/result";

describe("updateAlertStatusUseCase", () => {
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
	let mockClock: {
		now: ReturnType<typeof vi.fn>;
	};
	let currentTime: Date;

	beforeEach(() => {
		currentTime = new Date("2024-01-01T00:00:00Z");
		mockClock = {
			now: vi.fn().mockReturnValue(currentTime)
		};
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

	it("should update alert status to acknowledged successfully", async () => {
		const alertId = "1" as AlertId;
		const userId = 1 as UserId;
		const newStatus: AlertStatus = "acknowledged";

		const existingAlert: Alert = {
			id: alertId as unknown as DomainAlertId,
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "high",
			status: "active",
			cattleId: 1 as unknown as CattleId,
			cattleName: "Test Cow",
			cattleEarTagNumber: 12345,
			dueAt: null,
			message: "Test alert" as unknown as AlertMessage,
			memo: null,
			ownerUserId: userId,
			createdAt: currentTime,
			updatedAt: currentTime,
			acknowledgedAt: null,
			resolvedAt: null
		};

		const updatedAlert: Alert = {
			...existingAlert,
			status: newStatus,
			acknowledgedAt: currentTime,
			updatedAt: currentTime
		};

		mockAlertRepo.findById.mockResolvedValue(ok(existingAlert));
		mockAlertRepo.update.mockResolvedValue(ok(updatedAlert));

		const useCase = updateAlertStatusUseCase({
			alertRepo: mockAlertRepo,
			clock: mockClock
		});

		const result = await useCase({
			alertId,
			newStatus,
			requestingUserId: userId
		});

		expect(result.ok).toBe(true);
		expect(mockAlertRepo.findById).toHaveBeenCalledWith(alertId, userId);
		expect(mockAlertRepo.update).toHaveBeenCalledWith(
			alertId,
			{
				status: newStatus,
				acknowledgedAt: currentTime,
				resolvedAt: null,
				updatedAt: currentTime
			},
			userId
		);
	});

	it("should update alert status to resolved successfully", async () => {
		const alertId = "1" as AlertId;
		const userId = 1 as UserId;
		const newStatus: AlertStatus = "resolved";

		const existingAlert: Alert = {
			id: alertId as unknown as DomainAlertId,
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "high",
			status: "acknowledged",
			cattleId: 1 as unknown as CattleId,
			cattleName: "Test Cow",
			cattleEarTagNumber: 12345,
			dueAt: null,
			message: "Test alert" as unknown as AlertMessage,
			memo: null,
			ownerUserId: userId,
			createdAt: currentTime,
			updatedAt: currentTime,
			acknowledgedAt: currentTime,
			resolvedAt: null
		};

		const updatedAlert: Alert = {
			...existingAlert,
			status: newStatus,
			resolvedAt: currentTime,
			updatedAt: currentTime
		};

		mockAlertRepo.findById.mockResolvedValue(ok(existingAlert));
		mockAlertRepo.update.mockResolvedValue(ok(updatedAlert));

		const useCase = updateAlertStatusUseCase({
			alertRepo: mockAlertRepo,
			clock: mockClock
		});

		const result = await useCase({
			alertId,
			newStatus,
			requestingUserId: userId
		});

		expect(result.ok).toBe(true);
		expect(mockAlertRepo.update).toHaveBeenCalledWith(
			alertId,
			{
				status: newStatus,
				acknowledgedAt: currentTime,
				resolvedAt: currentTime,
				updatedAt: currentTime
			},
			userId
		);
	});

	it("should return error when alert not found", async () => {
		const alertId = "999" as AlertId;
		const userId = 1 as UserId;
		const newStatus: AlertStatus = "acknowledged";

		mockAlertRepo.findById.mockResolvedValue(ok(null));

		const useCase = updateAlertStatusUseCase({
			alertRepo: mockAlertRepo,
			clock: mockClock
		});

		const result = await useCase({
			alertId,
			newStatus,
			requestingUserId: userId
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("AlertNotFoundError");
			expect(result.error.message).toBe("Alert not found");
		}
	});

	it("should handle repository error", async () => {
		const alertId = "1" as AlertId;
		const userId = 1 as UserId;
		const newStatus: AlertStatus = "acknowledged";

		mockAlertRepo.findById.mockRejectedValue(new Error("Database error"));

		const useCase = updateAlertStatusUseCase({
			alertRepo: mockAlertRepo,
			clock: mockClock
		});

		const result = await useCase({
			alertId,
			newStatus,
			requestingUserId: userId
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to update alert status");
		}
	});
});
