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
		eventDatetime: event.eventDatetime,
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
	if (partial.eventDatetime !== undefined) {
		result.eventDatetime = partial.eventDatetime;
	}
	if (partial.notes !== undefined) {
		result.notes = partial.notes;
	}
	if (partial.updatedAt !== undefined) {
		result.updatedAt = partial.updatedAt;
	}

	return result;
}
