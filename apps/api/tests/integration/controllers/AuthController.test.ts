/**
 * Auth Controller Integration Tests - New Architecture
 *
 * 認証コントローラーの統合テスト
 */

import type { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	RegisterUserResult,
	UpdateUserThemeResult
} from "../../../src/application/use-cases/auth";
import type { AuthError } from "../../../src/domain/errors/auth/AuthErrors";
import type { User } from "../../../src/domain/types/auth/User";
import type {
	EmailAddress,
	PasswordHash,
	UserId,
	UserName
} from "../../../src/domain/types/auth/User";
import { AuthController } from "../../../src/interfaces/http/controllers/AuthController";
import type { AuthControllerDeps } from "../../../src/interfaces/http/controllers/AuthController";
import { err, ok } from "../../../src/shared/result";
import type { Result } from "../../../src/shared/result";
import type { Bindings } from "../../../src/types";

// Mock Hono Context
const createMockContext = (
	body: Record<string, unknown>,
	headers: Record<string, string> = {}
) => ({
	req: {
		json: vi.fn().mockResolvedValue(body),
		header: vi.fn((name: string) => headers[name]),
		param: vi.fn((name: string) => {
			if (name === "id") return "1";
			return undefined;
		})
	},
	json: vi.fn(),
	get: vi.fn()
});

