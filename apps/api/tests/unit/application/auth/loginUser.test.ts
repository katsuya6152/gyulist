/**
 * Login User Use Case Unit Tests - New Architecture
 *
 * 認証ユースケースのloginUser関数のユニットテスト
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginUserUseCase } from "../../../../src/application/use-cases/auth/loginUser";
import type {
	AuthRepository,
	PasswordVerifier
} from "../../../../src/domain/ports/auth";
import type {
	EmailAddress,
	PasswordHash,
	User,
	UserId,
	UserName
} from "../../../../src/domain/types/auth/User";
import type { ClockPort } from "../../../../src/shared/ports/clock";
import type { TokenPort } from "../../../../src/shared/ports/token";
import { err, ok } from "../../../../src/shared/result";

describe("Login User Use Case - New Architecture", () => {
	let mockAuthRepo: AuthRepository;
	let mockPasswordVerifier: PasswordVerifier;
	let mockTokenService: TokenPort;
	let mockClock: ClockPort;
	let mockUser: User;

	beforeEach(() => {
		// Mock user data
		mockUser = {
			id: 1 as UserId,
			userName: "Test User" as UserName,
			email: "test@example.com" as EmailAddress,
			isVerified: true,
			passwordHash: "hashed_password" as PasswordHash,
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			lastLoginAt: null,
			theme: null,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z"
		};

		// Mock dependencies
		mockAuthRepo = {
			findByEmail: vi.fn(),
			findById: vi.fn(),
			findByVerificationToken: vi.fn(),
			findByGoogleId: vi.fn(),
			findByLineId: vi.fn(),
			create: vi.fn(),
			completeRegistration: vi.fn(),
			updateLastLogin: vi.fn(),
			updateTheme: vi.fn(),
			createOrUpdateOAuthUser: vi.fn()
		};

		mockPasswordVerifier = {
			verify: vi.fn()
		};

		mockTokenService = {
			sign: vi.fn(),
			verify: vi.fn()
		};

		mockClock = {
			now: vi.fn()
		};
	});

	describe("successful login", () => {
		it("should login user with valid credentials", async () => {
			// Arrange
			const input = {
				email: "test@example.com",
				password: "password123"
			};

			const currentTime = new Date("2024-01-01T12:00:00Z");
			const mockToken = "jwt_token_123";

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(mockUser));
			mockPasswordVerifier.verify = vi.fn().mockResolvedValue(true);
			mockAuthRepo.updateLastLogin = vi.fn().mockResolvedValue(ok(mockUser));
			mockTokenService.sign = vi.fn().mockResolvedValue(mockToken);
			mockClock.now = vi.fn().mockReturnValue(currentTime);

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.token).toBe(mockToken);
				expect(result.value.user).toBe(mockUser);
			}

			expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
			expect(mockPasswordVerifier.verify).toHaveBeenCalledWith(
				"password123",
				"hashed_password"
			);
			expect(mockAuthRepo.updateLastLogin).toHaveBeenCalledWith(1, currentTime);
			expect(mockTokenService.sign).toHaveBeenCalledWith({
				userId: 1,
				exp: expect.any(Number)
			});
		});

		it("should handle token as string or object", async () => {
			// Arrange
			const input = {
				email: "test@example.com",
				password: "password123"
			};

			const currentTime = new Date("2024-01-01T12:00:00Z");
			const mockTokenObject = { token: "jwt_token_123" };

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(mockUser));
			mockPasswordVerifier.verify = vi.fn().mockResolvedValue(true);
			mockAuthRepo.updateLastLogin = vi.fn().mockResolvedValue(ok(mockUser));
			mockTokenService.sign = vi.fn().mockResolvedValue(mockTokenObject);
			mockClock.now = vi.fn().mockReturnValue(currentTime);

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.token).toBe("[object Object]"); // String conversion
			}
		});
	});

	describe("authentication failures", () => {
		it("should fail when user not found", async () => {
			// Arrange
			const input = {
				email: "nonexistent@example.com",
				password: "password123"
			};

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(null));

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("Unauthorized");
				expect(result.error.message).toBe(
					"メールアドレスまたはパスワードが正しくありません"
				);
			}

			expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith(
				"nonexistent@example.com"
			);
			expect(mockPasswordVerifier.verify).not.toHaveBeenCalled();
		});

		it("should fail when password is incorrect", async () => {
			// Arrange
			const input = {
				email: "test@example.com",
				password: "wrongpassword"
			};

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(mockUser));
			mockPasswordVerifier.verify = vi.fn().mockResolvedValue(false);

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("Unauthorized");
				expect(result.error.message).toBe(
					"メールアドレスまたはパスワードが正しくありません"
				);
			}

			expect(mockPasswordVerifier.verify).toHaveBeenCalledWith(
				"wrongpassword",
				"hashed_password"
			);
			expect(mockTokenService.sign).not.toHaveBeenCalled();
		});

		it("should fail when user has no password hash", async () => {
			// Arrange
			const userWithoutPassword = { ...mockUser, passwordHash: null };
			const input = {
				email: "test@example.com",
				password: "password123"
			};

			mockAuthRepo.findByEmail = vi
				.fn()
				.mockResolvedValue(ok(userWithoutPassword));

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("Unauthorized");
				expect(result.error.message).toBe(
					"メールアドレスまたはパスワードもしくはログイン方法が正しくありません"
				);
			}

			expect(mockPasswordVerifier.verify).not.toHaveBeenCalled();
		});

		it("should fail for OAuth users with dummy password", async () => {
			// Arrange
			const oauthUser = {
				...mockUser,
				passwordHash: "oauth_dummy_hash" as PasswordHash
			};
			const input = {
				email: "oauth@example.com",
				password: "password123"
			};

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(oauthUser));

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("Unauthorized");
				expect(result.error.message).toBe(
					"このアカウントはGoogleログインでご利用ください"
				);
			}

			expect(mockPasswordVerifier.verify).not.toHaveBeenCalled();
		});
	});

	describe("repository errors", () => {
		it("should propagate auth repository errors", async () => {
			// Arrange
			const input = {
				email: "test@example.com",
				password: "password123"
			};

			const repoError = {
				type: "InfraError" as const,
				message: "Database connection failed"
			};

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(err(repoError));

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toEqual(repoError);
			}
		});

		it("should propagate update last login errors", async () => {
			// Arrange
			const input = {
				email: "test@example.com",
				password: "password123"
			};

			const currentTime = new Date("2024-01-01T12:00:00Z");
			const updateError = {
				type: "InfraError" as const,
				message: "Failed to update last login"
			};

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(mockUser));
			mockPasswordVerifier.verify = vi.fn().mockResolvedValue(true);
			mockAuthRepo.updateLastLogin = vi
				.fn()
				.mockResolvedValue(err(updateError));
			mockClock.now = vi.fn().mockReturnValue(currentTime);

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toEqual(updateError);
			}

			expect(mockTokenService.sign).not.toHaveBeenCalled();
		});
	});

	describe("edge cases", () => {
		it("should handle case insensitive email lookup", async () => {
			// Arrange
			const input = {
				email: "TEST@EXAMPLE.COM",
				password: "password123"
			};

			const currentTime = new Date("2024-01-01T12:00:00Z");
			const mockToken = "jwt_token_123";

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(mockUser));
			mockPasswordVerifier.verify = vi.fn().mockResolvedValue(true);
			mockAuthRepo.updateLastLogin = vi.fn().mockResolvedValue(ok(mockUser));
			mockTokenService.sign = vi.fn().mockResolvedValue(mockToken);
			mockClock.now = vi.fn().mockReturnValue(currentTime);

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(true);
			expect(mockAuthRepo.findByEmail).toHaveBeenCalledWith("TEST@EXAMPLE.COM");
		});

		it("should handle unverified users", async () => {
			// Arrange
			const unverifiedUser = { ...mockUser, isVerified: false };
			const input = {
				email: "unverified@example.com",
				password: "password123"
			};

			const currentTime = new Date("2024-01-01T12:00:00Z");
			const mockToken = "jwt_token_123";

			mockAuthRepo.findByEmail = vi.fn().mockResolvedValue(ok(unverifiedUser));
			mockPasswordVerifier.verify = vi.fn().mockResolvedValue(true);
			mockAuthRepo.updateLastLogin = vi
				.fn()
				.mockResolvedValue(ok(unverifiedUser));
			mockTokenService.sign = vi.fn().mockResolvedValue(mockToken);
			mockClock.now = vi.fn().mockReturnValue(currentTime);

			const loginUser = loginUserUseCase({
				authRepo: mockAuthRepo,
				passwordVerifier: mockPasswordVerifier,
				tokenService: mockTokenService,
				clock: mockClock
			});

			// Act
			const result = await loginUser(input);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.user.isVerified).toBe(false);
			}
		});
	});
});
