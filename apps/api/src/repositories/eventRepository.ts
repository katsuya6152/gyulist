import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { events, cattle } from "../db/schema";
import type {
	CreateEventInput,
	SearchEventQuery,
	UpdateEventInput,
} from "../validators/eventValidator";

// イベント一覧取得（牛IDでフィルタ）
export async function findEventsByCattleId(
	db: AnyD1Database,
	cattleId: number,
	ownerUserId: number,
) {
	const dbInstance = drizzle(db);

	// 牛の所有者確認も含めてイベントを取得
	const result = await dbInstance
		.select({
			eventId: events.eventId,
			cattleId: events.cattleId,
			eventType: events.eventType,
			eventDatetime: events.eventDatetime,
			notes: events.notes,
			createdAt: events.createdAt,
			updatedAt: events.updatedAt,
			cattleName: cattle.name,
		})
		.from(events)
		.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
		.where(
			and(eq(events.cattleId, cattleId), eq(cattle.ownerUserId, ownerUserId)),
		)
		.orderBy(desc(events.eventDatetime));

	return result;
}

// イベント検索（複数条件）
export async function searchEvents(
	db: AnyD1Database,
	ownerUserId: number,
	query: SearchEventQuery,
) {
	const dbInstance = drizzle(db);

	const conditions = [eq(cattle.ownerUserId, ownerUserId)];

	if (query.cattleId) {
		conditions.push(eq(events.cattleId, query.cattleId));
	}

	if (query.eventType) {
		conditions.push(eq(events.eventType, query.eventType));
	}

	if (query.startDate) {
		conditions.push(gte(events.eventDatetime, query.startDate));
	}

	if (query.endDate) {
		conditions.push(lte(events.eventDatetime, query.endDate));
	}

	if (query.cursor) {
		conditions.push(sql`${events.eventId} < ${query.cursor}`);
	}

	const result = await dbInstance
		.select({
			eventId: events.eventId,
			cattleId: events.cattleId,
			eventType: events.eventType,
			eventDatetime: events.eventDatetime,
			notes: events.notes,
			createdAt: events.createdAt,
			updatedAt: events.updatedAt,
			cattleName: cattle.name,
			cattleEarTagNumber: cattle.earTagNumber,
		})
		.from(events)
		.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
		.where(and(...conditions))
		.orderBy(desc(events.eventDatetime))
		.limit(query.limit + 1); // +1 for pagination check

	const hasNext = result.length > query.limit;
	const results = hasNext ? result.slice(0, -1) : result;
	const nextCursor = hasNext ? results[results.length - 1]?.eventId : null;

	return {
		results,
		nextCursor,
		hasNext,
	};
}

// イベント詳細取得
export async function findEventById(
	db: AnyD1Database,
	eventId: number,
	ownerUserId: number,
) {
	const dbInstance = drizzle(db);

	const result = await dbInstance
		.select({
			eventId: events.eventId,
			cattleId: events.cattleId,
			eventType: events.eventType,
			eventDatetime: events.eventDatetime,
			notes: events.notes,
			createdAt: events.createdAt,
			updatedAt: events.updatedAt,
			cattleName: cattle.name,
			cattleEarTagNumber: cattle.earTagNumber,
		})
		.from(events)
		.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
		.where(
			and(eq(events.eventId, eventId), eq(cattle.ownerUserId, ownerUserId)),
		)
		.limit(1);

	return result[0] || null;
}

// イベント作成
export async function createEvent(db: AnyD1Database, data: CreateEventInput) {
	const dbInstance = drizzle(db);

	const result = await dbInstance
		.insert(events)
		.values({
			cattleId: data.cattleId,
			eventType: data.eventType,
			eventDatetime: data.eventDatetime,
			notes: data.notes,
		})
		.returning();

	return result[0];
}

// イベント更新
export async function updateEvent(
	db: AnyD1Database,
	eventId: number,
	data: UpdateEventInput,
) {
	const dbInstance = drizzle(db);

	const result = await dbInstance
		.update(events)
		.set({
			...data,
			updatedAt: sql`(datetime('now', 'utc'))`,
		})
		.where(eq(events.eventId, eventId))
		.returning();

	return result[0];
}

// イベント削除
export async function deleteEvent(db: AnyD1Database, eventId: number) {
	const dbInstance = drizzle(db);

	await dbInstance.delete(events).where(eq(events.eventId, eventId));
}
