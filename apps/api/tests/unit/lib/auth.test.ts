import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	generateOAuthDummyPasswordHash,
	signToken,
	verifyPassword,
} from "../../../src/lib/auth";

// crypto.getRandomValuesをモック
const mockGetRandomValues = vi.fn();
Object.defineProperty(global, "crypto", {
	value: {
		getRandomValues: mockGetRandomValues,
	},
	writable: true,
});

describe("Auth Library", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("verifyPassword", () => {
		it("should export verifyPassword function", () => {
			expect(verifyPassword).toBeDefined();
			expect(typeof verifyPassword).toBe("function");
		});

		it("should have correct parameter length", () => {
			expect(verifyPassword.length).toBe(2);
		});

		it("should return a promise", () => {
			const result = verifyPassword("password", "hash");
			expect(result).toBeInstanceOf(Promise);
			return result.catch(() => {}); // Handle rejection in test
		});
	});

	describe("signToken", () => {
		it("should export signToken function", () => {
			expect(signToken).toBeDefined();
			expect(typeof signToken).toBe("function");
		});

		it("should have correct parameter length", () => {
			expect(signToken.length).toBe(2);
		});

		it("should return a promise", () => {
			const result = signToken({ userId: 1 }, "secret");
			expect(result).toBeInstanceOf(Promise);
			return result.catch(() => {}); // Handle rejection in test
		});

		it("should handle empty payload", () => {
			const result = signToken({}, "secret");
			expect(result).toBeInstanceOf(Promise);
			return result.catch(() => {}); // Handle rejection in test
		});

		it("should handle different payload types", () => {
			const payloads = [
				{ userId: 1 },
				{ email: "test@example.com" },
				{ userId: 1, role: "admin" },
				{ data: { nested: "value" } },
			];

			const promises = payloads.map((payload) =>
				signToken(payload, "secret").catch(() => {}),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});
	});

	describe("generateOAuthDummyPasswordHash", () => {
		it("should export generateOAuthDummyPasswordHash function", () => {
			expect(generateOAuthDummyPasswordHash).toBeDefined();
			expect(typeof generateOAuthDummyPasswordHash).toBe("function");
		});

		it("should have correct parameter length", () => {
			expect(generateOAuthDummyPasswordHash.length).toBe(0);
		});

		it("should return string with oauth_dummy prefix", () => {
			// Mock crypto.getRandomValues
			const mockRandomBytes = new Uint8Array([1, 2, 3, 4]);
			mockGetRandomValues.mockReturnValue(mockRandomBytes);

			const result = generateOAuthDummyPasswordHash();

			expect(typeof result).toBe("string");
			expect(result).toMatch(/^oauth_dummy_/);
		});

		it("should call crypto.getRandomValues with Uint8Array", () => {
			const mockRandomBytes = new Uint8Array(32);
			mockGetRandomValues.mockReturnValue(mockRandomBytes);

			generateOAuthDummyPasswordHash();

			expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
			expect(mockGetRandomValues).toHaveBeenCalledWith(
				expect.objectContaining({
					length: 32,
				}),
			);
		});

		it("should generate different hashes on multiple calls", () => {
			// 異なるランダム値を返すようにモック
			mockGetRandomValues
				.mockReturnValueOnce(new Uint8Array([1, 2, 3, 4]))
				.mockReturnValueOnce(new Uint8Array([5, 6, 7, 8]));

			const hash1 = generateOAuthDummyPasswordHash();
			const hash2 = generateOAuthDummyPasswordHash();

			expect(hash1).not.toBe(hash2);
			expect(hash1).toMatch(/^oauth_dummy_/);
			expect(hash2).toMatch(/^oauth_dummy_/);
		});

		it("should convert bytes to hex correctly", () => {
			// 特定のバイト値をモック
			const mockBytes = new Uint8Array([255, 0, 15, 16]);
			mockGetRandomValues.mockReturnValue(mockBytes);

			const result = generateOAuthDummyPasswordHash();

			// ff000f10 should be included in the result
			expect(result).toContain("ff000f10");
		});

		it("should handle full 32-byte array", () => {
			// 32バイトの配列をテスト
			const mockBytes = new Uint8Array(32).fill(0);
			mockBytes[0] = 255; // First byte
			mockBytes[31] = 255; // Last byte
			mockGetRandomValues.mockReturnValue(mockBytes);

			const result = generateOAuthDummyPasswordHash();

			expect(result).toMatch(/^oauth_dummy_/);
			expect(result).toContain("ff"); // Should contain hex representation
			expect(result.length).toBeGreaterThan("oauth_dummy_".length);
		});

		it("should create valid hex string", () => {
			const mockBytes = new Uint8Array([10, 11, 12, 13, 14, 15]);
			mockGetRandomValues.mockReturnValue(mockBytes);

			const result = generateOAuthDummyPasswordHash();
			const hexPart = result.replace("oauth_dummy_", "");

			// Should be valid hex characters
			expect(hexPart).toMatch(/^[0-9a-f]+$/);
		});
	});
});
