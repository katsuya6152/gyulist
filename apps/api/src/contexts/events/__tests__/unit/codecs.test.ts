import { describe, expect, it } from "vitest";
import {
	createEventSchema,
	searchEventsSchema,
	updateEventSchema
} from "../../domain/codecs/input";

describe("Events codecs", () => {
	it("validates create event", () => {
		const parsed = createEventSchema.parse({
			cattleId: 1,
			eventType: "CALVING",
			eventDatetime: new Date().toISOString(),
			notes: null
		});
		expect(parsed.cattleId).toBe(1);
	});

	it("validates search with optional filters", () => {
		const parsed = searchEventsSchema.parse({ limit: 10 });
		expect(parsed.limit).toBe(10);
	});

	it("validates update event partial", () => {
		const parsed = updateEventSchema.parse({ notes: "n" });
		expect(parsed.notes).toBe("n");
	});
});
