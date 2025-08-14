import type { InferSelectModel } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { events, cattle } from "../../../src/db/schema";
import * as cattleRepository from "../../../src/repositories/cattleRepository";
import * as eventRepository from "../../../src/repositories/eventRepository";
import * as cattleService from "../../../src/services/cattleService";
import {
	createNewEvent,
	deleteEventData,
	getEventById,
	getEventsByCattleId,
	searchEventList,
	updateEventData
} from "../../../src/services/eventService";
import type {
	CreateEventInput,
	SearchEventQuery,
	UpdateEventInput
} from "../../../src/validators/eventValidator";
import {
	createMockDB,
	mockCattle,
	mockCreatedEvent,
	mockEvent,
	mockEvents
} from "../../fixtures/database";

// Mock the repository modules
vi.mock("../../../src/repositories/cattleRepository");
vi.mock("../../../src/repositories/eventRepository");
vi.mock("../../../src/services/cattleService");

const mockEventRepository = vi.mocked(eventRepository);
const mockCattleRepository = vi.mocked(cattleRepository);
const mockCattleService = vi.mocked(cattleService);

type EventType = InferSelectModel<typeof events>;
type CattleType = InferSelectModel<typeof cattle>;

describe("EventService", () => {
	const mockDB = createMockDB();
	const userId = 1;
	const cattleId = 1;
	const eventId = 1;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getEventsByCattleId", () => {
		it("should return events for valid cattle owned by user", async () => {
			// Arrange
			mockCattleRepository.findCattleById.mockResolvedValue(mockCattle);
			mockEventRepository.findEventsByCattleId.mockResolvedValue(mockEvents);

			// Act
			const result = await getEventsByCattleId(mockDB, cattleId, userId);

			// Assert
			expect(mockCattleRepository.findCattleById).toHaveBeenCalledWith(
				mockDB,
				cattleId
			);
			expect(mockEventRepository.findEventsByCattleId).toHaveBeenCalledWith(
				mockDB,
				cattleId,
				userId
			);
			expect(result).toEqual(mockEvents);
		});

		it("should throw error when cattle not found", async () => {
			// Arrange
			mockCattleRepository.findCattleById.mockResolvedValue(null);

			// Act & Assert
			await expect(
				getEventsByCattleId(mockDB, cattleId, userId)
			).rejects.toThrow("牛が見つからないか、アクセス権限がありません");
		});

		it("should throw error when user does not own the cattle", async () => {
			// Arrange
			const otherUserCattle = { ...mockCattle, ownerUserId: 2 };
			mockCattleRepository.findCattleById.mockResolvedValue(otherUserCattle);

			// Act & Assert
			await expect(
				getEventsByCattleId(mockDB, cattleId, userId)
			).rejects.toThrow("牛が見つからないか、アクセス権限がありません");
		});
	});

	describe("searchEventList", () => {
		it("should return search results", async () => {
			// Arrange
			const query: SearchEventQuery = { limit: 20 };
			const mockSearchResult = {
				results: mockEvents,
				nextCursor: null,
				hasNext: false
			};
			mockEventRepository.searchEvents.mockResolvedValue(mockSearchResult);

			// Act
			const result = await searchEventList(mockDB, userId, query);

			// Assert
			expect(mockEventRepository.searchEvents).toHaveBeenCalledWith(
				mockDB,
				userId,
				query
			);
			expect(result).toEqual(mockSearchResult);
		});
	});

	describe("getEventById", () => {
		it("should return event when found", async () => {
			// Arrange
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);

			// Act
			const result = await getEventById(mockDB, eventId, userId);

			// Assert
			expect(mockEventRepository.findEventById).toHaveBeenCalledWith(
				mockDB,
				eventId,
				userId
			);
			expect(result).toEqual(mockEvent);
		});

		it("should throw error when event not found", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockEventRepository.findEventById.mockResolvedValue(null);

			// Act & Assert
			await expect(getEventById(mockDB, eventId, userId)).rejects.toThrow(
				"イベントが見つからないか、アクセス権限がありません"
			);
			expect(mockEventRepository.findEventById).toHaveBeenCalledWith(
				mockDB,
				eventId,
				userId
			);
		});
	});

	describe("createNewEvent", () => {
		it("should create event successfully", async () => {
			// Arrange
			const eventData: CreateEventInput = {
				cattleId: 1,
				eventType: "ESTRUS",
				eventDatetime: "2024-01-01T10:00:00Z",
				notes: "テストイベント"
			};

			mockCattleRepository.findCattleById.mockResolvedValue(mockCattle);
			mockEventRepository.createEvent.mockResolvedValue(mockCreatedEvent);
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);

			// Act
			const result = await createNewEvent(mockDB, eventData, userId);

			// Assert
			expect(mockCattleRepository.findCattleById).toHaveBeenCalledWith(
				mockDB,
				eventData.cattleId
			);
			expect(mockEventRepository.createEvent).toHaveBeenCalledWith(
				mockDB,
				eventData
			);
			expect(mockEventRepository.findEventById).toHaveBeenCalledWith(
				mockDB,
				mockCreatedEvent.eventId,
				userId
			);
			expect(result).toEqual(mockEvent);
		});

		it("should update status to SHIPPED for shipment event", async () => {
			const eventData: CreateEventInput = {
				cattleId: 1,
				eventType: "SHIPMENT",
				eventDatetime: "2024-01-01T10:00:00Z",
				notes: "出荷"
			};
			mockCattleRepository.findCattleById.mockResolvedValue(mockCattle);
			mockEventRepository.createEvent.mockResolvedValue(mockCreatedEvent);
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);

			await createNewEvent(mockDB, eventData, userId);

			expect(mockCattleService.updateStatus).toHaveBeenCalledWith(
				mockDB,
				eventData.cattleId,
				"SHIPPED",
				userId
			);
		});

		it("should update status to RESTING for calving event", async () => {
			const eventData: CreateEventInput = {
				cattleId: 1,
				eventType: "CALVING",
				eventDatetime: "2024-01-01T10:00:00Z",
				notes: "分娩"
			};
			mockCattleRepository.findCattleById.mockResolvedValue(mockCattle);
			mockEventRepository.createEvent.mockResolvedValue(mockCreatedEvent);
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);

			await createNewEvent(mockDB, eventData, userId);

			expect(mockCattleService.updateStatus).toHaveBeenCalledWith(
				mockDB,
				eventData.cattleId,
				"RESTING",
				userId
			);
		});

		it("should throw error when cattle not found", async () => {
			// Arrange
			const eventData: CreateEventInput = {
				cattleId: 1,
				eventType: "ESTRUS",
				eventDatetime: "2024-01-01T10:00:00Z",
				notes: "テストイベント"
			};
			mockCattleRepository.findCattleById.mockResolvedValue(null);

			// Act & Assert
			await expect(createNewEvent(mockDB, eventData, userId)).rejects.toThrow(
				"牛が見つからないか、アクセス権限がありません"
			);
		});
	});

	describe("updateEventData", () => {
		it("should update event successfully", async () => {
			// Arrange
			const updateData: UpdateEventInput = {
				notes: "更新されたメモ"
			};
			const updatedEvent = mockCreatedEvent;

			mockEventRepository.findEventById.mockResolvedValueOnce(mockEvent);
			mockEventRepository.updateEvent.mockResolvedValue(updatedEvent);
			mockEventRepository.findEventById.mockResolvedValueOnce({
				...mockEvent,
				notes: "更新されたメモ"
			});

			// Act
			const result = await updateEventData(mockDB, eventId, updateData, userId);

			// Assert
			expect(mockEventRepository.findEventById).toHaveBeenCalledWith(
				mockDB,
				eventId,
				userId
			);
			expect(mockEventRepository.updateEvent).toHaveBeenCalledWith(
				mockDB,
				eventId,
				updateData
			);
			expect(result.notes).toBe("更新されたメモ");
		});

		it("should throw error when event not found", async () => {
			// Arrange
			const updateData: UpdateEventInput = {
				notes: "更新されたメモ"
			};
			// @ts-expect-error: Repository can return null for not found
			mockEventRepository.findEventById.mockResolvedValue(null);

			// Act & Assert
			await expect(
				updateEventData(mockDB, eventId, updateData, userId)
			).rejects.toThrow("イベントが見つからないか、アクセス権限がありません");
			expect(mockEventRepository.findEventById).toHaveBeenCalledWith(
				mockDB,
				eventId,
				userId
			);
		});
	});

	describe("deleteEventData", () => {
		it("should delete event successfully", async () => {
			// Arrange
			mockEventRepository.findEventById.mockResolvedValue(mockEvent);
			mockEventRepository.deleteEvent.mockResolvedValue(undefined);

			// Act
			await deleteEventData(mockDB, eventId, userId);

			// Assert
			expect(mockEventRepository.findEventById).toHaveBeenCalledWith(
				mockDB,
				eventId,
				userId
			);
			expect(mockEventRepository.deleteEvent).toHaveBeenCalledWith(
				mockDB,
				eventId
			);
		});

		it("should throw error when event not found", async () => {
			// Arrange
			// @ts-expect-error: Repository can return null for not found
			mockEventRepository.findEventById.mockResolvedValue(null);

			// Act & Assert
			await expect(deleteEventData(mockDB, eventId, userId)).rejects.toThrow(
				"イベントが見つからないか、アクセス権限がありません"
			);
			expect(mockEventRepository.findEventById).toHaveBeenCalledWith(
				mockDB,
				eventId,
				userId
			);
		});
	});
});
