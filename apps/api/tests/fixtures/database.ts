import type { AnyD1Database } from "drizzle-orm/d1";
import { vi } from "vitest";

// Mock database for testing
export const createMockDB = (): AnyD1Database => {
	return {
		prepare: vi.fn(),
		dump: vi.fn(),
		batch: vi.fn(),
		exec: vi.fn(),
	} as unknown as AnyD1Database;
};

// Mock data for testing
export const mockUser = {
	id: 1,
	userName: "Test User",
	email: "test@example.com",
	passwordHash: "hashedpassword",
	isVerified: true,
	verificationToken: null,
	lastLoginAt: null,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

// Mock cattle data that matches findCattleById return type
export const mockCattle = {
	cattleId: 1,
	ownerUserId: 1,
	identificationNumber: 1001,
	earTagNumber: 1234,
	name: "テスト牛",
	growthStage: "CALF" as const,
	birthday: "2023-01-01",
	age: 1,
	monthsOld: 12,
	daysOld: 365,
	gender: "オス",
	weight: 250,
	score: 80,
	breed: "黒毛和種",
	healthStatus: "健康",
	producerName: "テスト生産者",
	barn: "テスト牛舎",
	breedingValue: "AAAAAA",
	notes: "テスト用の牛",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	bloodline: null,
	motherInfo: null,
	breedingStatus: null,
	breedingSummary: null,
	events: [],
};

// Mock event data that matches findEventById return type
export const mockEvent = {
	eventId: 1,
	cattleId: 1,
	eventType: "ESTRUS" as const,
	eventDatetime: "2024-01-01T10:00:00Z",
	notes: "テスト発情イベント",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	cattleName: "テスト牛",
	cattleEarTagNumber: 1234,
};

export const mockEvents = [
	mockEvent,
	{
		eventId: 2,
		cattleId: 1,
		eventType: "INSEMINATION" as const,
		eventDatetime: "2024-01-02T09:00:00Z",
		notes: "テスト人工授精イベント",
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		cattleName: "テスト牛",
		cattleEarTagNumber: 1234,
	},
];

// Mock created event data that matches createEvent return type
export const mockCreatedEvent = {
	eventId: 1,
	cattleId: 1,
	eventType: "ESTRUS" as const,
	eventDatetime: "2024-01-01T10:00:00Z",
	notes: "テストイベント",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};
