import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as cattleRepository from "../../repositories/cattleRepository";
import * as eventRepository from "../../repositories/eventRepository";
import eventRoutes from "../../routes/events";
import type { Bindings } from "../../types";
import {
	mockCattle,
	mockCreatedEvent,
	mockEvent,
	mockEvents,
} from "../mocks/database";

// Mock the repository modules
vi.mock("../../repositories/eventRepository");
vi.mock("../../repositories/cattleRepository");

// Mock JWT middleware
vi.mock("../../middleware/jwt", () => ({
	jwtMiddleware: vi.fn((c, next) => {
		c.set("jwtPayload", { userId: 1 });
		return next();
	}),
}));

const mockEventRepository = vi.mocked(eventRepository);
const mockCattleRepository = vi.mocked(cattleRepository);

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

	app.route("/events", eventRoutes);
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

describe("Events API Integration Tests", () => {
	let app: ReturnType<typeof createTestApp>;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	describe("GET /events", () => {
		it("should return event search results", async () => {
			// Arrange
			const mockSearchResult = {
				results: mockEvents,
				nextCursor: null,
				hasNext: false,
			};
			mockEventRepository.searchEvents.mockResolvedValue(mockSearchResult);

			// Act
			const req = createTestRequest("GET", "/events?limit=20");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockSearchResult);
		});

		it("should handle internal server error", async () => {
			// Arrange
			mockEventRepository.searchEvents.mockRejectedValue(
				new Error("Database error"),
			);

			// Act
			const req = createTestRequest("GET", "/events?limit=20");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("Database error");
		});
	});

	describe("POST /events", () => {
		const validEventData = {
			cattleId: 1,
			eventType: "ESTRUS",
			eventDatetime: "2024-01-01T10:00:00Z",
			notes: "テストイベント",
		};

		it("should create new event successfully", async () => {
			// Arrange
			mockCattleRepository.findCattleById.mockResolvedValue(mockCattle);
			mockEventRepository.createEvent.mockResolvedValue(mockCreatedEvent);
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);

			// Act
			const req = createTestRequest("POST", "/events", validEventData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data).toEqual(mockEvent);
		});

		it("should return 400 for invalid event data", async () => {
			// Act
			const req = createTestRequest("POST", "/events", {
				cattleId: "invalid",
				eventType: "INVALID_TYPE",
				eventDatetime: "invalid-date",
			});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});
	});

	describe("GET /events/:id", () => {
		it("should return specific event", async () => {
			// Arrange
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);

			// Act
			const req = createTestRequest("GET", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockEvent);
		});

		it("should return 400 for invalid event ID", async () => {
			// Act
			const req = createTestRequest("GET", "/events/invalid");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.message).toBe("無効なイベントIDです");
		});
	});

	describe("DELETE /events/:id", () => {
		it("should delete event successfully", async () => {
			// Arrange
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);
			mockEventRepository.deleteEvent.mockResolvedValue(undefined);

			// Act
			const req = createTestRequest("DELETE", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.message).toBe("イベントが正常に削除されました");
		});

		it("should return 400 for invalid event ID", async () => {
			// Act
			const req = createTestRequest("DELETE", "/events/invalid");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.message).toBe("無効なイベントIDです");
		});
	});
});
