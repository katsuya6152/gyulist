import { describe, expect, it, vi } from "vitest";
import * as userRepository from "../../repositories/userRepository";
import { getUserById } from "../../services/userService";
import { createMockDB, mockUser } from "../mocks/database";

// Mock the repository module
vi.mock("../../repositories/userRepository");

const mockUserRepository = vi.mocked(userRepository);

describe("UserService", () => {
	const mockDB = createMockDB();

	describe("getUserById", () => {
		it("should return user when found", async () => {
			// Arrange
			mockUserRepository.findUserById.mockResolvedValue(mockUser);

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
				new Error("Database error"),
			);

			// Act & Assert
			await expect(getUserById(mockDB, 1)).rejects.toThrow("Database error");
			expect(mockUserRepository.findUserById).toHaveBeenCalledWith(mockDB, 1);
		});
	});
});
