import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEventAction } from "../actions";

// Mock the event service
vi.mock("@/services/eventService", () => ({
	CreateEvent: vi.fn()
}));

// Mock JWT verification
vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn()
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	redirect: vi.fn()
}));

describe("createEventAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create event successfully with valid data", async () => {
		const { CreateEvent } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(CreateEvent).mockResolvedValue(undefined);

		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("eventType", "ESTRUS");
		formData.append("eventDate", "2024-01-15");
		formData.append("eventTime", "10:30");
		formData.append("notes", "発情確認のテスト");

		const result = await createEventAction(null, formData);

		expect(CreateEvent).toHaveBeenCalledWith({
			cattleId: 1,
			eventType: "ESTRUS",
			eventDatetime: expect.stringMatching(/2024-01-15T\d{2}:30:00\.000Z/),
			notes: "発情確認のテスト"
		});

		expect(result).toEqual({
			status: "success",
			message: "イベントが正常に登録されました"
		});
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(1);

		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("eventType", "ESTRUS");
		formData.append("eventDate", "2024-01-15");
		formData.append("eventTime", "10:30");

		const result = await createEventAction(null, formData);

		expect(result).toEqual({
			status: "success",
			message: "demo"
		});
	});

	it("should create event successfully without notes", async () => {
		const { CreateEvent } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(CreateEvent).mockResolvedValue(undefined);

		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("eventType", "VACCINATION");
		formData.append("eventDate", "2024-02-10");
		formData.append("eventTime", "14:00");

		const result = await createEventAction(null, formData);

		expect(CreateEvent).toHaveBeenCalledWith({
			cattleId: 1,
			eventType: "VACCINATION",
			eventDatetime: expect.stringMatching(/2024-02-10T\d{2}:00:00\.000Z/),
			notes: undefined
		});

		expect(result).toEqual({
			status: "success",
			message: "イベントが正常に登録されました"
		});
	});

	it("should return validation error for missing required fields", async () => {
		const formData = new FormData();
		formData.append("cattleId", "1");
		// eventType, eventDate, eventTimeを省略

		const result = await createEventAction(null, formData);

		expect(result.status).toBe("error");
		// バリデーションエラーの場合、詳細なエラー情報が含まれる
		expect(result).toHaveProperty("error");
	});

	it("should return validation error for invalid cattleId", async () => {
		const formData = new FormData();
		formData.append("cattleId", "invalid");
		formData.append("eventType", "ESTRUS");
		formData.append("eventDate", "2024-01-15");
		formData.append("eventTime", "10:30");

		const result = await createEventAction(null, formData);

		expect(result.status).toBe("error");
		// バリデーションエラーの場合、詳細なエラー情報が含まれる
		expect(result).toHaveProperty("error");
	});

	it("should return validation error for invalid eventType", async () => {
		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("eventType", "INVALID_TYPE");
		formData.append("eventDate", "2024-01-15");
		formData.append("eventTime", "10:30");

		const result = await createEventAction(null, formData);

		expect(result.status).toBe("error");
		// バリデーションエラーの場合、詳細なエラー情報が含まれる
		expect(result).toHaveProperty("error");
	});

	it("should handle API error", async () => {
		const { CreateEvent } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		const mockError = new Error("API Error");
		vi.mocked(CreateEvent).mockRejectedValue(mockError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("eventType", "ESTRUS");
		formData.append("eventDate", "2024-01-15");
		formData.append("eventTime", "10:30");

		const result = await createEventAction(null, formData);

		expect(consoleSpy).toHaveBeenCalledWith("Event creation error:", mockError);
		expect(result).toEqual({
			status: "error",
			message: "イベントの登録中にエラーが発生しました"
		});

		consoleSpy.mockRestore();
	});

	it("should handle date and time conversion correctly", async () => {
		const { CreateEvent } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(CreateEvent).mockResolvedValue(undefined);

		const formData = new FormData();
		formData.append("cattleId", "1");
		formData.append("eventType", "CALVING");
		formData.append("eventDate", "2024-12-25");
		formData.append("eventTime", "23:59");

		await createEventAction(null, formData);

		expect(CreateEvent).toHaveBeenCalledWith({
			cattleId: 1,
			eventType: "CALVING",
			eventDatetime: expect.stringMatching(/2024-12-25T\d{2}:59:00\.000Z/),
			notes: undefined
		});
	});

	it("should handle all event types correctly", async () => {
		const { CreateEvent } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		vi.mocked(verifyAndGetUserId).mockResolvedValue(2);
		vi.mocked(CreateEvent).mockResolvedValue(undefined);

		const eventTypes = [
			"ESTRUS",
			"INSEMINATION",
			"CALVING",
			"VACCINATION",
			"SHIPMENT",
			"HOOF_TRIMMING",
			"OTHER"
		];

		for (const eventType of eventTypes) {
			const formData = new FormData();
			formData.append("cattleId", "1");
			formData.append("eventType", eventType);
			formData.append("eventDate", "2024-01-15");
			formData.append("eventTime", "10:30");

			const result = await createEventAction(null, formData);

			expect(result).toEqual({
				status: "success",
				message: "イベントが正常に登録されました"
			});
		}
	});
});
