/**
 * Event Repository Implementation
 *
 * イベント管理リポジトリのDrizzle ORM実装
 */

import { and, asc, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { events, cattle } from "../../../db/schema";
import type { EventError } from "../../../domain/errors/events/EventErrors";
import type { EventRepository, EventStats } from "../../../domain/ports/events";
import type {
	Event,
	EventSearchCriteria,
	EventSearchResult,
	EventType
} from "../../../domain/types/events";
import type { CattleId, EventId, UserId } from "../../../shared/brand";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import { eventDbMapper } from "../mappers/eventDbMapper";

/**
 * イベントリポジトリの実装クラス
 */
export class EventRepositoryImpl implements EventRepository {
	private readonly db: ReturnType<typeof import("drizzle-orm/d1").drizzle>;

	constructor(dbInstance: D1DatabasePort) {
		this.db = dbInstance.getDrizzle();
	}

	async findById(
		eventId: EventId,
		ownerUserId: UserId
	): Promise<Result<Event | null, EventError>> {
		try {
			const result = await this.db
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
						eq(events.eventId, eventId as number),
						eq(cattle.ownerUserId, ownerUserId as number)
					)
				)
				.limit(1);

			if (result.length === 0) {
				return ok(null);
			}

			const event = eventDbMapper.toDomain(result[0]);
			return ok(event);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find event by ID",
				cause
			});
		}
	}

	async listByCattleId(
		cattleId: CattleId,
		ownerUserId: UserId
	): Promise<Result<Event[], EventError>> {
		try {
			const result = await this.db
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
						eq(events.cattleId, cattleId as number),
						eq(cattle.ownerUserId, ownerUserId as number)
					)
				)
				.orderBy(desc(events.eventDatetime));

			const eventList = eventDbMapper.toDomainList(result);
			return ok(eventList);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to list events by cattle ID",
				cause
			});
		}
	}

	async search(
		criteria: EventSearchCriteria
	): Promise<Result<EventSearchResult, EventError>> {
		try {
			const conditions = [
				eq(cattle.ownerUserId, criteria.ownerUserId as number)
			];

			// 牛IDフィルタ
			if (criteria.cattleId) {
				conditions.push(eq(events.cattleId, criteria.cattleId as number));
			}

			// イベントタイプフィルタ
			if (criteria.eventType) {
				conditions.push(eq(events.eventType, criteria.eventType));
			}

			// 日付範囲フィルタ
			if (criteria.startDate) {
				conditions.push(gte(events.eventDatetime, criteria.startDate));
			}
			if (criteria.endDate) {
				conditions.push(lte(events.eventDatetime, criteria.endDate));
			}

			// カーソルベースページング
			if (criteria.cursor) {
				conditions.push(sql`${events.eventId} < ${criteria.cursor}`);
			}

			const result = await this.db
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
				.orderBy(desc(events.eventDatetime), desc(events.eventId))
				.limit(criteria.limit + 1); // +1 for hasNext detection

			const hasNext = result.length > criteria.limit;
			const results = hasNext ? result.slice(0, -1) : result;
			const nextCursor =
				hasNext && results.length > 0
					? results[results.length - 1].eventId
					: null;

			const eventList = eventDbMapper.toDomainList(results);

			return ok({
				results: eventList,
				nextCursor,
				hasNext
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to search events",
				cause
			});
		}
	}

	async create(
		event: Omit<Event, "eventId" | "createdAt" | "updatedAt">
	): Promise<Result<Event, EventError>> {
		try {
			const insertRecord = eventDbMapper.toInsertRecord(event);

			const result = await this.db
				.insert(events)
				.values(insertRecord)
				.returning();

			if (result.length === 0) {
				return err({
					type: "InfraError",
					message: "Failed to create event - no result returned"
				});
			}

			// 作成されたイベントを再取得（JOINデータを含む）
			const createdEvent = await this.findById(
				result[0].eventId as EventId,
				event.cattleId as unknown as UserId // TODO: Fix this - need proper owner lookup
			);

			if (!createdEvent.ok || !createdEvent.value) {
				return err({
					type: "InfraError",
					message: "Failed to retrieve created event"
				});
			}

			return ok(createdEvent.value);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to create event",
				cause
			});
		}
	}

	async update(
		eventId: EventId,
		updates: Partial<Event>,
		ownerUserId: UserId
	): Promise<Result<Event, EventError>> {
		try {
			// 権限チェック
			const existingEvent = await this.findById(eventId, ownerUserId);
			if (!existingEvent.ok) return existingEvent;

			if (!existingEvent.value) {
				return err({
					type: "NotFound",
					entity: "Event",
					id: eventId,
					message: "Event not found"
				});
			}

			const updateRecord = eventDbMapper.toUpdateRecord(updates);
			updateRecord.updatedAt = new Date().toISOString();

			await this.db
				.update(events)
				.set(updateRecord)
				.where(eq(events.eventId, eventId as number));

			// 更新されたイベントを再取得
			const updatedEvent = await this.findById(eventId, ownerUserId);
			if (!updatedEvent.ok || !updatedEvent.value) {
				return err({
					type: "InfraError",
					message: "Failed to retrieve updated event"
				});
			}

			return ok(updatedEvent.value);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to update event",
				cause
			});
		}
	}

	async delete(
		eventId: EventId,
		ownerUserId: UserId
	): Promise<Result<void, EventError>> {
		try {
			// 権限チェック
			const existingEvent = await this.findById(eventId, ownerUserId);
			if (!existingEvent.ok) return existingEvent;

			if (!existingEvent.value) {
				return err({
					type: "NotFound",
					entity: "Event",
					id: eventId,
					message: "Event not found"
				});
			}

			await this.db.delete(events).where(eq(events.eventId, eventId as number));

			return ok(undefined);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to delete event",
				cause
			});
		}
	}

	async findByDateRange(
		ownerUserId: UserId,
		startDate: Date,
		endDate: Date,
		eventTypes?: EventType[]
	): Promise<Result<Event[], EventError>> {
		try {
			const conditions = [
				eq(cattle.ownerUserId, ownerUserId as number),
				gte(events.eventDatetime, startDate.toISOString()),
				lte(events.eventDatetime, endDate.toISOString())
			];

			if (eventTypes && eventTypes.length > 0) {
				conditions.push(inArray(events.eventType, eventTypes));
			}

			const result = await this.db
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
				.orderBy(desc(events.eventDatetime));

			const eventList = eventDbMapper.toDomainList(result);
			return ok(eventList);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find events by date range",
				cause
			});
		}
	}

	async findRecent(
		ownerUserId: UserId,
		limit: number
	): Promise<Result<Event[], EventError>> {
		try {
			const result = await this.db
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
				.where(eq(cattle.ownerUserId, ownerUserId as number))
				.orderBy(desc(events.eventDatetime))
				.limit(limit);

			const eventList = eventDbMapper.toDomainList(result);
			return ok(eventList);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find recent events",
				cause
			});
		}
	}

	async findUpcoming(
		ownerUserId: UserId,
		limit: number
	): Promise<Result<Event[], EventError>> {
		try {
			const now = new Date().toISOString();

			const result = await this.db
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
						eq(cattle.ownerUserId, ownerUserId as number),
						gte(events.eventDatetime, now)
					)
				)
				.orderBy(asc(events.eventDatetime))
				.limit(limit);

			const eventList = eventDbMapper.toDomainList(result);
			return ok(eventList);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find upcoming events",
				cause
			});
		}
	}

	async getEventStats(
		ownerUserId: UserId,
		startDate: Date,
		endDate: Date
	): Promise<Result<EventStats, EventError>> {
		try {
			// 基本統計
			const totalResult = await this.db
				.select({ count: sql<number>`count(*)` })
				.from(events)
				.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
				.where(
					and(
						eq(cattle.ownerUserId, ownerUserId as number),
						gte(events.eventDatetime, startDate.toISOString()),
						lte(events.eventDatetime, endDate.toISOString())
					)
				);

			// イベントタイプ別統計
			const typeStatsResult = await this.db
				.select({
					eventType: events.eventType,
					count: sql<number>`count(*)`
				})
				.from(events)
				.innerJoin(cattle, eq(events.cattleId, cattle.cattleId))
				.where(
					and(
						eq(cattle.ownerUserId, ownerUserId as number),
						gte(events.eventDatetime, startDate.toISOString()),
						lte(events.eventDatetime, endDate.toISOString())
					)
				)
				.groupBy(events.eventType);

			const totalEvents = totalResult[0]?.count || 0;
			const eventsByType: Record<string, number> = {};
			for (const stat of typeStatsResult) {
				eventsByType[stat.eventType] = stat.count;
			}

			// 月別統計は簡略化（実装複雑度を考慮）
			const eventsByMonth: Array<{ month: string; count: number }> = [];

			const stats: EventStats = {
				totalEvents,
				eventsByType,
				eventsByMonth,
				criticalEventsCount:
					eventsByType.CALVING || 0 + eventsByType.DEATH || 0,
				upcomingEventsCount: 0 // 別途計算が必要
			};

			return ok(stats);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to get event stats",
				cause
			});
		}
	}
}
