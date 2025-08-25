/**
 * Event Database Mapper
 *
 * ドメインエンティティとデータベースレコード間の変換を行うマッパー
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { events as EventsTable } from "../../../db/schema";
import type { Event, NewEventProps } from "../../../domain/types/events";
import type { CattleId, EventId } from "../../../shared/brand";

/**
 * データベース行の型定義（JOIN結果）
 */
export type EventDbRow = InferSelectModel<typeof EventsTable> & {
	cattleName?: string | null;
	cattleEarTagNumber?: number | null;
};

/**
 * イベントデータベースマッパー
 */
export const eventDbMapper = {
	/**
	 * データベースレコードからドメインエンティティへの変換
	 */
	toDomain(row: EventDbRow): Event {
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
	},

	/**
	 * データベース行の配列からドメインエンティティ配列への変換
	 */
	toDomainList(rows: EventDbRow[]): Event[] {
		return rows.map(this.toDomain);
	},

	/**
	 * ドメインエンティティからデータベース挿入用レコードへの変換
	 */
	toInsertRecord(
		event: Omit<Event, "eventId" | "createdAt" | "updatedAt">
	): InferInsertModel<typeof EventsTable> {
		return {
			cattleId: event.cattleId as number,
			eventType: event.eventType,
			eventDatetime: event.eventDatetime.toISOString(),
			notes: event.notes
		};
	},

	/**
	 * 新規イベントプロパティからデータベース挿入用レコードへの変換
	 */
	fromNewEventProps(
		props: NewEventProps
	): InferInsertModel<typeof EventsTable> {
		return {
			cattleId: props.cattleId as number,
			eventType: props.eventType,
			eventDatetime: props.eventDatetime.toISOString(),
			notes: props.notes || null
		};
	},

	/**
	 * 更新用の部分的なレコードへの変換
	 */
	toUpdateRecord(
		updates: Partial<Event>
	): Partial<InferInsertModel<typeof EventsTable>> {
		const record: Partial<InferInsertModel<typeof EventsTable>> = {};

		if (updates.eventType !== undefined) {
			record.eventType = updates.eventType;
		}
		if (updates.eventDatetime !== undefined) {
			record.eventDatetime = updates.eventDatetime.toISOString();
		}
		if (updates.notes !== undefined) {
			record.notes = updates.notes;
		}

		return record;
	}
};
