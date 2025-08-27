import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateRegistrationStatusUseCase } from "../../../../src/application/use-cases/registration/updateRegistrationStatus";
import type { RegistrationRepository } from "../../../../src/domain/ports/registration";
import type {
	Registration,
	RegistrationId,
	RegistrationStatus,
	Timestamp
} from "../../../../src/domain/types/registration";
import type { ClockPort } from "../../../../src/shared/ports/clock";
import { err, ok } from "../../../../src/shared/result";

describe("updateRegistrationStatusUseCase", () => {
	let mockRegistrationRepo: {
		findById: ReturnType<typeof vi.fn>;
		updateStatus: ReturnType<typeof vi.fn>;
	};
	let mockClock: {
		now: ReturnType<typeof vi.fn>;
	};
	let currentTime: Date;
	let mockRegistration: Registration;

	beforeEach(() => {
		currentTime = new Date("2024-01-01T00:00:00Z");
		mockClock = {
			now: vi.fn().mockReturnValue(currentTime)
		};
		mockRegistration = {
			id: "reg-123" as RegistrationId,
			email: "test@example.com",
			status: "pending" as RegistrationStatus,
			referralSource: null,
			locale: "ja",
			createdAt: 1704067200 as Timestamp,
			updatedAt: 1704067200 as Timestamp
		} as Registration;
		mockRegistrationRepo = {
			findById: vi.fn(),
			updateStatus: vi.fn()
		};
	});

	it("should update registration status successfully", async () => {
		const input = {
			registrationId: "reg-123" as RegistrationId,
			newStatus: "confirmed" as RegistrationStatus,
			reason: "Manual confirmation"
		};

		mockRegistrationRepo.findById.mockResolvedValue(ok(mockRegistration));
		mockRegistrationRepo.updateStatus.mockResolvedValue(
			ok({
				...mockRegistration,
				status: "confirmed" as RegistrationStatus,
				updatedAt: 1704067200 as Timestamp
			})
		);

		const useCase = updateRegistrationStatusUseCase({
			registrationRepo: mockRegistrationRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.registration.status).toBe("confirmed");
		}
		expect(mockRegistrationRepo.findById).toHaveBeenCalledWith("reg-123");
		expect(mockRegistrationRepo.updateStatus).toHaveBeenCalledWith(
			"reg-123",
			"confirmed",
			"Manual confirmation"
		);
	});

	it("should handle registration not found", async () => {
		const input = {
			registrationId: "reg-456" as RegistrationId,
			newStatus: "approved" as RegistrationStatus
		};

		mockRegistrationRepo.findById.mockResolvedValue(ok(null));

		const useCase = updateRegistrationStatusUseCase({
			registrationRepo: mockRegistrationRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("NotFoundError");
			expect(result.error.message).toBe("登録が見つかりません");
			expect(result.error.id).toBe("reg-456");
		}
		expect(mockRegistrationRepo.updateStatus).not.toHaveBeenCalled();
	});

	it("should handle repository find error", async () => {
		const input = {
			registrationId: "reg-123" as RegistrationId,
			newStatus: "approved" as RegistrationStatus
		};

		mockRegistrationRepo.findById.mockResolvedValue(
			err({
				type: "InfraError",
				message: "Database error"
			})
		);

		const useCase = updateRegistrationStatusUseCase({
			registrationRepo: mockRegistrationRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Database error");
		}
		expect(mockRegistrationRepo.updateStatus).not.toHaveBeenCalled();
	});

	it("should handle repository update error", async () => {
		const input = {
			registrationId: "reg-123" as RegistrationId,
			newStatus: "approved" as RegistrationStatus
		};

		mockRegistrationRepo.findById.mockResolvedValue(ok(mockRegistration));
		mockRegistrationRepo.updateStatus.mockResolvedValue(
			err({
				type: "StatusTransitionError",
				message:
					"ステータス pending から approved への変更は許可されていません",
				currentStatus: "pending",
				newStatus: "approved"
			})
		);

		const useCase = updateRegistrationStatusUseCase({
			registrationRepo: mockRegistrationRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("StatusTransitionError");
			expect(result.error.message).toBe(
				"ステータス pending から approved への変更は許可されていません"
			);
		}
		expect(mockRegistrationRepo.findById).toHaveBeenCalledWith("reg-123");
	});

	it("should update status without reason", async () => {
		const input = {
			registrationId: "reg-123" as RegistrationId,
			newStatus: "cancelled" as RegistrationStatus
		};

		mockRegistrationRepo.findById.mockResolvedValue(ok(mockRegistration));
		mockRegistrationRepo.updateStatus.mockResolvedValue(
			ok({
				...mockRegistration,
				status: "cancelled" as RegistrationStatus,
				updatedAt: 1704067200 as Timestamp
			})
		);

		const useCase = updateRegistrationStatusUseCase({
			registrationRepo: mockRegistrationRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.registration.status).toBe("cancelled");
		}
		expect(mockRegistrationRepo.updateStatus).toHaveBeenCalledWith(
			"reg-123",
			"cancelled",
			undefined
		);
	});

	it("should handle domain validation error", async () => {
		const input = {
			registrationId: "reg-123" as RegistrationId,
			newStatus: "invalid-status" as RegistrationStatus
		};

		mockRegistrationRepo.findById.mockResolvedValue(ok(mockRegistration));

		const useCase = updateRegistrationStatusUseCase({
			registrationRepo: mockRegistrationRepo,
			clock: mockClock
		});

		const result = await useCase(input);

		// ドメイン関数がエラーを返す場合のテスト
		// 実際のドメイン関数の動作に依存する
		expect(mockRegistrationRepo.findById).toHaveBeenCalledWith("reg-123");
		expect(mockRegistrationRepo.updateStatus).not.toHaveBeenCalled();
	});
});
