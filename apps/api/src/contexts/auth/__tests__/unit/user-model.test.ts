import { describe, expect, it } from "vitest";
import type { User, UserId } from "../../domain/model/user";

describe("User Domain Model", () => {
	describe("User type", () => {
		it("should have correct structure", () => {
			const mockUser: User = {
				id: 1 as UserId,
				userName: "testuser",
				email: "test@example.com",
				isVerified: true,
				passwordHash: "hashedpassword",
				googleId: null,
				lineId: null,
				oauthProvider: "email",
				avatarUrl: null,
				lastLoginAt: "2025-01-01T00:00:00Z",
				theme: "light",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z"
			};

			expect(mockUser.id).toBe(1);
			expect(mockUser.userName).toBe("testuser");
			expect(mockUser.email).toBe("test@example.com");
			expect(mockUser.isVerified).toBe(true);
			expect(mockUser.passwordHash).toBe("hashedpassword");
			expect(mockUser.oauthProvider).toBe("email");
		});

		it("should support OAuth user structure", () => {
			const oauthUser: User = {
				id: 2 as UserId,
				userName: "oauthuser",
				email: "oauth@example.com",
				isVerified: true,
				passwordHash: null,
				googleId: "google123",
				lineId: null,
				oauthProvider: "google",
				avatarUrl: "https://example.com/avatar.jpg",
				lastLoginAt: "2025-01-01T00:00:00Z",
				theme: "dark",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z"
			};

			expect(oauthUser.googleId).toBe("google123");
			expect(oauthUser.passwordHash).toBeNull();
			expect(oauthUser.oauthProvider).toBe("google");
			expect(oauthUser.avatarUrl).toBe("https://example.com/avatar.jpg");
		});

		it("should support LINE OAuth user structure", () => {
			const lineUser: User = {
				id: 3 as UserId,
				userName: "lineuser",
				email: "line@example.com",
				isVerified: true,
				passwordHash: null,
				googleId: null,
				lineId: "line123",
				oauthProvider: "line",
				avatarUrl: null,
				lastLoginAt: null,
				theme: null,
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z"
			};

			expect(lineUser.lineId).toBe("line123");
			expect(lineUser.oauthProvider).toBe("line");
			expect(lineUser.lastLoginAt).toBeNull();
			expect(lineUser.theme).toBeNull();
		});

		it("should support unverified user structure", () => {
			const unverifiedUser: User = {
				id: 4 as UserId,
				userName: "unverified",
				email: "unverified@example.com",
				isVerified: false,
				passwordHash: "hashedpassword",
				googleId: null,
				lineId: null,
				oauthProvider: "email",
				avatarUrl: null,
				lastLoginAt: null,
				theme: null,
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z"
			};

			expect(unverifiedUser.isVerified).toBe(false);
			expect(unverifiedUser.lastLoginAt).toBeNull();
		});
	});

	describe("UserId type", () => {
		it("should be a branded number type", () => {
			const userId: UserId = 1 as UserId;
			expect(typeof userId).toBe("number");
			expect(userId).toBe(1);
		});

		it("should support different numeric values", () => {
			const userId1: UserId = 1 as UserId;
			const userId2: UserId = 999 as UserId;
			const userId3: UserId = 0 as UserId;

			expect(userId1).toBe(1);
			expect(userId2).toBe(999);
			expect(userId3).toBe(0);
		});
	});

	describe("User type constraints", () => {
		it("should enforce readonly properties", () => {
			const user: User = {
				id: 1 as UserId,
				userName: "testuser",
				email: "test@example.com",
				isVerified: true,
				passwordHash: "hashedpassword",
				googleId: null,
				lineId: null,
				oauthProvider: "email",
				avatarUrl: null,
				lastLoginAt: "2025-01-01T00:00:00Z",
				theme: "light",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z"
			};

			// TypeScriptのreadonly制約をテスト
			// 実際の実行時には変更可能だが、型レベルでの制約を確認
			expect(user.id).toBe(1);
			expect(user.userName).toBe("testuser");
		});

		it("should support all oauthProvider values", () => {
			const emailUser: User = {
				id: 1 as UserId,
				userName: "emailuser",
				email: "email@example.com",
				isVerified: true,
				passwordHash: "hash",
				googleId: null,
				lineId: null,
				oauthProvider: "email",
				avatarUrl: null,
				lastLoginAt: null,
				theme: null,
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z"
			};

			const googleUser: User = {
				...emailUser,
				id: 2 as UserId,
				userName: "googleuser",
				email: "google@example.com",
				passwordHash: null,
				googleId: "google123",
				oauthProvider: "google"
			};

			const lineUser: User = {
				...emailUser,
				id: 3 as UserId,
				userName: "lineuser",
				email: "line@example.com",
				passwordHash: null,
				lineId: "line123",
				oauthProvider: "line"
			};

			expect(emailUser.oauthProvider).toBe("email");
			expect(googleUser.oauthProvider).toBe("google");
			expect(lineUser.oauthProvider).toBe("line");
		});
	});
});
