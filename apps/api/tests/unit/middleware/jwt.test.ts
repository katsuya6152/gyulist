import type { Context, Next } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jwtMiddleware } from "../../../src/middleware/jwt";

// atobをモック
global.atob = vi.fn();

// console.errorをモック
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("JWT Middleware", () => {
	let mockContext: Partial<Context>;
	let mockNext: Next;

	beforeEach(() => {
		vi.clearAllMocks();
		consoleSpy.mockClear();

		mockNext = vi.fn().mockResolvedValue(undefined);

		mockContext = {
			req: {
				header: vi.fn()
			} as unknown as Context["req"],
			env: {
				JWT_SECRET: "test-secret",
				DB: {},
				ENVIRONMENT: "test",
				APP_URL: "http://localhost:3000",
				GOOGLE_CLIENT_ID: "test-client-id",
				GOOGLE_CLIENT_SECRET: "test-client-secret"
			},
			json: vi.fn().mockReturnValue("json-response"),
			set: vi.fn()
		} as Partial<Context>;
	});

	describe("exports", () => {
		it("should export jwtMiddleware function", () => {
			expect(jwtMiddleware).toBeDefined();
			expect(typeof jwtMiddleware).toBe("function");
		});
	});

	describe("authentication flow", () => {
		it("should return 401 when no Authorization header is provided", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue(undefined);

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "No token provided" },
				401
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when Authorization header is empty", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("");

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "No token provided" },
				401
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when Authorization header is null", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue(null);

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "No token provided" },
				401
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should handle Bearer token format", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer token123");

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			// Will fail JWT verification and try OAuth fallback
			expect(result).toBe("json-response");
		});

		it("should handle token without Bearer prefix", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("just-token");

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			// Will fail JWT verification and try OAuth fallback
			expect(result).toBe("json-response");
		});
	});

	describe("OAuth JWT fallback", () => {
		it("should return 401 for invalid token format (not 3 parts)", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer invalid.token");

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token format" },
				401
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 for token with too many parts", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer part1.part2.part3.part4");

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token format" },
				401
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should successfully decode valid OAuth JWT token", async () => {
			const payload = { userId: 1, exp: Date.now() / 1000 + 3600 };

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(JSON.stringify(payload));

			await jwtMiddleware(mockContext as Context, mockNext);

			expect(atob).toHaveBeenCalledWith("payload");
			expect(mockContext.set).toHaveBeenCalledWith("jwtPayload", payload);
			expect(mockNext).toHaveBeenCalled();
		});

		it("should return 401 for expired OAuth token", async () => {
			const expiredPayload = { userId: 1, exp: Date.now() / 1000 - 3600 }; // 1 hour ago

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(JSON.stringify(expiredPayload));

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Token expired" },
				401
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 for OAuth token without userId", async () => {
			const payloadWithoutUserId = { exp: Date.now() / 1000 + 3600 };

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(JSON.stringify(payloadWithoutUserId));

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token payload" },
				401
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should handle OAuth token without expiration", async () => {
			const payloadWithoutExp = { userId: 1 };

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(JSON.stringify(payloadWithoutExp));

			await jwtMiddleware(mockContext as Context, mockNext);

			expect(mockContext.set).toHaveBeenCalledWith(
				"jwtPayload",
				payloadWithoutExp
			);
			expect(mockNext).toHaveBeenCalled();
		});

		it("should return 401 for invalid JSON in OAuth token payload", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue("invalid-json");

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token" },
				401
			);
			expect(consoleSpy).toHaveBeenCalledTimes(1); // Simplified JWT error logging
		});

		it("should return 401 when atob throws error", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockImplementation(() => {
				throw new Error("Invalid base64");
			});

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token" },
				401
			);
			expect(consoleSpy).toHaveBeenCalledTimes(1); // Simplified JWT error logging
		});

		it("should handle OAuth token with userId as 0", async () => {
			const payloadWithZeroUserId = {
				userId: 0,
				exp: Date.now() / 1000 + 3600
			};

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(JSON.stringify(payloadWithZeroUserId));

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			// userId: 0 should be considered falsy and invalid
			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token payload" },
				401
			);
		});

		it("should handle OAuth token with string userId", async () => {
			const payloadWithStringUserId = {
				userId: "123",
				exp: Date.now() / 1000 + 3600
			};

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(JSON.stringify(payloadWithStringUserId));

			await jwtMiddleware(mockContext as Context, mockNext);

			expect(mockContext.set).toHaveBeenCalledWith(
				"jwtPayload",
				payloadWithStringUserId
			);
			expect(mockNext).toHaveBeenCalled();
		});

		it("should handle empty Bearer token", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer ");

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			// Should fall back to OAuth flow and fail with invalid format
			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token format" },
				401
			);
		});

		it("should handle token with extra spaces", async () => {
			const payload = { userId: 1 };

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer   header.payload.signature  ");
			vi.mocked(atob).mockReturnValue(JSON.stringify(payload));

			await jwtMiddleware(mockContext as Context, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe("edge cases", () => {
		it("should handle malformed base64 in payload", async () => {
			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.malformed-base64.signature");
			vi.mocked(atob).mockImplementation(() => {
				throw new Error("Invalid character");
			});

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token" },
				401
			);
		});

		it("should handle payload with null userId", async () => {
			const payloadWithNullUserId = {
				userId: null,
				exp: Date.now() / 1000 + 3600
			};

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(JSON.stringify(payloadWithNullUserId));

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token payload" },
				401
			);
		});

		it("should handle payload with undefined userId", async () => {
			const payloadWithUndefinedUserId = { exp: Date.now() / 1000 + 3600 };

			(
				mockContext.req as unknown as { header: ReturnType<typeof vi.fn> }
			).header.mockReturnValue("Bearer header.payload.signature");
			vi.mocked(atob).mockReturnValue(
				JSON.stringify(payloadWithUndefinedUserId)
			);

			const result = await jwtMiddleware(mockContext as Context, mockNext);

			expect(result).toBe("json-response");
			expect(mockContext.json).toHaveBeenCalledWith(
				{ error: "Invalid token payload" },
				401
			);
		});
	});
});
