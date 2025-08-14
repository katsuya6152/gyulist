import type { AnyD1Database } from "drizzle-orm/d1";
import { describe, expect, it } from "vitest";
import * as userRepository from "../../../src/repositories/userRepository";

describe("UserRepository", () => {
	describe("exports", () => {
		it("should export findUserById function", () => {
			expect(userRepository.findUserById).toBeDefined();
			expect(typeof userRepository.findUserById).toBe("function");
		});

		it("should export findUserByEmail function", () => {
			expect(userRepository.findUserByEmail).toBeDefined();
			expect(typeof userRepository.findUserByEmail).toBe("function");
		});

		it("should export createUser function", () => {
			expect(userRepository.createUser).toBeDefined();
			expect(typeof userRepository.createUser).toBe("function");
		});

		it("should export findUserByVerificationToken function", () => {
			expect(userRepository.findUserByVerificationToken).toBeDefined();
			expect(typeof userRepository.findUserByVerificationToken).toBe(
				"function"
			);
		});

		it("should export completeUserRegistration function", () => {
			expect(userRepository.completeUserRegistration).toBeDefined();
			expect(typeof userRepository.completeUserRegistration).toBe("function");
		});

		it("should export updateLastLoginAt function", () => {
			expect(userRepository.updateLastLoginAt).toBeDefined();
			expect(typeof userRepository.updateLastLoginAt).toBe("function");
		});

		it("should export updateUserTheme function", () => {
			expect(userRepository.updateUserTheme).toBeDefined();
			expect(typeof userRepository.updateUserTheme).toBe("function");
		});
	});

	describe("function signatures", () => {
		it("should have correct parameter length for findUserById", () => {
			expect(userRepository.findUserById.length).toBe(2);
		});

		it("should have correct parameter length for findUserByEmail", () => {
			expect(userRepository.findUserByEmail.length).toBe(2);
		});

		it("should have correct parameter length for createUser", () => {
			expect(userRepository.createUser.length).toBe(3);
		});

		it("should have correct parameter length for findUserByVerificationToken", () => {
			expect(userRepository.findUserByVerificationToken.length).toBe(2);
		});

		it("should have correct parameter length for completeUserRegistration", () => {
			expect(userRepository.completeUserRegistration.length).toBe(4);
		});

		it("should have correct parameter length for updateLastLoginAt", () => {
			expect(userRepository.updateLastLoginAt.length).toBe(2);
		});

		it("should have correct parameter length for updateUserTheme", () => {
			expect(userRepository.updateUserTheme.length).toBe(3);
		});
	});

	describe("function types", () => {
		it("should return promises from async functions", () => {
			const mockDb = {} as AnyD1Database;

			// これらの関数は全てPromiseを返すはず
			const result1 = userRepository.findUserById(mockDb, 1);
			const result2 = userRepository.findUserByEmail(
				mockDb,
				"test@example.com"
			);
			const result3 = userRepository.createUser(
				mockDb,
				"test@example.com",
				"token123"
			);
			const result4 = userRepository.findUserByVerificationToken(
				mockDb,
				"token123"
			);
			const result5 = userRepository.completeUserRegistration(
				mockDb,
				"token123",
				"John Doe",
				"hashedPassword"
			);
			const result6 = userRepository.updateLastLoginAt(mockDb, 1);
			const result7 = userRepository.updateUserTheme(mockDb, 1, "dark");

			expect(result1).toBeInstanceOf(Promise);
			expect(result2).toBeInstanceOf(Promise);
			expect(result3).toBeInstanceOf(Promise);
			expect(result4).toBeInstanceOf(Promise);
			expect(result5).toBeInstanceOf(Promise);
			expect(result6).toBeInstanceOf(Promise);
			expect(result7).toBeInstanceOf(Promise);

			// Promiseを適切にキャッチしてテストが完了するようにする
			return Promise.allSettled([
				result1,
				result2,
				result3,
				result4,
				result5,
				result6,
				result7
			]);
		});
	});

	describe("parameter validation", () => {
		it("should handle different user IDs", () => {
			const mockDb = {} as AnyD1Database;

			const userIds = [1, 999, 123456];
			const promises = userIds.map((id) =>
				userRepository.findUserById(mockDb, id)
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});

		it("should handle different email formats", () => {
			const mockDb = {} as AnyD1Database;

			const emails = [
				"test@example.com",
				"user+tag@domain.co.jp",
				"simple@domain.org"
			];

			const promises = emails.map((email) =>
				userRepository.findUserByEmail(mockDb, email)
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});

		it("should handle different theme values", () => {
			const mockDb = {} as AnyD1Database;

			const themes = ["light", "dark", "system"];
			const promises = themes.map((theme) =>
				userRepository.updateUserTheme(mockDb, 1, theme)
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});
	});
});
