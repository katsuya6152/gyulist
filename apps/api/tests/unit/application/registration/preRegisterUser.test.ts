import { beforeEach, describe, expect, it, vi } from "vitest";
import { preRegisterUserUseCase } from "../../../../src/application/use-cases/registration/preRegisterUser";
import { err, ok } from "../../../../src/shared/result";

describe("preRegisterUserUseCase", () => {
	let mockRegistrationRepo: {
		findByEmail: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		createEmailLog: ReturnType<typeof vi.fn>;
		findById: ReturnType<typeof vi.fn>;
		search: ReturnType<typeof vi.fn>;
		updateStatus: ReturnType<typeof vi.fn>;
		updateReferralSource: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		findEmailLogsByEmail: ReturnType<typeof vi.fn>;
	};
	let mockEmailService: {
		sendCompletionEmail: ReturnType<typeof vi.fn>;
		sendVerificationEmail: ReturnType<typeof vi.fn>;
		sendReminderEmail: ReturnType<typeof vi.fn>;
	};
	let mockTurnstileService: {
		verify: ReturnType<typeof vi.fn>;
	};
	let mockIdGenerator: {
		uuid: ReturnType<typeof vi.fn>;
		next: ReturnType<typeof vi.fn>;
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
		mockIdGenerator = {
			uuid: vi.fn().mockReturnValue("test-uuid-123"),
			next: vi.fn().mockReturnValue(1)
		};
		mockTurnstileService = {
			verify: vi.fn()
		};
		mockEmailService = {
			sendCompletionEmail: vi.fn(),
			sendVerificationEmail: vi.fn(),
			sendReminderEmail: vi.fn()
		};
		mockRegistrationRepo = {
			findByEmail: vi.fn(),
			create: vi.fn(),
			createEmailLog: vi.fn(),
			findById: vi.fn(),
			search: vi.fn(),
			updateStatus: vi.fn(),
			updateReferralSource: vi.fn(),
			delete: vi.fn(),
			findEmailLogsByEmail: vi.fn()
		};
	});

	it("should pre-register user successfully", async () => {
		const input = {
			email: "test@example.com",
			referralSource: "website",
			turnstileToken: "valid-token",
			locale: "ja"
		};

		mockTurnstileService.verify.mockResolvedValue(ok(true));
		mockRegistrationRepo.findByEmail.mockResolvedValue(ok(null));
		mockRegistrationRepo.create.mockResolvedValue(ok({}));
		mockEmailService.sendCompletionEmail.mockResolvedValue(ok("resend-id-123"));
		mockRegistrationRepo.createEmailLog.mockResolvedValue(ok({}));

		const useCase = preRegisterUserUseCase({
			registrationRepo: mockRegistrationRepo,
			emailService: mockEmailService,
			turnstileService: mockTurnstileService,
			idGenerator: mockIdGenerator,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.status).toBe(200);
			expect(result.value.body.ok).toBe(true);
		}
		expect(mockTurnstileService.verify).toHaveBeenCalledWith("valid-token");
		expect(mockRegistrationRepo.findByEmail).toHaveBeenCalledWith(
			"test@example.com"
		);
		expect(mockRegistrationRepo.create).toHaveBeenCalled();
		expect(mockEmailService.sendCompletionEmail).toHaveBeenCalledWith(
			"test@example.com",
			"新規ユーザー"
		);
	});

	it("should return already registered when user exists", async () => {
		const input = {
			email: "existing@example.com",
			turnstileToken: "valid-token"
		};

		mockTurnstileService.verify.mockResolvedValue(ok(true));
		mockRegistrationRepo.findByEmail.mockResolvedValue(
			ok({ email: "existing@example.com" } as { email: string })
		);

		const useCase = preRegisterUserUseCase({
			registrationRepo: mockRegistrationRepo,
			emailService: mockEmailService,
			turnstileService: mockTurnstileService,
			idGenerator: mockIdGenerator,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.status).toBe(200);
			expect(result.value.body.alreadyRegistered).toBe(true);
		}
		expect(mockRegistrationRepo.create).not.toHaveBeenCalled();
		expect(mockEmailService.sendCompletionEmail).not.toHaveBeenCalled();
	});

	it("should handle turnstile verification failure", async () => {
		const input = {
			email: "test@example.com",
			turnstileToken: "invalid-token"
		};

		mockTurnstileService.verify.mockResolvedValue(ok(false));

		const useCase = preRegisterUserUseCase({
			registrationRepo: mockRegistrationRepo,
			emailService: mockEmailService,
			turnstileService: mockTurnstileService,
			idGenerator: mockIdGenerator,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("TurnstileError");
			expect(result.error.message).toBe("Turnstile検証に失敗しました");
		}
		expect(mockRegistrationRepo.findByEmail).not.toHaveBeenCalled();
	});

	it("should handle turnstile service error", async () => {
		const input = {
			email: "test@example.com",
			turnstileToken: "valid-token"
		};

		mockTurnstileService.verify.mockResolvedValue(
			err({
				type: "TurnstileError",
				message: "Service unavailable",
				token: "valid-token"
			})
		);

		const useCase = preRegisterUserUseCase({
			registrationRepo: mockRegistrationRepo,
			emailService: mockEmailService,
			turnstileService: mockTurnstileService,
			idGenerator: mockIdGenerator,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("TurnstileError");
			expect(result.error.message).toBe("Service unavailable");
		}
	});

	it("should handle email service failure", async () => {
		const input = {
			email: "test@example.com",
			turnstileToken: "valid-token"
		};

		mockTurnstileService.verify.mockResolvedValue(ok(true));
		mockRegistrationRepo.findByEmail.mockResolvedValue(ok(null));
		mockRegistrationRepo.create.mockResolvedValue(ok({}));
		mockEmailService.sendCompletionEmail.mockResolvedValue(
			err({
				type: "EmailError",
				message: "Email service failed"
			})
		);
		mockRegistrationRepo.createEmailLog.mockResolvedValue(ok({}));

		const useCase = preRegisterUserUseCase({
			registrationRepo: mockRegistrationRepo,
			emailService: mockEmailService,
			turnstileService: mockTurnstileService,
			idGenerator: mockIdGenerator,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.status).toBe(502);
			expect(result.value.body.code).toBe("RESEND_FAILED");
			expect(result.value.body.message).toBe("メール送信に失敗しました");
		}
		expect(mockRegistrationRepo.createEmailLog).toHaveBeenCalled();
	});

	it("should handle repository error", async () => {
		const input = {
			email: "test@example.com",
			turnstileToken: "valid-token"
		};

		mockTurnstileService.verify.mockResolvedValue(ok(true));
		mockRegistrationRepo.findByEmail.mockRejectedValue(
			new Error("Database error")
		);

		const useCase = preRegisterUserUseCase({
			registrationRepo: mockRegistrationRepo,
			emailService: mockEmailService,
			turnstileService: mockTurnstileService,
			idGenerator: mockIdGenerator,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("事前登録の処理に失敗しました");
		}
	});

	it("should use default locale when not specified", async () => {
		const input = {
			email: "test@example.com",
			turnstileToken: "valid-token"
		};

		mockTurnstileService.verify.mockResolvedValue(ok(true));
		mockRegistrationRepo.findByEmail.mockResolvedValue(ok(null));
		mockRegistrationRepo.create.mockResolvedValue(ok({}));
		mockEmailService.sendCompletionEmail.mockResolvedValue(ok("resend-id-123"));
		mockRegistrationRepo.createEmailLog.mockResolvedValue(ok({}));

		const useCase = preRegisterUserUseCase({
			registrationRepo: mockRegistrationRepo,
			emailService: mockEmailService,
			turnstileService: mockTurnstileService,
			idGenerator: mockIdGenerator,
			clock: mockClock
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		expect(mockRegistrationRepo.create).toHaveBeenCalledWith(
			expect.objectContaining({
				locale: "ja"
			})
		);
	});
});
