import type { InferInsertModel } from "drizzle-orm";
import type { events as EventsTable } from "../../../../db/schema";
import type { Event } from "../../ports";

/**
 * ドメインEventモデルからデータベース挿入用オブジェクトに変換
 */
export function toDbInsert(
	event: Omit<
		Event,
		"eventId" | "createdAt" | "updatedAt" | "cattleName" | "cattleEarTagNumber"
	>
): InferInsertModel<typeof EventsTable> {
	return {
		cattleId: event.cattleId as unknown as number,
		eventType: event.eventType,
		eventDatetime: event.eventDatetime.toISOString(),
		notes: event.notes
	};
}

/**
 * ドメインEventモデルからデータベース更新用オブジェクトに変換
 */
export function toDbUpdate(
	partial: Partial<Event>
): Partial<InferInsertModel<typeof EventsTable>> {
	const result: Partial<InferInsertModel<typeof EventsTable>> = {};

	if (partial.cattleId !== undefined) {
		result.cattleId = partial.cattleId as unknown as number;
	}
	if (partial.eventType !== undefined) {
		result.eventType = partial.eventType;
	}
	if (
		partial.eventDatetime !== undefined &&
		partial.eventDatetime instanceof Date &&
		!Number.isNaN(partial.eventDatetime.getTime())
	) {
		result.eventDatetime = partial.eventDatetime.toISOString();
	}
	if (partial.notes !== undefined) {
		result.notes = partial.notes;
	}
	if (
		partial.updatedAt !== undefined &&
		partial.updatedAt instanceof Date &&
		!Number.isNaN(partial.updatedAt.getTime())
	) {
		result.updatedAt = partial.updatedAt.toISOString();
	}

	return result;
}
