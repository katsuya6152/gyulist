import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import eventRoutes from "../../../src/routes/events";
import * as eventService from "../../../src/services/eventService";
import type { Bindings } from "../../../src/types";
import { mockEvent, mockEvents } from "../../fixtures/database";

// Mock the service module
vi.mock("../../../src/services/eventService");

// Mock JWT middleware
vi.mock("../../../src/middleware/jwt", () => ({
	jwtMiddleware: vi.fn((c, next) => {
		c.set("jwtPayload", { userId: 1 });
		return next();
	}),
}));

const mockEventService = vi.mocked(eventService);

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
		it("should return event list", async () => {
			// Arrange
			const mockResult = {
				results: mockEvents,
				nextCursor: null,
				hasNext: false,
			};
			mockEventService.searchEventList.mockResolvedValue(mockResult);

			// Act
			const req = createTestRequest("GET", "/events?limit=20");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockResult);
		});

		it("should handle validation error for invalid query", async () => {
			// Act
			const req = createTestRequest("GET", "/events?limit=invalid");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});

		it("should handle internal server error", async () => {
			// Arrange
			mockEventService.searchEventList.mockRejectedValue(
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

		it("should handle internal server error with non-Error object", async () => {
			// Arrange
			mockEventService.searchEventList.mockRejectedValue("Database error");

			// Act
			const req = createTestRequest("GET", "/events?limit=20");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("内部サーバーエラーが発生しました");
		});
	});

	describe("GET /events/cattle/:cattleId", () => {
		it("should return events for specific cattle", async () => {
			// Arrange
			mockEventService.getEventsByCattleId.mockResolvedValue(mockEvents);

			// Act
			const req = createTestRequest("GET", "/events/cattle/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.results).toEqual(mockEvents);
		});

		it("should handle invalid cattle ID", async () => {
			// Act
			const req = createTestRequest("GET", "/events/cattle/invalid");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.message).toBe("無効な牛IDです");
		});

		it("should handle not found error", async () => {
			// Arrange
			mockEventService.getEventsByCattleId.mockRejectedValue(
				new Error("牛が見つからないか、アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("GET", "/events/cattle/999");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.message).toBe("牛が見つからないか、アクセス権限がありません");
		});

		it("should handle unauthorized access", async () => {
			// Arrange
			mockEventService.getEventsByCattleId.mockRejectedValue(
				new Error("アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("GET", "/events/cattle/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.message).toBe("アクセス権限がありません");
		});

		it("should handle internal server error with non-Error object for cattle events", async () => {
			// Arrange
			mockEventService.getEventsByCattleId.mockRejectedValue("Database error");

			// Act
			const req = createTestRequest("GET", "/events/cattle/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("内部サーバーエラーが発生しました");
		});
	});

	describe("GET /events/:id", () => {
		it("should return specific event", async () => {
			// Arrange
			mockEventService.getEventById.mockResolvedValue(mockEvent);

			// Act
			const req = createTestRequest("GET", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data).toEqual(mockEvent);
		});

		it("should handle invalid event ID", async () => {
			// Act
			const req = createTestRequest("GET", "/events/invalid");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.message).toBe("無効なイベントIDです");
		});

		it("should handle not found error", async () => {
			// Arrange
			mockEventService.getEventById.mockRejectedValue(
				new Error("イベントが見つからないか、アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("GET", "/events/999");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.message).toBe(
				"イベントが見つからないか、アクセス権限がありません",
			);
		});

		it("should handle unauthorized access", async () => {
			// Arrange
			mockEventService.getEventById.mockRejectedValue(
				new Error("アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("GET", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.message).toBe("アクセス権限がありません");
		});

		it("should handle internal server error with non-Error object for event details", async () => {
			// Arrange
			mockEventService.getEventById.mockRejectedValue("Database error");

			// Act
			const req = createTestRequest("GET", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("内部サーバーエラーが発生しました");
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
			mockEventService.createNewEvent.mockResolvedValue(mockEvent);

			// Act
			const req = createTestRequest("POST", "/events", validEventData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(201);
			const data = await res.json();
			expect(data).toEqual(mockEvent);
		});

		it("should handle validation error", async () => {
			// Act
			const req = createTestRequest("POST", "/events", {
				cattleId: "invalid",
			});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});

		it("should handle not found error", async () => {
			// Arrange
			mockEventService.createNewEvent.mockRejectedValue(
				new Error("牛が見つからないか、アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("POST", "/events", validEventData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.message).toBe("牛が見つからないか、アクセス権限がありません");
		});

		it("should handle unauthorized access", async () => {
			// Arrange
			mockEventService.createNewEvent.mockRejectedValue(
				new Error("アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("POST", "/events", validEventData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.message).toBe("アクセス権限がありません");
		});

		it("should handle internal server error with non-Error object for event creation", async () => {
			// Arrange
			mockEventService.createNewEvent.mockRejectedValue("Database error");

			// Act
			const req = createTestRequest("POST", "/events", validEventData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("内部サーバーエラーが発生しました");
		});
	});

	describe("PATCH /events/:id", () => {
		const updateData = {
			notes: "更新されたメモ",
		};

		it("should update event successfully", async () => {
			// Arrange
			mockEventService.updateEventData.mockResolvedValue({
				...mockEvent,
				notes: updateData.notes,
			});

			// Act
			const req = createTestRequest("PATCH", "/events/1", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.notes).toBe(updateData.notes);
		});

		it("should handle invalid event ID", async () => {
			// Act
			const req = createTestRequest("PATCH", "/events/invalid", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.message).toBe("無効なイベントIDです");
		});

		it("should handle validation error", async () => {
			// Act
			const req = createTestRequest("PATCH", "/events/1", {
				eventType: "INVALID_TYPE",
			});
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
		});

		it("should handle not found error", async () => {
			// Arrange
			mockEventService.updateEventData.mockRejectedValue(
				new Error("イベントが見つからないか、アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("PATCH", "/events/999", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.message).toBe(
				"イベントが見つからないか、アクセス権限がありません",
			);
		});

		it("should handle unauthorized access", async () => {
			// Arrange
			mockEventService.updateEventData.mockRejectedValue(
				new Error("アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("PATCH", "/events/1", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.message).toBe("アクセス権限がありません");
		});

		it("should handle internal server error with non-Error object for event update", async () => {
			// Arrange
			mockEventService.updateEventData.mockRejectedValue("Database error");

			// Act
			const req = createTestRequest("PATCH", "/events/1", updateData);
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("内部サーバーエラーが発生しました");
		});
	});

	describe("DELETE /events/:id", () => {
		it("should delete event successfully", async () => {
			// Arrange
			mockEventService.deleteEventData.mockResolvedValue(undefined);

			// Act
			const req = createTestRequest("DELETE", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.message).toBe("イベントが正常に削除されました");
		});

		it("should handle invalid event ID", async () => {
			// Act
			const req = createTestRequest("DELETE", "/events/invalid");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.message).toBe("無効なイベントIDです");
		});

		it("should handle not found error", async () => {
			// Arrange
			mockEventService.deleteEventData.mockRejectedValue(
				new Error("イベントが見つからないか、アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("DELETE", "/events/999");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(404);
			const data = await res.json();
			expect(data.message).toBe(
				"イベントが見つからないか、アクセス権限がありません",
			);
		});

		it("should handle unauthorized access", async () => {
			// Arrange
			mockEventService.deleteEventData.mockRejectedValue(
				new Error("アクセス権限がありません"),
			);

			// Act
			const req = createTestRequest("DELETE", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.message).toBe("アクセス権限がありません");
		});

		it("should handle internal server error with non-Error object for event deletion", async () => {
			// Arrange
			mockEventService.deleteEventData.mockRejectedValue("Database error");

			// Act
			const req = createTestRequest("DELETE", "/events/1");
			const res = await app.request(req);

			// Assert
			expect(res.status).toBe(500);
			const data = await res.json();
			expect(data.message).toBe("内部サーバーエラーが発生しました");
		});
	});
});
