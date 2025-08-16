import { describe, expect, it, vi } from "vitest";
import type { TokenPort } from "../../../../shared/ports/token";
import type { User } from "../../domain/model/user";
import { complete } from "../../domain/services/complete";
import { register } from "../../domain/services/register";
import { verify } from "../../domain/services/verify";
import type { AuthRepoPort } from "../../ports";

const createDeps = (overrides: Partial<AuthRepoPort> = {}) => {
	const repo: AuthRepoPort = {
		findUserById: vi.fn(),
		findUserByEmail: vi.fn().mockResolvedValue(null),
		createUser: vi.fn().mockResolvedValue(undefined),
		findUserByVerificationToken: vi.fn().mockResolvedValue(null),
		completeUserRegistration: vi.fn().mockResolvedValue(undefined),
		updateLastLoginAt: vi.fn().mockResolvedValue(undefined),
		updateUserTheme: vi.fn().mockResolvedValue(undefined),
		...overrides
	};
	const token: TokenPort = {
		sign: async () => "token",
		verify: async () => null
	};
	return { repo, token };
};

describe("Auth domain - register/verify/complete", () => {
	it("register returns success regardless of existing user", async () => {
		const base: User = {
			id: 1 as unknown as User["id"],
			userName: "u",
			email: "a@ex.com",
			isVerified: false,
			passwordHash: "",
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			lastLoginAt: null,
			theme: null,
			createdAt: "",
			updatedAt: ""
		};
		const { repo, token } = createDeps({
			findUserByEmail: vi.fn().mockResolvedValue(base)
		});
		const result = await register({
			repo,
			token,
			generateVerificationToken: () => "tok"
		})({ email: "a@ex.com" });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.success).toBe(true);
	});

	it("register returns InfraError when repo throws", async () => {
		const { repo, token } = createDeps({
			findUserByEmail: vi.fn().mockResolvedValue(null),
			createUser: vi.fn().mockRejectedValue(new Error("db error"))
		});
		const result = await register({ repo, token })({ email: "a@ex.com" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.type).toBe("InfraError");
	});

	it("verify returns false when token invalid", async () => {
		const { repo, token } = createDeps();
		const result = await verify({ repo, token })({ token: "x" });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.success).toBe(false);
	});

	it("verify returns false when already verified", async () => {
		const base: User = {
			id: 1 as unknown as User["id"],
			userName: "u",
			email: "a@ex.com",
			isVerified: true,
			passwordHash: "",
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			lastLoginAt: null,
			theme: null,
			createdAt: "",
			updatedAt: ""
		};
		const { repo, token } = createDeps({
			findUserByVerificationToken: vi.fn().mockResolvedValue(base)
		});
		const result = await verify({ repo, token })({ token: "validtoken1234" });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.success).toBe(false);
	});

	it("complete returns success on valid token and updates user", async () => {
		const base: User = {
			id: 1 as unknown as User["id"],
			userName: "u",
			email: "a@ex.com",
			isVerified: false,
			passwordHash: "",
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			lastLoginAt: null,
			theme: null,
			createdAt: "",
			updatedAt: ""
		};
		const { repo, token } = createDeps({
			findUserByVerificationToken: vi.fn().mockResolvedValue(base),
			completeUserRegistration: vi.fn().mockResolvedValue(undefined)
		});
		const result = await complete({
			repo,
			token,
			hashPassword: async () => "hashed"
		})({ token: "t1234567890", name: "u", password: "p123456" });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.success).toBe(true);
	});

	it("complete returns InfraError when repo throws", async () => {
		const base: User = {
			id: 1 as unknown as User["id"],
			userName: "u",
			email: "a@ex.com",
			isVerified: false,
			passwordHash: "",
			googleId: null,
			lineId: null,
			oauthProvider: "email",
			avatarUrl: null,
			lastLoginAt: null,
			theme: null,
			createdAt: "",
			updatedAt: ""
		};
		const { repo, token } = createDeps({
			findUserByVerificationToken: vi.fn().mockResolvedValue(base),
			completeUserRegistration: vi.fn().mockRejectedValue(new Error("db error"))
		});
		const result = await complete({
			repo,
			token,
			hashPassword: async () => "hashed"
		})({ token: "t1234567890", name: "u", password: "p123456" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.type).toBe("InfraError");
	});
});
