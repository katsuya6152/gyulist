import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { events, cattle } from "../../../../db/schema";
import type {
	CattleId,
	Event,
	EventId,
	EventsRepoPort,
	UserId
} from "../../ports";
import { toDomain, toDomainList } from "../mappers/dbToDomain";
import { toDbInsert, toDbUpdate } from "../mappers/domainToDb";

export function makeEventsRepo(db: AnyD1Database): EventsRepoPort {
	const d = drizzle(db);
	return {
		async findById(eventId, ownerUserId) {
			const rows = await d
				.select({
					eventId: events.eventId,
					cattleId: events.cattleId,
					eventType: events.eventType,
					eventDatetime: events.eventDatetime,
					notes: events.notes,
					createdAt: events.createdAt,
					updatedAt: events.updatedAt,
					cattleName: cattle.name,
					cattleEarTagNumber: cattle.earTagNumber
				})
				.from(events)
				.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
				.where(
					and(
						eq(events.eventId, eventId as unknown as number),
						eq(cattle.ownerUserId, ownerUserId as unknown as number)
					)
				)
				.limit(1);
			return rows[0] ? toDomain(rows[0]) : null;
		},
		async listByCattleId(cattleId, ownerUserId) {
			const rows = await d
				.select({
					eventId: events.eventId,
					cattleId: events.cattleId,
					eventType: events.eventType,
					eventDatetime: events.eventDatetime,
					notes: events.notes,
					createdAt: events.createdAt,
					updatedAt: events.updatedAt,
					cattleName: cattle.name
				})
				.from(events)
				.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
				.where(
					and(
						eq(events.cattleId, cattleId as unknown as number),
						eq(cattle.ownerUserId, ownerUserId as unknown as number)
					)
				)
				.orderBy(desc(events.eventDatetime));
			return toDomainList(rows);
		},
		async search(q) {
			const conditions = [
				eq(cattle.ownerUserId, q.ownerUserId as unknown as number)
			];
			if (q.cattleId)
				conditions.push(eq(events.cattleId, q.cattleId as unknown as number));
			if (q.eventType) conditions.push(eq(events.eventType, q.eventType));
			if (q.startDate) conditions.push(gte(events.eventDatetime, q.startDate));
			if (q.endDate) conditions.push(lte(events.eventDatetime, q.endDate));
			if (q.cursor) conditions.push(sql`${events.eventId} < ${q.cursor}`);

			const rows = await d
				.select({
					eventId: events.eventId,
					cattleId: events.cattleId,
					eventType: events.eventType,
					eventDatetime: events.eventDatetime,
					notes: events.notes,
					createdAt: events.createdAt,
					updatedAt: events.updatedAt,
					cattleName: cattle.name,
					cattleEarTagNumber: cattle.earTagNumber
				})
				.from(events)
				.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
				.where(and(...conditions))
				.orderBy(desc(events.eventDatetime))
				.limit(q.limit + 1);

			const hasNext = rows.length > q.limit;
			const results = hasNext ? rows.slice(0, -1) : rows;
			const nextCursor = hasNext
				? (results[results.length - 1] as { eventId: number }).eventId
				: null;
			return { results: toDomainList(results), nextCursor, hasNext };
		},
		async create(dto) {
			const [row] = await d.insert(events).values(toDbInsert(dto)).returning();
			return toDomain(row);
		},
		async update(eventId, partial) {
			const updateData = toDbUpdate(partial);
			const [row] = await d
				.update(events)
				.set({ ...updateData, updatedAt: sql`(datetime('now', 'utc'))` })
				.where(eq(events.eventId, eventId as unknown as number))
				.returning();
			return toDomain(row);
		},
		async delete(eventId) {
			await d
				.delete(events)
				.where(eq(events.eventId, eventId as unknown as number));
		}
	} satisfies EventsRepoPort;
}
