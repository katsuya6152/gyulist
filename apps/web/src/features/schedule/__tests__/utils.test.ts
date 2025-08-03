import { addDays, endOfDay, startOfDay } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type DateFilter, getTargetDate } from "../utils";

describe("getTargetDate", () => {
	beforeEach(() => {
		// Set a fixed date for consistent testing
		vi.setSystemTime(new Date("2024-01-15T10:00:00.000Z"));
	});

	it('should return today\'s date for "today" filter', () => {
		const result = getTargetDate("today");
		expect(result).toEqual(new Date("2024-01-15T10:00:00.000Z"));
	});

	it('should return tomorrow\'s date for "tomorrow" filter', () => {
		const result = getTargetDate("tomorrow");
		expect(result).toEqual(new Date("2024-01-16T10:00:00.000Z"));
	});

	it('should return day after tomorrow\'s date for "dayAfterTomorrow" filter', () => {
		const result = getTargetDate("dayAfterTomorrow");
		expect(result).toEqual(new Date("2024-01-17T10:00:00.000Z"));
	});

	it("should return custom date when provided", () => {
		const customDate = "2024-01-20";
		const result = getTargetDate("custom", customDate);
		expect(result).toEqual(new Date("2024-01-20T00:00:00.000Z"));
	});

	it("should return null for custom filter without date", () => {
		const result = getTargetDate("custom");
		expect(result).toBeNull();
	});

	it('should return null for "all" filter', () => {
		const result = getTargetDate("all");
		expect(result).toBeNull();
	});

	it("should return null for unknown filter", () => {
		const result = getTargetDate("unknown" as DateFilter);
		expect(result).toBeNull();
	});
});

describe("Date formatting utilities", () => {
	beforeEach(() => {
		vi.setSystemTime(new Date("2024-01-15T10:00:00.000Z"));
	});

	it("should create correct start and end dates for API queries", () => {
		// Use UTC date to avoid timezone issues
		const targetDate = new Date("2024-01-20T00:00:00.000Z");

		const startDate = startOfDay(targetDate);
		const endDate = endOfDay(targetDate);

		// The actual behavior depends on the system timezone
		// Instead of expecting exact UTC times, let's test the relative difference
		expect(endDate.getTime() - startDate.getTime()).toBe(86399999); // 23:59:59.999 in milliseconds
		expect(startDate.getHours()).toBe(0); // Should be start of day in local timezone
		expect(startDate.getMinutes()).toBe(0);
		expect(startDate.getSeconds()).toBe(0);
	});

	it("should handle timezone correctly for today", () => {
		const today = new Date("2024-01-15T10:00:00.000Z");
		const startDate = startOfDay(today);
		const endDate = endOfDay(today);

		// Test that we get start and end of the same day
		expect(startDate.getDate()).toBe(today.getDate());
		expect(endDate.getDate()).toBe(today.getDate());

		// Test that start is beginning of day and end is end of day
		expect(startDate.getHours()).toBe(0);
		expect(startDate.getMinutes()).toBe(0);
		expect(startDate.getSeconds()).toBe(0);

		expect(endDate.getHours()).toBe(23);
		expect(endDate.getMinutes()).toBe(59);
		expect(endDate.getSeconds()).toBe(59);
	});
});
