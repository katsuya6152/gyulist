import type { InferSelectModel } from "drizzle-orm";
import type {
	cattle as CattleTable,
	events as EventsTable
} from "../../../../db/schema";
import type { CattleId, Event, EventId } from "../../ports";

// データベース行の型定義（JOIN結果）
export type EventDbRow = InferSelectModel<typeof EventsTable> & {
	cattleName?: string | null;
	cattleEarTagNumber?: number | null;
};

/**
 * データベース行からドメインEventモデルに変換
 */
export function toDomain(row: EventDbRow): Event {
	return {
		eventId: row.eventId as unknown as EventId,
		cattleId: row.cattleId as unknown as CattleId,
		eventType: row.eventType as Event["eventType"],
		eventDatetime: row.eventDatetime,
		notes: row.notes,
		createdAt: row.createdAt ?? new Date(0).toISOString(),
		updatedAt: row.updatedAt ?? new Date(0).toISOString(),
		cattleName: row.cattleName ?? null,
		cattleEarTagNumber: row.cattleEarTagNumber ?? null
	};
}

/**
 * データベース行の配列をドメインEventモデルの配列に変換
 */
export function toDomainList(rows: EventDbRow[]): Event[] {
	return rows.map(toDomain);
}
