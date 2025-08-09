import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import healthRoutes from "../../../src/routes/health";
import type { Bindings } from "../../../src/types";

// Create test app
const createTestApp = () => {
	const app = new Hono<{ Bindings: Bindings }>();

	// Mock environment variables
	app.use("*", async (c, next) => {
		c.env = {
			DB: {},
			JWT_SECRET: "test-secret",
			ENVIRONMENT: "test",
			APP_URL: "http://localhost:3000",
			GOOGLE_CLIENT_ID: "test-client-id",
			GOOGLE_CLIENT_SECRET: "test-client-secret",
		};
		await next();
	});

	app.route("/health", healthRoutes);
	return app;
};

// Helper function to create test requests
const createTestRequest = (method: string, url: string) => {
	return new Request(`http://localhost${url}`, {
		method,
	});
};

describe("Health API Integration Tests", () => {
	const app = createTestApp();

	describe("GET /health", () => {
		it("should return health status", async () => {
			// Arrange
			const now = new Date("2024-01-01T00:00:00.000Z");
			vi.setSystemTime(now);

			// Act
			const req = createTestRequest("GET", "/health");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual({
				status: "ok",
				timestamp: now.toISOString(),
			});

			// Cleanup
			vi.useRealTimers();
		});
	});
});
