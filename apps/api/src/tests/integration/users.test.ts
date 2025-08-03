import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userRoutes from "../../routes/users";
import * as userService from "../../services/userService";
import type { Bindings } from "../../types";
import { mockUser } from "../mocks/database";

// Mock the service module
vi.mock("../../services/userService");

// Mock JWT middleware
vi.mock("../../middleware/jwt", () => ({
	jwtMiddleware: vi.fn((c, next) => {
		c.set("jwtPayload", { userId: 1 });
		return next();
	}),
}));

const mockUserService = vi.mocked(userService);

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
		};
		await next();
	});

	app.route("/users", userRoutes);
	return app;
};

// Helper function to create test requests
const createTestRequest = (method: string, url: string) => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	return new Request(`http://localhost${url}`, {
		method,
		headers,
	});
};

describe("Users API Integration Tests", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	describe("GET /users/:id", () => {
		it("should return user details", async () => {
			// Arrange
			mockUserService.getUserById.mockResolvedValue(mockUser);

			// Act
			const req = createTestRequest("GET", "/users/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockUser);
			expect(mockUserService.getUserById).toHaveBeenCalledWith(
				expect.anything(),
				1,
			);
		});

		it("should return 404 when user not found", async () => {
			// Arrange
			// @ts-expect-error: Service can return null for not found
			mockUserService.getUserById.mockResolvedValue(null);

			// Act
			const req = createTestRequest("GET", "/users/999");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.error).toBe("User not found");
		});

		it("should return 400 for invalid user ID", async () => {
			// Act
			const req = createTestRequest("GET", "/users/invalid");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});

		it("should handle internal server error", async () => {
			// Arrange
			mockUserService.getUserById.mockRejectedValue(
				new Error("Database error"),
			);

			// Act
			const req = createTestRequest("GET", "/users/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.error).toBe("Internal Server Error");
		});
	});
});
