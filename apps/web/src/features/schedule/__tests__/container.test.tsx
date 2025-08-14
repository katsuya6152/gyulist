import * as eventService from "@/services/eventService";
import type { SearchEventsResType } from "@/services/eventService";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScheduleContainer from "../container";

// Mock the eventService
vi.mock("@/services/eventService", () => ({
	SearchEvents: vi.fn()
}));

// Mock the presentational component
vi.mock("../presentational", () => ({
	SchedulePresentation: ({
		events,
		currentFilter,
		customDate,
		error
	}: {
		events: SearchEventsResType["results"];
		currentFilter: string;
		customDate?: string;
		error?: string;
	}) => (
		<div data-testid="schedule-presentation">
			<div data-testid="events-count">{events.length}</div>
			<div data-testid="current-filter">{currentFilter}</div>
			<div data-testid="custom-date">{customDate || "none"}</div>
			<div data-testid="error">{error || "none"}</div>
		</div>
	)
}));

const mockEventsData: SearchEventsResType = {
	results: [
		{
			eventId: 1,
			cattleId: 1,
			eventType: "ESTRUS",
			eventDatetime: "2024-01-15T10:00:00.000Z",
			notes: "Test event",
			createdAt: "2024-01-15T10:00:00.000Z",
			updatedAt: "2024-01-15T10:00:00.000Z",
			cattleName: "Test Cattle",
			cattleEarTagNumber: "TC001"
		}
	],
	nextCursor: null,
	hasNext: false
};

describe("ScheduleContainer", () => {
	const mockSearchEvents = vi.mocked(eventService.SearchEvents);

	beforeEach(() => {
		vi.clearAllMocks();
		mockSearchEvents.mockResolvedValue(mockEventsData);
	});

	it('should render with default filter "all"', async () => {
		const searchParams = Promise.resolve({});

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("schedule-presentation")).toBeInTheDocument();
		expect(screen.getByTestId("current-filter")).toHaveTextContent("all");
		expect(screen.getByTestId("events-count")).toHaveTextContent("1");
		expect(screen.getByTestId("error")).toHaveTextContent("none");
	});

	it('should handle "today" filter correctly', async () => {
		const searchParams = Promise.resolve({ filter: "today" });

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("current-filter")).toHaveTextContent("today");

		// Check that SearchEvents was called without date parameters (client-side filtering)
		expect(mockSearchEvents).toHaveBeenCalledWith({
			limit: 50
		});
	});

	it('should handle "tomorrow" filter correctly', async () => {
		const searchParams = Promise.resolve({ filter: "tomorrow" });

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("current-filter")).toHaveTextContent("tomorrow");

		// Check that SearchEvents was called without date parameters (client-side filtering)
		expect(mockSearchEvents).toHaveBeenCalledWith({
			limit: 50
		});
	});

	it('should handle "dayAfterTomorrow" filter correctly', async () => {
		const searchParams = Promise.resolve({ filter: "dayAfterTomorrow" });

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("current-filter")).toHaveTextContent(
			"dayAfterTomorrow"
		);

		// Check that SearchEvents was called without date parameters (client-side filtering)
		expect(mockSearchEvents).toHaveBeenCalledWith({
			limit: 50
		});
	});

	it("should handle custom date filter correctly", async () => {
		const searchParams = Promise.resolve({
			filter: "custom",
			date: "2024-01-20"
		});

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("current-filter")).toHaveTextContent("custom");
		expect(screen.getByTestId("custom-date")).toHaveTextContent("2024-01-20");

		// Check that SearchEvents was called with date parameters (don't check exact timezone-dependent values)
		expect(mockSearchEvents).toHaveBeenCalledWith(
			expect.objectContaining({
				limit: 50,
				startDate: expect.stringMatching(/2024-01-[12][09]T\d{2}:00:00\.000Z/),
				endDate: expect.stringMatching(/2024-01-[12][09]T\d{2}:59:59\.999Z/)
			})
		);
	});

	it("should handle array parameters correctly", async () => {
		const searchParams = Promise.resolve({
			filter: ["today", "tomorrow"],
			date: ["2024-01-20", "2024-01-21"]
		});

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("current-filter")).toHaveTextContent("today");
		expect(screen.getByTestId("custom-date")).toHaveTextContent("2024-01-20");
	});

	it('should handle invalid filter and default to "all"', async () => {
		const searchParams = Promise.resolve({ filter: "invalid" });

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("current-filter")).toHaveTextContent("all");
		expect(mockSearchEvents).toHaveBeenCalledWith({ limit: 50 });
	});

	it("should handle API error correctly", async () => {
		mockSearchEvents.mockRejectedValue(new Error("API Error"));
		const searchParams = Promise.resolve({});

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("schedule-presentation")).toBeInTheDocument();
		expect(screen.getByTestId("events-count")).toHaveTextContent("0");
		expect(screen.getByTestId("error")).toHaveTextContent(
			"イベントの取得に失敗しました"
		);
	});

	it("should handle empty results correctly", async () => {
		mockSearchEvents.mockResolvedValue({
			results: [],
			nextCursor: null,
			hasNext: false
		});
		const searchParams = Promise.resolve({});

		render(await ScheduleContainer({ searchParams }));

		expect(screen.getByTestId("events-count")).toHaveTextContent("0");
	});
});
