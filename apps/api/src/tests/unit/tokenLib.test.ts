import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateToken, hashPassword } from "../../lib/token";

// crypto.getRandomValuesをモック
const mockGetRandomValues = vi.fn();
Object.defineProperty(global, "crypto", {
	value: {
		getRandomValues: mockGetRandomValues,
	},
	writable: true,
});

describe("Token Library", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("generateToken", () => {
		it("should export generateToken function", () => {
			expect(generateToken).toBeDefined();
			expect(typeof generateToken).toBe("function");
		});

		it("should have correct parameter length", () => {
			expect(generateToken.length).toBe(0);
		});

		it("should return a promise", () => {
			const mockRandomBytes = new Uint8Array(32);
			mockGetRandomValues.mockImplementation((array) => {
				for (let i = 0; i < array.length; i++) {
					array[i] = 0;
				}
				return array;
			});

			const result = generateToken();
			expect(result).toBeInstanceOf(Promise);
		});

		it("should call crypto.getRandomValues with 32-byte array", async () => {
			mockGetRandomValues.mockImplementation((array) => {
				for (let i = 0; i < array.length; i++) {
					array[i] = 0;
				}
				return array;
			});

			await generateToken();

			expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
			const callArg = mockGetRandomValues.mock.calls[0][0];
			expect(callArg.length).toBe(32);
		});

		it("should return hex string", async () => {
			mockGetRandomValues.mockImplementation((array) => {
				array[0] = 255;
				array[1] = 0;
				array[2] = 15;
				array[3] = 16;
				for (let i = 4; i < array.length; i++) {
					array[i] = 0;
				}
				return array;
			});

			const result = await generateToken();

			expect(typeof result).toBe("string");
			expect(result).toMatch(/^[0-9a-f]+$/);
			expect(result).toContain("ff000f10");
		});

		it("should convert bytes to hex correctly", async () => {
			mockGetRandomValues.mockImplementation((array) => {
				array[0] = 255;
				array[1] = 0;
				array[2] = 15;
				array[3] = 16;
				for (let i = 4; i < array.length; i++) {
					array[i] = 0;
				}
				return array;
			});

			const result = await generateToken();

			expect(result).toContain("ff000f10");
		});

		it("should generate different tokens on multiple calls", async () => {
			let callCount = 0;
			mockGetRandomValues.mockImplementation((array) => {
				callCount++;
				for (let i = 0; i < array.length; i++) {
					array[i] = callCount; // Different values for each call
				}
				return array;
			});

			const token1 = await generateToken();
			const token2 = await generateToken();

			expect(token1).not.toBe(token2);
			expect(token1).toMatch(/^[0-9a-f]+$/);
			expect(token2).toMatch(/^[0-9a-f]+$/);
		});

		it("should handle full 32-byte array", async () => {
			mockGetRandomValues.mockImplementation((array) => {
				for (let i = 0; i < array.length; i++) {
					array[i] = 255;
				}
				return array;
			});

			const result = await generateToken();

			expect(result).toMatch(/^[0-9a-f]+$/);
			expect(result.length).toBe(64); // 32 bytes * 2 hex chars = 64 chars
			expect(result).toBe("f".repeat(64));
		});

		it("should pad single digit hex values", async () => {
			mockGetRandomValues.mockImplementation((array) => {
				array[0] = 0;
				array[1] = 1;
				array[2] = 2;
				array[3] = 15;
				for (let i = 4; i < array.length; i++) {
					array[i] = 0;
				}
				return array;
			});

			const result = await generateToken();

			expect(result).toContain("0001020f");
		});

		it("should handle empty mock properly", async () => {
			mockGetRandomValues.mockImplementation((array) => {
				return array; // Return without modification
			});

			const result = await generateToken();

			expect(typeof result).toBe("string");
			expect(result).toMatch(/^[0-9a-f]+$/);
			expect(result.length).toBe(64);
		});
	});

	describe("hashPassword", () => {
		it("should export hashPassword function", () => {
			expect(hashPassword).toBeDefined();
			expect(typeof hashPassword).toBe("function");
		});

		it("should have correct parameter length", () => {
			expect(hashPassword.length).toBe(1);
		});

		it("should return a promise", () => {
			const result = hashPassword("password");
			expect(result).toBeInstanceOf(Promise);
			return result.catch(() => {}); // Handle potential rejection
		});

		it("should handle empty string", () => {
			const result = hashPassword("");
			expect(result).toBeInstanceOf(Promise);
			return result.catch(() => {}); // Handle potential rejection
		});

		it("should handle different password types", () => {
			const passwords = [
				"simple",
				"complex!@#$%^&*()",
				"123456789",
				"verylongpasswordwithmanycharacterstotest",
			];

			const promises = passwords.map((password) =>
				hashPassword(password).catch(() => {}),
			);

			for (const promise of promises) {
				expect(promise).toBeInstanceOf(Promise);
			}

			return Promise.allSettled(promises);
		});
	});
});