describe("Auth Controller - New Architecture", () => {
	let authController: AuthController;
	let mockDeps: AuthControllerDeps;
	let mockUser: User;
	let mockLoginUserUseCase: ReturnType<typeof vi.fn>;
	let mockRegisterUserUseCase: ReturnType<typeof vi.fn>;
	let mockVerifyTokenUseCase: ReturnType<typeof vi.fn>;
	let mockCompleteRegistrationUseCase: ReturnType<typeof vi.fn>;
	let mockUpdateUserThemeUseCase: ReturnType<typeof vi.fn>;
	let mockGetUserUseCase: ReturnType<typeof vi.fn>;

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

		// Create mock functions
		mockLoginUserUseCase = vi.fn();
		mockRegisterUserUseCase = vi.fn();
		mockVerifyTokenUseCase = vi.fn();
		mockCompleteRegistrationUseCase = vi.fn();
		mockUpdateUserThemeUseCase = vi.fn();
		mockGetUserUseCase = vi.fn();

		// Mock dependencies
		mockDeps = {
			loginUserUseCase: mockLoginUserUseCase,
			registerUserUseCase: mockRegisterUserUseCase,
			verifyTokenUseCase: mockVerifyTokenUseCase,
			completeRegistrationUseCase: mockCompleteRegistrationUseCase,
			updateUserThemeUseCase: mockUpdateUserThemeUseCase,
			getUserUseCase: mockGetUserUseCase
		};

		authController = new AuthController(mockDeps);
	});

	describe("login", () => {
		it("should return 200 with token and user data on successful login", async () => {
			// Arrange
			const loginBody = {
				email: "test@example.com",
				password: "password123"
			};

			const mockContext = createMockContext(loginBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const loginResult = {
				token: "jwt_token_123",
				user: mockUser
			};

			mockLoginUserUseCase.mockResolvedValue(ok(loginResult));

			// Act
			await authController.login(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockDeps.loginUserUseCase).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123"
			});

			expect(mockJsonResponse).toHaveBeenCalledWith({
				token: "jwt_token_123",
				user: {
					id: 1,
					userName: "Test User",
					email: "test@example.com",
					theme: null
				}
			});
		});

		it("should return 401 for unauthorized login", async () => {
			// Arrange
			const loginBody = {
				email: "test@example.com",
				password: "wrongpassword"
			};

			const mockContext = createMockContext(loginBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const unauthorizedError = {
				type: "Unauthorized" as const,
				message: "メールアドレスまたはパスワードが正しくありません"
			};

			vi.mocked(mockDeps.loginUserUseCase).mockResolvedValue(
				err(unauthorizedError)
			);

			// Act
			await authController.login(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "メールアドレスまたはパスワードが正しくありません" },
				401
			);
		});

		it("should return 400 for validation error", async () => {
			// Arrange
			const loginBody = {
				email: "invalid-email",
				password: "password123"
			};

			const mockContext = createMockContext(loginBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const validationError = {
				type: "ValidationError" as const,
				message: "Invalid email format",
				field: "email"
			};

			vi.mocked(mockDeps.loginUserUseCase).mockResolvedValue(
				err(validationError)
			);

			// Act
			await authController.login(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Invalid email format" },
				400
			);
		});

		it("should return 500 for other errors", async () => {
			// Arrange
			const loginBody = {
				email: "test@example.com",
				password: "password123"
			};

			const mockContext = createMockContext(loginBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const infraError = {
				type: "InfraError" as const,
				message: "Database connection failed"
			};

			vi.mocked(mockDeps.loginUserUseCase).mockResolvedValue(err(infraError));

			// Act
			await authController.login(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Internal server error" },
				500
			);
		});

		it("should return 500 when JSON parsing fails", async () => {
			// Arrange
			const mockContext = createMockContext({});
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			// Simulate JSON parsing error
			mockContext.req.json = vi
				.fn()
				.mockRejectedValue(new Error("Invalid JSON"));

			// Act
			await authController.login(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Internal server error" },
				500
			);
		});
	});

	describe("register", () => {
		it("should return success response for valid registration", async () => {
			// Arrange
			const registerBody = {
				email: "newuser@example.com"
			};

			const mockContext = createMockContext(registerBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const registerResult = {
				success: true,
				message: "Registration email sent"
			};

			vi.mocked(mockDeps.registerUserUseCase).mockResolvedValue(
				ok(registerResult) as Result<RegisterUserResult, AuthError>
			);

			// Act
			await authController.register(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockDeps.registerUserUseCase).toHaveBeenCalledWith({
				email: "newuser@example.com"
			});

			expect(mockJsonResponse).toHaveBeenCalledWith({
				success: true,
				message: "Registration email sent"
			});
		});

		it("should return 400 for validation error during registration", async () => {
			// Arrange
			const registerBody = {
				email: "invalid-email"
			};

			const mockContext = createMockContext(registerBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const validationError = {
				type: "ValidationError" as const,
				message: "Invalid email format",
				field: "email"
			};

			vi.mocked(mockDeps.registerUserUseCase).mockResolvedValue(
				err(validationError)
			);

			// Act
			await authController.register(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Invalid email format" },
				400
			);
		});

		it("should return 500 for other registration errors", async () => {
			// Arrange
			const registerBody = {
				email: "test@example.com"
			};

			const mockContext = createMockContext(registerBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const conflictError = {
				type: "Conflict" as const,
				message: "Email already exists"
			};

			vi.mocked(mockDeps.registerUserUseCase).mockResolvedValue(
				err(conflictError)
			);

			// Act
			await authController.register(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Internal server error" },
				500
			);
		});
	});

	describe("verify", () => {
		it("should return success response for valid token verification", async () => {
			// Arrange
			const verifyBody = {
				token: "verification_token_123"
			};

			const mockContext = createMockContext(verifyBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const verifyResult = {
				success: true,
				message: "Token verified successfully"
			};

			vi.mocked(mockDeps.verifyTokenUseCase).mockResolvedValue(
				ok(verifyResult)
			);

			// Act
			await authController.verify(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockDeps.verifyTokenUseCase).toHaveBeenCalledWith({
				token: "verification_token_123"
			});

			expect(mockJsonResponse).toHaveBeenCalledWith({
				success: true,
				message: "Token verified successfully"
			});
		});

		it("should return 500 for verification errors", async () => {
			// Arrange
			const verifyBody = {
				token: "invalid_token"
			};

			const mockContext = createMockContext(verifyBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const verifyError = {
				type: "ValidationError" as const,
				message: "Invalid token"
			};

			vi.mocked(mockDeps.verifyTokenUseCase).mockResolvedValue(
				err(verifyError)
			);

			// Act
			await authController.verify(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Internal server error" },
				500
			);
		});
	});

	describe("complete", () => {
		it("should return success response for valid registration completion", async () => {
			// Arrange
			const completeBody = {
				token: "verification_token_123",
				name: "New User",
				password: "password123"
			};

			const mockContext = createMockContext(completeBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const completeResult = {
				success: true,
				message: "Registration completed successfully"
			};

			vi.mocked(mockDeps.completeRegistrationUseCase).mockResolvedValue(
				ok(completeResult)
			);

			// Act
			await authController.complete(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockDeps.completeRegistrationUseCase).toHaveBeenCalledWith({
				token: "verification_token_123",
				name: "New User",
				password: "password123"
			});

			expect(mockJsonResponse).toHaveBeenCalledWith({
				success: true,
				message: "Registration completed successfully"
			});
		});

		it("should return 400 for validation error during completion", async () => {
			// Arrange
			const completeBody = {
				token: "verification_token_123",
				name: "",
				password: "password123"
			};

			const mockContext = createMockContext(completeBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const validationError = {
				type: "ValidationError" as const,
				message: "Name is required",
				field: "name"
			};

			vi.mocked(mockDeps.completeRegistrationUseCase).mockResolvedValue(
				err(validationError)
			);

			// Act
			await authController.complete(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Name is required" },
				400
			);
		});

		it("should return 500 for other completion errors", async () => {
			// Arrange
			const completeBody = {
				token: "verification_token_123",
				name: "New User",
				password: "password123"
			};

			const mockContext = createMockContext(completeBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			const notFoundError = {
				type: "NotFound" as const,
				entity: "User",
				message: "User not found"
			};

			vi.mocked(mockDeps.completeRegistrationUseCase).mockResolvedValue(
				err(notFoundError)
			);

			// Act
			await authController.complete(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{ error: "Internal server error" },
				500
			);
		});
	});

	describe("getUser", () => {
		it("should return user data for valid user ID", async () => {
			// Arrange
			const mockContext = createMockContext({});
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			// Mock JWT payload
			mockContext.get = vi.fn().mockReturnValue({ userId: 1 });

			vi.mocked(mockDeps.getUserUseCase).mockResolvedValue(ok(mockUser));

			// Act
			await authController.getUser(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockDeps.getUserUseCase).toHaveBeenCalledWith({
				userId: 1,
				requestingUserId: 1
			});

			expect(mockJsonResponse).toHaveBeenCalledWith({
				success: true,
				data: mockUser
			});
		});

		it("should return 404 when user not found", async () => {
			// Arrange
			const mockContext = createMockContext({});
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			mockContext.get = vi.fn().mockReturnValue({ userId: 999 });

			const notFoundError = {
				type: "NotFound" as const,
				entity: "User",
				id: 999
			};

			vi.mocked(mockDeps.getUserUseCase).mockResolvedValue(err(notFoundError));

			// Act
			await authController.getUser(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith({ error: undefined }, 404);
		});
	});

	describe("updateTheme", () => {
		it("should return success response for valid theme update", async () => {
			// Arrange
			const themeBody = {
				theme: "dark"
			};

			const mockContext = createMockContext(themeBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			// Mock JWT payload
			mockContext.get = vi.fn().mockReturnValue({ userId: 1 });

			const updateResult = {
				success: true,
				message: "Theme updated successfully"
			};

			vi.mocked(mockDeps.updateUserThemeUseCase).mockResolvedValue(
				ok(updateResult) as Result<UpdateUserThemeResult, AuthError>
			);

			// Act
			await authController.updateTheme(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockDeps.updateUserThemeUseCase).toHaveBeenCalledWith({
				userId: 1,
				theme: "dark",
				requestingUserId: 1
			});

			expect(mockJsonResponse).toHaveBeenCalledWith({
				success: true,
				data: {
					success: true,
					message: "Theme updated successfully"
				}
			});
		});

		it("should return 400 for invalid theme", async () => {
			// Arrange
			const themeBody = {
				theme: "invalid_theme"
			};

			const mockContext = createMockContext(themeBody);
			const mockJsonResponse = vi.fn();
			mockContext.json = mockJsonResponse;

			mockContext.get = vi.fn().mockReturnValue({ userId: 1 });

			const validationError = {
				type: "ValidationError" as const,
				message: "Invalid theme value",
				field: "theme"
			};

			vi.mocked(mockDeps.updateUserThemeUseCase).mockResolvedValue(
				err(validationError)
			);

			// Act
			await authController.updateTheme(
				mockContext as unknown as Context<{ Bindings: Bindings }>
			);

			// Assert
			expect(mockJsonResponse).toHaveBeenCalledWith(
				{
					error: {
						type: "ValidationError",
						message: "Invalid theme value",
						field: "theme"
					}
				},
				400
			);
		});
	});
});
