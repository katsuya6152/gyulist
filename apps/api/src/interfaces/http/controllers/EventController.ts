/**
 * Event HTTP Controller
 *
 * イベント管理のHTTPエンドポイントを処理するコントローラー
 */

import type { Context } from "hono";
import type { EventType } from "../../../domain/types/events/EventTypes";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import type { CattleId, EventId, UserId } from "../../../shared/brand";
import { executeUseCase } from "../../../shared/http/route-helpers";

/**
 * コントローラーの依存関係
 */
export type EventControllerDeps = Dependencies;

/**
 * イベント管理コントローラー
 */
export const makeEventController = (deps: EventControllerDeps) => ({
	/**
	 * イベントの詳細取得
	 */
	async get(c: Context): Promise<Response> {
		try {
			const eventId = Number.parseInt(c.req.param("id"), 10) as EventId;
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;

			const getEventUseCase = deps.useCases.getEventUseCase;
			const result = await getEventUseCase({
				eventId,
				requestingUserId: ownerUserId
			});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			if (!result.value) {
				return c.json({ error: "Event not found" }, 404);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json({
				data: {
					eventId: result.value.eventId,
					cattleId: result.value.cattleId,
					eventType: result.value.eventType,
					eventDatetime: result.value.eventDatetime,
					notes: result.value.notes,
					createdAt: result.value.createdAt,
					updatedAt: result.value.updatedAt,
					cattleName: result.value.cattleName,
					cattleEarTagNumber: result.value.cattleEarTagNumber
				}
			});
		} catch (error) {
			console.error("Get event error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	},

	/**
	 * イベント作成
	 */
	async create(c: Context): Promise<Response> {
		try {
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;
			const input = (await c.req.json()) as Record<string, unknown>;

			const createEventUseCase = deps.useCases.createEventUseCase;
			const result = await createEventUseCase({
				cattleId: input.cattleId as CattleId,
				eventType: input.eventType as EventType,
				eventDatetime: new Date(input.eventDatetime as string),
				notes: (input.notes as string) || null
			});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json(
				{
					data: {
						eventId: result.value.eventId,
						cattleId: result.value.cattleId,
						eventType: result.value.eventType,
						eventDatetime: result.value.eventDatetime,
						notes: result.value.notes,
						createdAt: result.value.createdAt,
						updatedAt: result.value.updatedAt,
						cattleName: result.value.cattleName,
						cattleEarTagNumber: result.value.cattleEarTagNumber
					}
				},
				201
			);
		} catch (error) {
			console.error("Create event error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	},

	/**
	 * イベントの検索・一覧取得
	 */
	async search(c: Context): Promise<Response> {
		try {
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;
			const query = c.req.query() as Record<string, unknown>;

			const searchEventsUseCase = deps.useCases.searchEventsUseCase;
			const result = await searchEventsUseCase({
				ownerUserId,
				cattleId: query.cattleId ? (query.cattleId as CattleId) : undefined,
				eventType: query.eventType as unknown as EventType | undefined,
				startDate: query.startDate as string | undefined,
				endDate: query.endDate as string | undefined,
				cursor: query.cursor
					? Number.parseInt(query.cursor as string, 10)
					: undefined,
				limit: query.limit
					? Math.min(
							100,
							Math.max(1, Number.parseInt(query.limit as string, 10))
						)
					: 20
			});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json({
				data: {
					results: result.value.results.map((event) => ({
						eventId: event.eventId,
						cattleId: event.cattleId,
						eventType: event.eventType,
						eventDatetime: event.eventDatetime,
						notes: event.notes,
						createdAt: event.createdAt,
						updatedAt: event.updatedAt,
						cattleName: event.cattleName,
						cattleEarTagNumber: event.cattleEarTagNumber
					})),
					nextCursor: result.value.nextCursor,
					hasNext: result.value.hasNext
				}
			});
		} catch (error) {
			console.error("Search events error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	},

	/**
	 * 牛IDでイベント一覧を取得
	 */
	async listByCattleId(c: Context): Promise<Response> {
		try {
			const cattleId = Number.parseInt(c.req.param("cattleId"), 10) as CattleId;
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;

			// リポジトリから直接取得
			const result = await deps.repositories.eventRepo.listByCattleId(
				cattleId,
				ownerUserId
			);

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json({
				data: {
					results: result.value.map((event) => ({
						eventId: event.eventId,
						cattleId: event.cattleId,
						eventType: event.eventType,
						eventDatetime: event.eventDatetime,
						notes: event.notes,
						createdAt: event.createdAt,
						updatedAt: event.updatedAt,
						cattleName: event.cattleName,
						cattleEarTagNumber: event.cattleEarTagNumber
					}))
				}
			});
		} catch (error) {
			console.error("List events by cattle ID error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	},

	/**
	 * イベント更新
	 */
	async update(c: Context): Promise<Response> {
		try {
			const eventId = Number.parseInt(c.req.param("id"), 10) as EventId;
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;
			const input = (await c.req.json()) as Record<string, unknown>;

			// リポジトリから直接更新
			const updateData: Record<string, unknown> = {};
			if (input.eventType !== undefined) updateData.eventType = input.eventType;
			if (input.eventDatetime !== undefined)
				updateData.eventDatetime = new Date(input.eventDatetime as string);
			if (input.notes !== undefined) updateData.notes = input.notes;

			const result = await deps.repositories.eventRepo.update(
				eventId,
				updateData,
				ownerUserId
			);

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json({
				data: {
					eventId: result.value.eventId,
					cattleId: result.value.cattleId,
					eventType: result.value.eventType,
					eventDatetime: result.value.eventDatetime,
					notes: result.value.notes,
					createdAt: result.value.createdAt,
					updatedAt: result.value.updatedAt,
					cattleName: result.value.cattleName,
					cattleEarTagNumber: result.value.cattleEarTagNumber
				}
			});
		} catch (error) {
			console.error("Update event error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	},

	/**
	 * イベント削除
	 */
	async delete(c: Context): Promise<Response> {
		try {
			const eventId = Number.parseInt(c.req.param("id"), 10) as EventId;
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;

			// リポジトリから直接削除
			const result = await deps.repositories.eventRepo.delete(
				eventId,
				ownerUserId
			);

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			return new Response(null, { status: 204 });
		} catch (error) {
			console.error("Delete event error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
});
