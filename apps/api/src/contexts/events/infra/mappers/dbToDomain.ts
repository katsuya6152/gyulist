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
	// 日時文字列を安全にDateオブジェクトに変換
	const parseDate = (dateString: string | null): Date => {
		if (!dateString) return new Date(0);
		const date = new Date(dateString);
		return Number.isNaN(date.getTime()) ? new Date(0) : date;
	};

	return {
		eventId: row.eventId as unknown as EventId,
		cattleId: row.cattleId as unknown as CattleId,
		eventType: row.eventType as Event["eventType"],
		eventDatetime: parseDate(row.eventDatetime),
		notes: row.notes,
		createdAt: parseDate(row.createdAt),
		updatedAt: parseDate(row.updatedAt),
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
