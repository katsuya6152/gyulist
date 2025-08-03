import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authLib from "../../lib/auth";
import * as mailerLib from "../../lib/mailer";
import * as tokenLib from "../../lib/token";
import * as userRepository from "../../repositories/userRepository";
import {
	completeRegistration,
	login,
	register,
	verifyToken,
} from "../../services/authService";
import type { Bindings } from "../../types";
import { createMockDB, mockUser } from "../mocks/database";

// Mock all dependencies
vi.mock("../../repositories/userRepository");
vi.mock("../../lib/auth");
vi.mock("../../lib/token");
vi.mock("../../lib/mailer");

const mockUserRepository = vi.mocked(userRepository);
const mockAuthLib = vi.mocked(authLib);
const mockTokenLib = vi.mocked(tokenLib);
const mockMailerLib = vi.mocked(mailerLib);

describe("AuthService", () => {
	const mockDB = createMockDB();
	const mockEnv: Bindings = {
		DB: mockDB,
		JWT_SECRET: "test-secret",
		ENVIRONMENT: "test",
		APP_URL: "http://localhost:3000",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("register", () => {
		const registerInput = {
			email: "test@example.com",
		};

		it("should register new user successfully", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockUserRepository.findUserByEmail.mockResolvedValue(null);
			mockTokenLib.generateToken.mockResolvedValue("verification-token");
			mockUserRepository.createUser.mockResolvedValue(undefined);
			mockMailerLib.sendVerificationEmail.mockResolvedValue(undefined);

			// Act
			const result = await register(mockEnv, mockDB, registerInput);

			// Assert
			expect(result).toEqual({
				success: true,
				message: "仮登録が完了しました。メールを確認してください。",
			});
			expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(
				mockDB,
				registerInput.email,
			);
			expect(mockTokenLib.generateToken).toHaveBeenCalled();
			expect(mockUserRepository.createUser).toHaveBeenCalledWith(
				mockDB,
				registerInput.email,
				"verification-token",
			);
			expect(mockMailerLib.sendVerificationEmail).toHaveBeenCalledWith(
				mockEnv,
				registerInput.email,
				"verification-token",
			);
		});

		it("should handle existing user gracefully", async () => {
			// Arrange
			mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

			// Act
			const result = await register(mockEnv, mockDB, registerInput);

			// Assert
			expect(result).toEqual({
				success: true,
				message: "仮登録が完了しました。メールを確認してください。",
			});
			expect(mockTokenLib.generateToken).not.toHaveBeenCalled();
			expect(mockUserRepository.createUser).not.toHaveBeenCalled();
			expect(mockMailerLib.sendVerificationEmail).not.toHaveBeenCalled();
		});
	});

	describe("verifyToken", () => {
		const token = "valid-token";

		it("should verify token successfully for unverified user", async () => {
			// Arrange
			mockUserRepository.findUserByVerificationToken.mockResolvedValue({
				...mockUser,
				isVerified: false,
			});

			// Act
			const result = await verifyToken(mockEnv, mockDB, token);

			// Assert
			expect(result).toEqual({
				success: true,
				message: "トークンは有効です。本登録を完了してください。",
			});
		});

		it("should reject invalid token", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockUserRepository.findUserByVerificationToken.mockResolvedValue(null);

			// Act
			const result = await verifyToken(mockEnv, mockDB, token);

			// Assert
			expect(result).toEqual({
				success: false,
				message: "無効なトークンです。",
			});
		});

		it("should reject already verified user", async () => {
			// Arrange
			mockUserRepository.findUserByVerificationToken.mockResolvedValue({
				...mockUser,
				isVerified: true,
			});

			// Act
			const result = await verifyToken(mockEnv, mockDB, token);

			// Assert
			expect(result).toEqual({
				success: false,
				message: "既に本登録が完了しています。",
			});
		});
	});

	describe("completeRegistration", () => {
		const completeInput = {
			token: "valid-token",
			name: "Test User",
			password: "StrongPassword123!",
		};

		it("should complete registration successfully", async () => {
			// Arrange
			mockUserRepository.findUserByVerificationToken.mockResolvedValue({
				...mockUser,
				isVerified: false,
			});
			mockTokenLib.hashPassword.mockResolvedValue("hashed-password");
			mockUserRepository.completeUserRegistration.mockResolvedValue(undefined);

			// Act
			const result = await completeRegistration(mockEnv, mockDB, completeInput);

			// Assert
			expect(result).toEqual({
				success: true,
				message: "本登録が完了しました。ログインしてください。",
			});
			expect(mockTokenLib.hashPassword).toHaveBeenCalledWith(
				completeInput.password,
			);
			expect(mockUserRepository.completeUserRegistration).toHaveBeenCalledWith(
				mockDB,
				completeInput.token,
				completeInput.name,
				"hashed-password",
			);
		});

		it("should reject invalid token", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockUserRepository.findUserByVerificationToken.mockResolvedValue(null);

			// Act
			const result = await completeRegistration(mockEnv, mockDB, completeInput);

			// Assert
			expect(result).toEqual({
				success: false,
				message: "無効なトークンです。",
			});
		});

		it("should reject already verified user", async () => {
			// Arrange
			mockUserRepository.findUserByVerificationToken.mockResolvedValue({
				...mockUser,
				isVerified: true,
			});

			// Act
			const result = await completeRegistration(mockEnv, mockDB, completeInput);

			// Assert
			expect(result).toEqual({
				success: false,
				message: "既に本登録が完了しています。",
			});
		});
	});

	describe("login", () => {
		const loginInput = {
			email: "test@example.com",
			password: "StrongPassword123!",
		};

		it("should login successfully", async () => {
			// Arrange
			mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
			mockAuthLib.verifyPassword.mockResolvedValue(true);
			mockAuthLib.signToken.mockResolvedValue("jwt-token");
			mockUserRepository.updateLastLoginAt.mockResolvedValue(undefined);

			// Act
			const result = await login(mockDB, "jwt-secret", loginInput);

			// Assert
			expect(result).toEqual({
				success: true,
				token: "jwt-token",
			});
			expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(
				mockDB,
				loginInput.email,
			);
			expect(mockAuthLib.verifyPassword).toHaveBeenCalledWith(
				loginInput.password,
				mockUser.passwordHash,
			);
			expect(mockAuthLib.signToken).toHaveBeenCalledWith(
				{ userId: mockUser.id },
				"jwt-secret",
			);
			expect(mockUserRepository.updateLastLoginAt).toHaveBeenCalledWith(
				mockDB,
				mockUser.id,
			);
		});

		it("should reject non-existent user", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockUserRepository.findUserByEmail.mockResolvedValue(null);

			// Act
			const result = await login(mockDB, "jwt-secret", loginInput);

			// Assert
			expect(result).toEqual({
				success: false,
				message: "メールアドレスまたはパスワードが正しくありません",
			});
		});

		it("should reject invalid password", async () => {
			// Arrange
			mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
			mockAuthLib.verifyPassword.mockResolvedValue(false);

			// Act
			const result = await login(mockDB, "jwt-secret", loginInput);

			// Assert
			expect(result).toEqual({
				success: false,
				message: "メールアドレスまたはパスワードが正しくありません",
			});
		});
	});
});
