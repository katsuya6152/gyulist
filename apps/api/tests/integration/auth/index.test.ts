import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authRoutes from "../../../src/routes/auth";
import * as authService from "../../../src/services/authService";
import type { Bindings } from "../../../src/types";

// Mock the service module
vi.mock("../../../src/services/authService");

const mockAuthService = vi.mocked(authService);

// Create test app
const createTestApp = () => {
	const app = new Hono<{ Bindings: Bindings }>();

	// Mock environment variables
	app.use("*", async (c, next) => {
		c.env = {
			DB: {} as AnyD1Database,
			JWT_SECRET: "test-secret",
			ENVIRONMENT: "test",
			APP_URL: "http://localhost:3000",
			GOOGLE_CLIENT_ID: "test-client-id",
			GOOGLE_CLIENT_SECRET: "test-client-secret",
			RESEND_API_KEY: "",
			MAIL_FROM: "",
			TURNSTILE_SECRET_KEY: "",
			ADMIN_USER: "a",
			ADMIN_PASS: "b",
			WEB_ORIGIN: "http://localhost:3000",
		};
		await next();
	});

	app.route("/auth", authRoutes);
	return app;
};

// Helper function to create test requests
const createTestRequest = (method: string, url: string, body?: unknown) => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	return new Request(`http://localhost${url}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});
};

describe("Auth API Integration Tests", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	describe("POST /auth/register", () => {
		const validRegisterData = {
			email: "test@example.com",
			userName: "Test User",
		};

		it("should register user successfully", async () => {
			// Arrange
			const mockResult = { success: true, message: "Registration email sent" };
			mockAuthService.register.mockResolvedValue(mockResult);

			// Act
			const req = createTestRequest(
				"POST",
				"/auth/register",
				validRegisterData,
			);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockResult);
		});

		it("should return 400 for invalid registration data", async () => {
			// Act
			const req = createTestRequest("POST", "/auth/register", {
				email: "invalid-email",
			});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});
	});

	describe("POST /auth/verify", () => {
		const validVerifyData = {
			token: "valid-verification-token",
		};

		it("should verify token successfully", async () => {
			// Arrange
			const mockResult = { success: true, message: "Token verified" };
			mockAuthService.verifyToken.mockResolvedValue(mockResult);

			// Act
			const req = createTestRequest("POST", "/auth/verify", validVerifyData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockResult);
		});

		it("should return 400 for invalid token data", async () => {
			// Act
			const req = createTestRequest("POST", "/auth/verify", {});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});
	});

	describe("POST /auth/complete", () => {
		const validCompleteData = {
			token: "valid-verification-token",
			name: "Test User",
			password: "StrongPassword123!",
		};

		it("should complete registration successfully", async () => {
			// Arrange
			const mockResult = { success: true, message: "Registration completed" };
			mockAuthService.completeRegistration.mockResolvedValue(mockResult);

			// Act
			const req = createTestRequest(
				"POST",
				"/auth/complete",
				validCompleteData,
			);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockResult);
		});

		it("should return 400 for invalid completion data", async () => {
			// Act
			const req = createTestRequest("POST", "/auth/complete", {
				token: "valid-token",
				password: "123", // too short
			});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});
	});

	describe("POST /auth/login", () => {
		const validLoginData = {
			email: "test@example.com",
			password: "StrongPassword123!",
		};

		it("should login successfully", async () => {
			// Arrange
			const mockResult = {
				success: true,
				token: "jwt-token",
			};
			mockAuthService.login.mockResolvedValue(mockResult);

			// Act
			const req = createTestRequest("POST", "/auth/login", validLoginData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual({ token: mockResult.token });
		});

		it("should return 401 for invalid credentials", async () => {
			// Arrange
			const mockResult = {
				success: false,
				message: "Invalid credentials",
			};
			mockAuthService.login.mockResolvedValue(mockResult);

			// Act
			const req = createTestRequest("POST", "/auth/login", validLoginData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.error).toBe("Invalid credentials");
		});

		it("should return 400 for invalid login data", async () => {
			// Act
			const req = createTestRequest("POST", "/auth/login", {
				email: "invalid-email",
			});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});

		it("should handle internal server error", async () => {
			// Arrange
			mockAuthService.login.mockRejectedValue(new Error("Database error"));

			// Act
			const req = createTestRequest("POST", "/auth/login", validLoginData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.error).toBe("Internal Server Error");
		});
	});
});
