import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAlertUseCase } from "../../../../src/application/use-cases/alerts/createAlert";
import type { AlertRepository } from "../../../../src/domain/ports/alerts";
import type { Alert, NewAlertProps } from "../../../../src/domain/types/alerts";
import type {
	AlertId,
	AlertMessage,
	DueDate
} from "../../../../src/domain/types/alerts/AlertTypes";
import type { CattleId, UserId } from "../../../../src/shared/brand";
import type { ClockPort } from "../../../../src/shared/ports/clock";
import { ok } from "../../../../src/shared/result";

describe("createAlertUseCase", () => {
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

	it("should create alert successfully", async () => {
		const input: NewAlertProps = {
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			cattleId: 1 as CattleId,
			cattleName: "Test Cow",
			cattleEarTagNumber: 12345,
			dueAt: new Date("2024-12-15T00:00:00Z"),
			message: "Breeding reminder",
			memo: "Test memo",
			ownerUserId: 1 as UserId
		};

		const expectedAlert: Alert = {
			id: 0 as AlertId,
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			status: "active",
			cattleId: 1 as CattleId,
			cattleName: "Test Cow",
			cattleEarTagNumber: 12345,
			dueAt: new Date("2024-12-15T00:00:00Z") as DueDate,
			message: "Breeding reminder" as AlertMessage,
			memo: "Test memo",
			ownerUserId: 1 as UserId,
			createdAt: currentTime,
			updatedAt: currentTime,
			acknowledgedAt: null,
			resolvedAt: null
		};

		mockAlertRepo.create.mockResolvedValue(ok(expectedAlert));

		const useCase = createAlertUseCase({
			alertRepo: mockAlertRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		expect(mockClock.now).toHaveBeenCalledOnce();
		expect(mockAlertRepo.create).toHaveBeenCalledWith({
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			status: "active",
			cattleId: 1,
			cattleName: "Test Cow",
			cattleEarTagNumber: 12345,
			dueAt: new Date("2024-12-15T00:00:00Z"),
			message: "Breeding reminder",
			memo: "Test memo",
			ownerUserId: 1,
			acknowledgedAt: null,
			resolvedAt: null
		});
	});

	it("should handle repository error", async () => {
		const input: NewAlertProps = {
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			cattleId: 1 as CattleId,
			cattleName: "Test Cow",
			cattleEarTagNumber: 12345,
			dueAt: null,
			message: "Breeding reminder",
			memo: null,
			ownerUserId: 1 as UserId
		};

		mockAlertRepo.create.mockRejectedValue(new Error("Database error"));

		const useCase = createAlertUseCase({
			alertRepo: mockAlertRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Failed to create alert");
		}
	});

	it("should handle validation error from domain", async () => {
		const input: NewAlertProps = {
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			cattleId: 1 as CattleId,
			cattleName: "", // Invalid empty name
			cattleEarTagNumber: 12345,
			dueAt: null,
			message: "", // Invalid empty message
			memo: null,
			ownerUserId: 1 as UserId
		};

		const useCase = createAlertUseCase({
			alertRepo: mockAlertRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("ValidationError");
		}
	});
});
