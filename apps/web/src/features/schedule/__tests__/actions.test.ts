import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteEventAction, updateEventAction } from "../actions";

// Mock the event service
vi.mock("@/services/eventService", () => ({
	DeleteEventServer: vi.fn(),
	UpdateEventServer: vi.fn(),
}));

// Mock JWT verification
vi.mock("@/lib/jwt", () => ({
	verifyAndGetUserId: vi.fn(),
}));

// Mock API client
vi.mock("@/lib/api-client", () => ({
	createDemoResponse: vi.fn(),
	isDemo: vi.fn(),
}));

describe("updateEventAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should update event successfully for non-demo user", async () => {
		const { UpdateEventServer } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		// Mock user ID verification
		vi.mocked(verifyAndGetUserId).mockResolvedValue(123);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(UpdateEventServer).mockResolvedValue({ success: true });

		const eventId = 456;
		const updateData = {
			eventType: "VACCINATION" as const,
			eventDatetime: "2024-01-01T10:00:00Z",
			notes: "Updated notes",
		};

		const result = await updateEventAction(eventId, updateData);

		expect(verifyAndGetUserId).toHaveBeenCalledTimes(1);
		expect(isDemo).toHaveBeenCalledWith(123);
		expect(UpdateEventServer).toHaveBeenCalledWith(eventId, updateData);
		expect(result).toEqual({ success: true });
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo, createDemoResponse } = await import("@/lib/api-client");
		const { UpdateEventServer } = await import("@/services/eventService");

		// Mock demo user
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1); // Demo user ID
		vi.mocked(isDemo).mockReturnValue(true);
		vi.mocked(createDemoResponse).mockReturnValue({
			success: true,
			message: "demo",
		});

		const eventId = 789;
		const updateData = {
			eventType: "CALVING" as const,
			eventDatetime: "2024-02-01T08:00:00Z",
			notes: "Demo notes",
		};

		const result = await updateEventAction(eventId, updateData);

		expect(verifyAndGetUserId).toHaveBeenCalledTimes(1);
		expect(isDemo).toHaveBeenCalledWith(1);
		expect(createDemoResponse).toHaveBeenCalledWith(true);
		expect(UpdateEventServer).not.toHaveBeenCalled();
		expect(result).toEqual({ success: true, message: "demo" });
	});

	it("should handle JWT verification error", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock JWT verification failure
		vi.mocked(verifyAndGetUserId).mockRejectedValue(new Error("Invalid token"));

		const eventId = 999;
		const updateData = {
			eventType: "OTHER" as const,
			eventDatetime: "2024-03-01T12:00:00Z",
			notes: "Error test notes",
		};

		await expect(updateEventAction(eventId, updateData)).rejects.toThrow(
			"Invalid token",
		);
	});
});

describe("deleteEventAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should delete event successfully for non-demo user", async () => {
		const { DeleteEventServer } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		// Mock user ID verification
		vi.mocked(verifyAndGetUserId).mockResolvedValue(456);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(DeleteEventServer).mockResolvedValue({ success: true });

		const eventId = 123;

		const result = await deleteEventAction(eventId);

		expect(verifyAndGetUserId).toHaveBeenCalledTimes(1);
		expect(isDemo).toHaveBeenCalledWith(456);
		expect(DeleteEventServer).toHaveBeenCalledWith(eventId);
		expect(result).toEqual({ success: true });
	});

	it("should return demo response for demo user", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo, createDemoResponse } = await import("@/lib/api-client");
		const { DeleteEventServer } = await import("@/services/eventService");

		// Mock demo user
		vi.mocked(verifyAndGetUserId).mockResolvedValue(1); // Demo user ID
		vi.mocked(isDemo).mockReturnValue(true);
		vi.mocked(createDemoResponse).mockReturnValue({
			success: true,
			message: "demo",
		});

		const eventId = 456;

		const result = await deleteEventAction(eventId);

		expect(verifyAndGetUserId).toHaveBeenCalledTimes(1);
		expect(isDemo).toHaveBeenCalledWith(1);
		expect(createDemoResponse).toHaveBeenCalledWith(true);
		expect(DeleteEventServer).not.toHaveBeenCalled();
		expect(result).toEqual({ success: true, message: "demo" });
	});

	it("should handle JWT verification error", async () => {
		const { verifyAndGetUserId } = await import("@/lib/jwt");

		// Mock JWT verification failure
		vi.mocked(verifyAndGetUserId).mockRejectedValue(new Error("Unauthorized"));

		const eventId = 789;

		await expect(deleteEventAction(eventId)).rejects.toThrow("Unauthorized");
	});

	it("should handle service error for non-demo user", async () => {
		const { DeleteEventServer } = await import("@/services/eventService");
		const { verifyAndGetUserId } = await import("@/lib/jwt");
		const { isDemo } = await import("@/lib/api-client");

		// Mock user ID verification
		vi.mocked(verifyAndGetUserId).mockResolvedValue(789);
		vi.mocked(isDemo).mockReturnValue(false);
		vi.mocked(DeleteEventServer).mockRejectedValue(new Error("Service error"));

		const eventId = 999;

		await expect(deleteEventAction(eventId)).rejects.toThrow("Service error");
		expect(verifyAndGetUserId).toHaveBeenCalledTimes(1);
		expect(isDemo).toHaveBeenCalledWith(789);
		expect(DeleteEventServer).toHaveBeenCalledWith(eventId);
	});
});
