import { describe, expect, it, vi } from "vitest";
import * as userRepository from "../../../src/repositories/userRepository";
import { getUserById, updateTheme } from "../../../src/services/userService";
import { createMockDB, mockUser } from "../../fixtures/database";

// Mock the repository module
vi.mock("../../../src/repositories/userRepository");

const mockUserRepository = vi.mocked(userRepository);

describe("UserService", () => {
	const mockDB = createMockDB();

	describe("getUserById", () => {
		it("should return user when found", async () => {
			// Arrange
			mockUserRepository.findUserById.mockResolvedValue(
				mockUser as Parameters<
					typeof mockUserRepository.findUserById.mockResolvedValue
				>[0]
			);

			// Act
			const result = await getUserById(mockDB, 1);

			// Assert
			expect(result).toEqual(mockUser);
			expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockDB, 1);
		});

		it("should return null when user not found", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockUserRepository.findUserById.mockResolvedValue(null);

			// Act
			const result = await getUserById(mockDB, 999);

			// Assert
			expect(result).toBeNull();
			expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockDB, 999);
		});

		it("should throw error when database fails", async () => {
			// Arrange
			mockUserRepository.findUserById.mockRejectedValue(
				new Error("Database error")
			);

			// Act & Assert
			await expect(getUserById(mockDB, 1)).rejects.toThrow("Database error");
			expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockDB, 1);
		});
	});

	describe("updateTheme", () => {
		it("should update user theme successfully", async () => {
			// Arrange
			mockUserRepository.updateUserTheme.mockResolvedValue(undefined);

			// Act
			const result = await updateTheme(mockDB, 1, "dark");

			// Assert
			expect(result).toBeUndefined();
			expect(mockUserRepository.updateUserTheme).toHaveBeenCalledWith(
				mockDB,
				1,
				"dark"
			);
		});

		it("should handle light theme update", async () => {
			// Arrange
			mockUserRepository.updateUserTheme.mockResolvedValue(undefined);

			// Act
			const result = await updateTheme(mockDB, 1, "light");

			// Assert
			expect(result).toBeUndefined();
			expect(mockUserRepository.updateUserTheme).toHaveBeenCalledWith(
				mockDB,
				1,
				"light"
			);
		});

		it("should handle system theme update", async () => {
			// Arrange
			mockUserRepository.updateUserTheme.mockResolvedValue(undefined);

			// Act
			const result = await updateTheme(mockDB, 1, "system");

			// Assert
			expect(result).toBeUndefined();
			expect(mockUserRepository.updateUserTheme).toHaveBeenCalledWith(
				mockDB,
				1,
				"system"
			);
		});

		it("should throw error when update fails", async () => {
			// Arrange
			mockUserRepository.updateUserTheme.mockRejectedValue(
				new Error("Database update error")
			);

			// Act & Assert
			await expect(updateTheme(mockDB, 1, "dark")).rejects.toThrow(
				"Database update error"
			);
			expect(mockUserRepository.updateUserTheme).toHaveBeenCalledWith(
				mockDB,
				1,
				"dark"
			);
		});

		it("should handle null return from repository", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockUserRepository.updateUserTheme.mockResolvedValue(null);

			// Act
			const result = await updateTheme(mockDB, 999, "dark");

			// Assert
			expect(result).toBeNull();
			expect(mockUserRepository.updateUserTheme).toHaveBeenCalledWith(
				mockDB,
				999,
				"dark"
			);
		});
	});
});
