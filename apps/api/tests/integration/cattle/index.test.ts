import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import cattleRoutes from "../../../src/routes/cattle";
import * as cattleService from "../../../src/services/cattleService";
import type { Bindings } from "../../../src/types";
import { mockCattle } from "../../fixtures/database";

// Mock the service module
vi.mock("../../../src/services/cattleService");

// Mock JWT middleware
vi.mock("../../../src/middleware/jwt", () => ({
	jwtMiddleware: vi.fn((c, next) => {
		c.set("jwtPayload", { userId: 1 });
		return next();
	}),
}));

const mockCattleService = vi.mocked(cattleService);

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
		};
		await next();
	});

	app.route("/cattle", cattleRoutes);
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

describe("Cattle API Integration Tests", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	describe("GET /cattle", () => {
		it("should return cattle list", async () => {
			// Arrange
			const mockSearchResult = {
				results: [mockCattle],
				next_cursor: null,
				has_next: false,
			};
			mockCattleService.searchCattleList.mockResolvedValue(mockSearchResult);

			// Act
			const req = createTestRequest("GET", "/cattle?limit=20");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockSearchResult);
		});

		it("should handle internal server error", async () => {
			// Arrange
			mockCattleService.searchCattleList.mockRejectedValue(
				new Error("Database error"),
			);

			// Act
			const req = createTestRequest("GET", "/cattle?limit=20");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("Internal Server Error");
		});
	});

	describe("GET /cattle/:id", () => {
		it("should return specific cattle", async () => {
			// Arrange
			mockCattleService.getCattleById.mockResolvedValue(mockCattle);

			// Act
			const req = createTestRequest("GET", "/cattle/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockCattle);
		});

		it("should return 404 when cattle not found", async () => {
			// Arrange
			mockCattleService.getCattleById.mockResolvedValue(null);

			// Act
			const req = createTestRequest("GET", "/cattle/999");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.error).toBe("Cattle not found");
		});

		it("should return 403 when unauthorized", async () => {
			// Arrange
			const unauthorizedCattle = { ...mockCattle, ownerUserId: 2 };
			mockCattleService.getCattleById.mockResolvedValue(unauthorizedCattle);

			// Act
			const req = createTestRequest("GET", "/cattle/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.error).toBe("Unauthorized");
		});
	});

	describe("POST /cattle", () => {
		const validCattleData = {
			identificationNumber: 1001,
			earTagNumber: 1234,
			name: "テスト牛",
			gender: "オス",
			birthday: "2023-01-01",
			growthStage: "CALF" as const,
			breed: null,
			notes: null,
		};

		it("should create new cattle successfully", async () => {
			// Arrange
			mockCattleService.createNewCattle.mockResolvedValue(mockCattle);

			// Act
			const req = createTestRequest("POST", "/cattle", validCattleData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data).toEqual(mockCattle);
			expect(mockCattleService.createNewCattle).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ ...validCattleData, ownerUserId: 1 }),
			);
		});

		it("should return 400 for invalid cattle data", async () => {
			// Act
			const req = createTestRequest("POST", "/cattle", {
				identificationNumber: "invalid",
				name: 123, // wrong type
			});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});
	});

	describe("PATCH /cattle/:id", () => {
		const updateData = {
			name: "更新された牛の名前",
		};

		it("should update cattle successfully", async () => {
			// Arrange
			mockCattleService.getCattleById.mockResolvedValue(mockCattle);
			mockCattleService.updateCattleData.mockResolvedValue({
				...mockCattle,
				name: "更新された牛の名前",
			});

			// Act
			const req = createTestRequest("PATCH", "/cattle/1", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.name).toBe("更新された牛の名前");
		});

		it("should return 404 when cattle not found", async () => {
			// Arrange
			mockCattleService.getCattleById.mockResolvedValue(null);

			// Act
			const req = createTestRequest("PATCH", "/cattle/999", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.error).toBe("Cattle not found");
		});

		it("should return 403 when unauthorized", async () => {
			// Arrange
			const unauthorizedCattle = { ...mockCattle, ownerUserId: 2 };
			mockCattleService.getCattleById.mockResolvedValue(unauthorizedCattle);

			// Act
			const req = createTestRequest("PATCH", "/cattle/1", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.error).toBe("Unauthorized");
		});
	});

	describe("DELETE /cattle/:id", () => {
		it("should delete cattle successfully", async () => {
			// Arrange
			mockCattleService.getCattleById.mockResolvedValue(mockCattle);
			mockCattleService.deleteCattleData.mockResolvedValue(undefined);

			// Act
			const req = createTestRequest("DELETE", "/cattle/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.message).toBe("Cattle deleted successfully");
		});

		it("should return 404 when cattle not found", async () => {
			// Arrange
			mockCattleService.getCattleById.mockResolvedValue(null);

			// Act
			const req = createTestRequest("DELETE", "/cattle/999");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.error).toBe("Cattle not found");
		});

		it("should return 403 when unauthorized", async () => {
			// Arrange
			const unauthorizedCattle = { ...mockCattle, ownerUserId: 2 };
			mockCattleService.getCattleById.mockResolvedValue(unauthorizedCattle);

			// Act
			const req = createTestRequest("DELETE", "/cattle/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.error).toBe("Unauthorized");
		});
	});
});
