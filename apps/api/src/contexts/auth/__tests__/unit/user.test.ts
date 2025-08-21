import { describe, expect, it } from "vitest";
import type { User, UserId } from "../../domain/model/user";

describe("Auth Domain User Model", () => {
	describe("UserId brand type", () => {
		it("should accept valid user ID", () => {
			const userId: UserId = 123 as UserId;
			expect(userId).toBe(123);
		});

		it("should work with arithmetic operations", () => {
			const userId: UserId = 100 as UserId;
			const result = (userId as number) + 50;
			expect(result).toBe(150);
		});
	});

	describe("User entity", () => {
		it("should have correct structure for email user", () => {
			const user: User = {
				id: 1 as UserId,
				userName: "testuser",
				email: "test@example.com",
				isVerified: true,
				passwordHash: "hashed_password_123",
				googleId: null,
				lineId: null,
				oauthProvider: "email",
				avatarUrl: null,
				lastLoginAt: "2024-01-01T00:00:00Z",
				theme: "light",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z"
			};

			expect(user.id).toBe(1);
			expect(user.userName).toBe("testuser");
			expect(user.email).toBe("test@example.com");
			expect(user.isVerified).toBe(true);
			expect(user.passwordHash).toBe("hashed_password_123");
			expect(user.googleId).toBeNull();
			expect(user.lineId).toBeNull();
			expect(user.oauthProvider).toBe("email");
			expect(user.avatarUrl).toBeNull();
			expect(user.lastLoginAt).toBe("2024-01-01T00:00:00Z");
			expect(user.theme).toBe("light");
			expect(user.createdAt).toBe("2024-01-01T00:00:00Z");
			expect(user.updatedAt).toBe("2024-01-01T00:00:00Z");
		});

		it("should have correct structure for Google OAuth user", () => {
			const user: User = {
				id: 2 as UserId,
				userName: "googleuser",
				email: "google@example.com",
				isVerified: true,
				passwordHash: null,
				googleId: "google_123456",
				lineId: null,
				oauthProvider: "google",
				avatarUrl: "https://example.com/avatar.jpg",
				lastLoginAt: "2024-01-01T00:00:00Z",
				theme: "dark",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z"
			};

			expect(user.id).toBe(2);
			expect(user.userName).toBe("googleuser");
			expect(user.email).toBe("google@example.com");
			expect(user.isVerified).toBe(true);
			expect(user.passwordHash).toBeNull();
			expect(user.googleId).toBe("google_123456");
			expect(user.lineId).toBeNull();
			expect(user.oauthProvider).toBe("google");
			expect(user.avatarUrl).toBe("https://example.com/avatar.jpg");
			expect(user.theme).toBe("dark");
		});

		it("should have correct structure for LINE OAuth user", () => {
			const user: User = {
				id: 3 as UserId,
				userName: "lineuser",
				email: "line@example.com",
				isVerified: true,
				passwordHash: null,
				googleId: null,
				lineId: "line_789012",
				oauthProvider: "line",
				avatarUrl: "https://example.com/line-avatar.jpg",
				lastLoginAt: null,
				theme: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z"
			};

			expect(user.id).toBe(3);
			expect(user.userName).toBe("lineuser");
			expect(user.email).toBe("line@example.com");
			expect(user.isVerified).toBe(true);
			expect(user.passwordHash).toBeNull();
			expect(user.googleId).toBeNull();
			expect(user.lineId).toBe("line_789012");
			expect(user.oauthProvider).toBe("line");
			expect(user.avatarUrl).toBe("https://example.com/line-avatar.jpg");
			expect(user.lastLoginAt).toBeNull();
			expect(user.theme).toBeNull();
		});

		it("should have correct structure for unverified user", () => {
			const user: User = {
				id: 4 as UserId,
				userName: "unverified",
				email: "unverified@example.com",
				isVerified: false,
				passwordHash: "hashed_password_456",
				googleId: null,
				lineId: null,
				oauthProvider: "email",
				avatarUrl: null,
				lastLoginAt: null,
				theme: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z"
			};

			expect(user.id).toBe(4);
			expect(user.userName).toBe("unverified");
			expect(user.email).toBe("unverified@example.com");
			expect(user.isVerified).toBe(false);
			expect(user.passwordHash).toBe("hashed_password_456");
			expect(user.lastLoginAt).toBeNull();
			expect(user.theme).toBeNull();
		});
	});

	describe("User type constraints", () => {
		it("should enforce oauthProvider values", () => {
			// This test ensures TypeScript compilation
			const validProviders: Array<User["oauthProvider"]> = [
				"email",
				"google",
				"line",
				null
			];
			expect(validProviders).toHaveLength(4);
		});

		it("should enforce required fields", () => {
			// This test ensures required fields are properly typed
			const requiredFields: Array<keyof User> = [
				"id",
				"userName",
				"email",
				"isVerified",
				"passwordHash",
				"googleId",
				"lineId",
				"oauthProvider",
				"avatarUrl",
				"lastLoginAt",
				"theme",
				"createdAt",
				"updatedAt"
			];

			expect(requiredFields).toHaveLength(13);
		});
	});

	describe("User data validation", () => {
		it("should handle valid ISO date strings", () => {
			const user: User = {
				id: 1 as UserId,
				userName: "testuser",
				email: "test@example.com",
				isVerified: true,
				passwordHash: "hashed_password",
				googleId: null,
				lineId: null,
				oauthProvider: "email",
				avatarUrl: null,
				lastLoginAt: "2024-01-01T00:00:00.000Z",
				theme: "light",
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z"
			};

			expect(user.lastLoginAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
			expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
			expect(user.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
		});

		it("should handle null values for optional fields", () => {
			const user: User = {
				id: 1 as UserId,
				userName: "testuser",
				email: "test@example.com",
				isVerified: true,
				passwordHash: null,
				googleId: null,
				lineId: null,
				oauthProvider: null,
				avatarUrl: null,
				lastLoginAt: null,
				theme: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z"
			};

			expect(user.passwordHash).toBeNull();
			expect(user.googleId).toBeNull();
			expect(user.lineId).toBeNull();
			expect(user.oauthProvider).toBeNull();
			expect(user.avatarUrl).toBeNull();
			expect(user.lastLoginAt).toBeNull();
			expect(user.theme).toBeNull();
		});
	});
});
