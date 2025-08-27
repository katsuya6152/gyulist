/**
 * User Factory Unit Tests - New Architecture
 *
 * 認証ドメインのユーザーファクトリー関数のユニットテスト
 */

import { describe, expect, it } from "vitest";
import {
	UserRules,
	createUser,
	updateUser
} from "../../../../src/domain/functions/auth/userFactory";
import type {
	EmailAddress,
	GoogleId,
	NewUserProps,
	PasswordHash,
	UpdateUserProps,
	User,
	UserId,
	UserName
} from "../../../../src/domain/types/auth/User";

describe("User Factory Functions - New Architecture", () => {
	const mockCurrentTime = new Date("2024-01-01T00:00:00Z");

	describe("createUser", () => {
		it("should create user with valid data", () => {
			const props: NewUserProps = {
				userName: "テストユーザー",
				email: "test@example.com",
				passwordHash: "hashed_password",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const user = result.value;
				expect(user.userName).toBe("テストユーザー");
				expect(user.email).toBe("test@example.com");
				expect(user.passwordHash).toBe("hashed_password");
				expect(user.oauthProvider).toBe("email");
				expect(user.isVerified).toBe(false);
				expect(user.createdAt).toBe(mockCurrentTime.toISOString());
				expect(user.updatedAt).toBe(mockCurrentTime.toISOString());
			}
		});

		it("should create OAuth user with Google provider", () => {
			const props: NewUserProps = {
				userName: "Google User",
				email: "google@example.com",
				googleId: "google_123",
				oauthProvider: "google"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const user = result.value;
				expect(user.googleId).toBe("google_123");
				expect(user.oauthProvider).toBe("google");
				expect(user.passwordHash).toBe(null);
			}
		});

		it("should create OAuth user with LINE provider", () => {
			const props: NewUserProps = {
				userName: "LINE User",
				email: "line@example.com",
				lineId: "line_456",
				oauthProvider: "line"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const user = result.value;
				expect(user.lineId).toBe("line_456");
				expect(user.oauthProvider).toBe("line");
				expect(user.passwordHash).toBe(null);
			}
		});

		it("should normalize email to lowercase", () => {
			const props: NewUserProps = {
				userName: "Test User",
				email: "TEST@EXAMPLE.COM",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.email).toBe("test@example.com");
			}
		});

		it("should normalize username by trimming whitespace", () => {
			const props: NewUserProps = {
				userName: "  Test User  ",
				email: "test@example.com",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.userName).toBe("Test User");
			}
		});

		it("should reject empty username", () => {
			const props: NewUserProps = {
				userName: "",
				email: "test@example.com",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("userName");
				expect(result.error.message).toBe("User name is required");
			}
		});

		it("should reject username with only whitespace", () => {
			const props: NewUserProps = {
				userName: "   ",
				email: "test@example.com",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("userName");
				expect(result.error.message).toBe("User name is required");
			}
		});

		it("should reject username longer than 100 characters", () => {
			const longName = "a".repeat(101);
			const props: NewUserProps = {
				userName: longName,
				email: "test@example.com",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("userName");
				expect(result.error.message).toBe(
					"User name cannot exceed 100 characters"
				);
			}
		});

		it("should reject empty email", () => {
			const props: NewUserProps = {
				userName: "Test User",
				email: "",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("email");
				expect(result.error.message).toBe("Email is required");
			}
		});

		it("should reject invalid email format", () => {
			const props: NewUserProps = {
				userName: "Test User",
				email: "invalid-email",
				oauthProvider: "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("email");
				expect(result.error.message).toBe("Invalid email format");
			}
		});

		it("should reject invalid OAuth provider", () => {
			const props: NewUserProps = {
				userName: "Test User",
				email: "test@example.com",
				oauthProvider: "invalid" as "google" | "line" | "email"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("oauthProvider");
				expect(result.error.message).toBe("Invalid OAuth provider");
			}
		});

		it("should set default oauthProvider to email when not provided", () => {
			const props: NewUserProps = {
				userName: "Test User",
				email: "test@example.com"
			};

			const result = createUser(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.oauthProvider).toBe("email");
			}
		});
	});

	describe("updateUser", () => {
		const baseUser: User = {
			id: 1 as UserId,
			userName: "Original User" as UserName,
			email: "original@example.com" as EmailAddress,
			isVerified: false,
			passwordHash: "original_hash" as PasswordHash,
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			lastLoginAt: null,
			theme: null,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z"
		};

		it("should update user with valid data", () => {
			const updates: UpdateUserProps = {
				userName: "Updated User",
				isVerified: true,
				theme: "dark"
			};

			const result = updateUser(baseUser, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const updatedUser = result.value;
				expect(updatedUser.userName).toBe("Updated User");
				expect(updatedUser.isVerified).toBe(true);
				expect(updatedUser.theme).toBe("dark");
				expect(updatedUser.updatedAt).toBe(mockCurrentTime.toISOString());
				// 元の値は保持される
				expect(updatedUser.email).toBe("original@example.com");
				expect(updatedUser.passwordHash).toBe("original_hash");
			}
		});

		it("should update OAuth information", () => {
			const updates: UpdateUserProps = {
				googleId: "new_google_id",
				oauthProvider: "google"
			};

			const result = updateUser(baseUser, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const updatedUser = result.value;
				expect(updatedUser.googleId).toBe("new_google_id");
				expect(updatedUser.oauthProvider).toBe("google");
			}
		});

		it("should clear OAuth information when set to null", () => {
			const userWithGoogle: User = {
				...baseUser,
				googleId: "existing_google_id" as GoogleId,
				oauthProvider: "google"
			};

			const updates: UpdateUserProps = {
				googleId: null,
				oauthProvider: "email"
			};

			const result = updateUser(userWithGoogle, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const updatedUser = result.value;
				expect(updatedUser.googleId).toBe(null);
				expect(updatedUser.oauthProvider).toBe("email");
			}
		});

		it("should reject empty username in updates", () => {
			const updates: UpdateUserProps = {
				userName: ""
			};

			const result = updateUser(baseUser, updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("userName");
				expect(result.error.message).toBe("User name cannot be empty");
			}
		});

		it("should reject username longer than 100 characters in updates", () => {
			const longName = "a".repeat(101);
			const updates: UpdateUserProps = {
				userName: longName
			};

			const result = updateUser(baseUser, updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("userName");
				expect(result.error.message).toBe(
					"User name cannot exceed 100 characters"
				);
			}
		});

		it("should reject invalid OAuth provider in updates", () => {
			const updates: UpdateUserProps = {
				oauthProvider: "invalid" as "google" | "line" | "email"
			};

			const result = updateUser(baseUser, updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("oauthProvider");
				expect(result.error.message).toBe("Invalid OAuth provider");
			}
		});

		it("should handle partial updates correctly", () => {
			const updates: UpdateUserProps = {
				theme: "light"
			};

			const result = updateUser(baseUser, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const updatedUser = result.value;
				expect(updatedUser.theme).toBe("light");
				expect(updatedUser.userName).toBe("Original User"); // 変更されていない
				expect(updatedUser.email).toBe("original@example.com"); // 変更されていない
			}
		});
	});

	describe("UserRules", () => {
		const verifiedUser: User = {
			id: 1 as UserId,
			userName: "Verified User" as UserName,
			email: "verified@example.com" as EmailAddress,
			isVerified: true,
			passwordHash: "password_hash" as PasswordHash,
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			lastLoginAt: null,
			theme: null,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z"
		};

		const unverifiedUser: User = {
			...verifiedUser,
			isVerified: false,
			passwordHash: null
		};

		const googleUser: User = {
			...verifiedUser,
			googleId: "google_123" as GoogleId,
			oauthProvider: "google",
			passwordHash: null
		};

		describe("isVerified", () => {
			it("should return true for verified user", () => {
				expect(UserRules.isVerified(verifiedUser)).toBe(true);
			});

			it("should return false for unverified user", () => {
				expect(UserRules.isVerified(unverifiedUser)).toBe(false);
			});
		});

		describe("isOAuthUser", () => {
			it("should return true for Google OAuth user", () => {
				expect(UserRules.isOAuthUser(googleUser)).toBe(true);
			});

			it("should return false for email user", () => {
				expect(UserRules.isOAuthUser(verifiedUser)).toBe(false);
			});

			it("should return false for user with null oauthProvider", () => {
				const userWithNullProvider = { ...verifiedUser, oauthProvider: null };
				expect(UserRules.isOAuthUser(userWithNullProvider)).toBe(false);
			});
		});

		describe("hasPassword", () => {
			it("should return true for user with password", () => {
				expect(UserRules.hasPassword(verifiedUser)).toBe(true);
			});

			it("should return false for OAuth user without password", () => {
				expect(UserRules.hasPassword(googleUser)).toBe(false);
			});

			it("should return false for user with null password", () => {
				expect(UserRules.hasPassword(unverifiedUser)).toBe(false);
			});
		});

		describe("isRegistrationComplete", () => {
			it("should return true for verified email user with password", () => {
				expect(UserRules.isRegistrationComplete(verifiedUser)).toBe(true);
			});

			it("should return true for verified OAuth user", () => {
				expect(UserRules.isRegistrationComplete(googleUser)).toBe(true);
			});

			it("should return false for unverified user", () => {
				expect(UserRules.isRegistrationComplete(unverifiedUser)).toBe(false);
			});

			it("should return false for verified user without password or OAuth", () => {
				const verifiedUserWithoutAuth = {
					...verifiedUser,
					passwordHash: null,
					oauthProvider: "email" as const
				};
				expect(UserRules.isRegistrationComplete(verifiedUserWithoutAuth)).toBe(
					false
				);
			});
		});

		describe("isActive", () => {
			it("should return true for registration complete user", () => {
				expect(UserRules.isActive(verifiedUser)).toBe(true);
			});

			it("should return false for registration incomplete user", () => {
				expect(UserRules.isActive(unverifiedUser)).toBe(false);
			});
		});

		describe("isProviderUser", () => {
			it("should return true for Google provider user", () => {
				expect(UserRules.isProviderUser(googleUser, "google")).toBe(true);
			});

			it("should return false for email provider user when checking Google", () => {
				expect(UserRules.isProviderUser(verifiedUser, "google")).toBe(false);
			});

			it("should return true for email provider user when checking email", () => {
				expect(UserRules.isProviderUser(verifiedUser, "email")).toBe(true);
			});

			it("should return false for LINE provider user when checking Google", () => {
				const lineUser = { ...googleUser, oauthProvider: "line" as const };
				expect(UserRules.isProviderUser(lineUser, "google")).toBe(false);
			});
		});
	});
});
