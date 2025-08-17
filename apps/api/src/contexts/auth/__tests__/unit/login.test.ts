import { describe, expect, it, vi } from "vitest";
import type { TokenPort } from "../../../shared/ports/token";
import { login } from "../../domain/services/login";
import type { AuthRepoPort } from "../../ports";

describe("Auth domain - login use case", () => {
	it("returns Unauthorized when user not found", async () => {
		const deps = {
			repo: {
				findUserByEmail: vi.fn().mockResolvedValue(null)
			} as unknown as AuthRepoPort,
			token: { sign: vi.fn(), verify: vi.fn() } as unknown as TokenPort
		};
		const result = await login(deps)({ email: "a@example.com", password: "x" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.type).toBe("Unauthorized");
	});

	it("returns token on success", async () => {
		const deps = {
			repo: {
				findUserByEmail: vi.fn().mockResolvedValue({
					id: 1 as unknown as number,
					userName: "u",
					email: "a@example.com",
					isVerified: true,
					passwordHash: "$2a$10$hash",
					googleId: null,
					lineId: null,
					oauthProvider: "email",
					avatarUrl: null,
					lastLoginAt: null,
					theme: null,
					createdAt: "",
					updatedAt: ""
				}),
				updateLastLoginAt: vi.fn().mockResolvedValue(undefined)
			} as unknown as AuthRepoPort,
			token: {
				sign: vi.fn().mockResolvedValue("tkn"),
				verify: vi.fn()
			} as unknown as TokenPort
		};
		const result = await login({
			...deps,
			verifyPassword: vi.fn().mockResolvedValue(true)
		})({ email: "a@example.com", password: "x" });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.token).toBe("tkn");
	});

	it("rejects oauth dummy password user", async () => {
		const deps = {
			repo: {
				findUserByEmail: vi.fn().mockResolvedValue({
					id: 1 as unknown as number,
					userName: "u",
					email: "a@example.com",
					isVerified: true,
					passwordHash: "oauth_dummy_xxx",
					googleId: null,
					lineId: null,
					oauthProvider: "google",
					avatarUrl: null,
					lastLoginAt: null,
					theme: null,
					createdAt: "",
					updatedAt: ""
				})
			} as unknown as AuthRepoPort,
			token: { sign: vi.fn(), verify: vi.fn() } as unknown as TokenPort
		};
		const result = await login(deps)({ email: "a@example.com", password: "x" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.message).toMatch(/Googleログイン/);
	});

	it("rejects when user has no password hash", async () => {
		const deps = {
			repo: {
				findUserByEmail: vi.fn().mockResolvedValue({
					id: 1 as unknown as number,
					userName: "u",
					email: "a@example.com",
					isVerified: true,
					passwordHash: null,
					googleId: null,
					lineId: null,
					oauthProvider: "email",
					avatarUrl: null,
					lastLoginAt: null,
					theme: null,
					createdAt: "",
					updatedAt: ""
				})
			} as unknown as AuthRepoPort,
			token: { sign: vi.fn(), verify: vi.fn() } as unknown as TokenPort
		};
		const result = await login(deps)({ email: "a@example.com", password: "x" });
		expect(result.ok).toBe(false);
		if (!result.ok)
			expect(result.error.message).toMatch(
				/メールアドレスまたはパスワードもしくはログイン方法が正しくありません/
			);
	});

	it("rejects when password is invalid", async () => {
		const deps = {
			repo: {
				findUserByEmail: vi.fn().mockResolvedValue({
					id: 1 as unknown as number,
					userName: "u",
					email: "a@example.com",
					isVerified: true,
					passwordHash: "$2a$10$hash",
					googleId: null,
					lineId: null,
					oauthProvider: "email",
					avatarUrl: null,
					lastLoginAt: null,
					theme: null,
					createdAt: "",
					updatedAt: ""
				})
			} as unknown as AuthRepoPort,
			token: { sign: vi.fn(), verify: vi.fn() } as unknown as TokenPort,
			verifyPassword: vi.fn().mockResolvedValue(false)
		};
		const result = await login(deps)({ email: "a@example.com", password: "x" });
		expect(result.ok).toBe(false);
		if (!result.ok)
			expect(result.error.message).toMatch(
				/メールアドレスまたはパスワードが正しくありません/
			);
	});
});
