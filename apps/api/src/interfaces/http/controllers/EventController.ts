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
		return executeUseCase(c, async () => {
			const eventId = Number.parseInt(c.req.param("id"), 10) as EventId;
			const jwtPayload = c.get("jwtPayload");
			const requestingUserId = jwtPayload.userId as UserId;

			const getEventUseCase = deps.useCases.getEventUseCase;
			const result = await getEventUseCase({ eventId, requestingUserId });

			return result;
		});
	},

	/**
	 * イベントの新規作成
	 */
	async create(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const input = (await c.req.json()) as Record<string, unknown>;

			const createEventUseCase = deps.useCases.createEventUseCase;
			const result = await createEventUseCase({
				cattleId: input.cattleId as CattleId,
				eventType: input.eventType as unknown as EventType,
				eventDatetime: new Date(input.eventDatetime as string),
				notes: (input.notes as string) || null
			});

			return result;
		});
	},

	/**
	 * イベントの検索・一覧取得
	 */
	async search(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
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

			return result;
		});
	},

	/**
	 * 牛IDでイベント一覧を取得
	 */
	async listByCattleId(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const cattleId = Number.parseInt(c.req.param("cattleId"), 10) as CattleId;
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;

			const result = await deps.repositories.eventRepo.listByCattleId(
				cattleId,
				ownerUserId
			);

			return result;
		});
	},

	/**
	 * イベントの更新
	 */
	async update(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const eventId = Number.parseInt(c.req.param("id"), 10) as EventId;
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;
			const updates = (await c.req.json()) as Record<string, unknown>;

			const updateData: Record<string, unknown> = {};
			if (updates.eventType !== undefined)
				updateData.eventType = updates.eventType;
			if (updates.eventDatetime !== undefined)
				updateData.eventDatetime = new Date(updates.eventDatetime as string);
			if (updates.notes !== undefined) updateData.notes = updates.notes;

			const result = await deps.repositories.eventRepo.update(
				eventId,
				updateData,
				ownerUserId
			);

			return result;
		});
	},

	/**
	 * イベントの削除
	 */
	async delete(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const eventId = Number.parseInt(c.req.param("id"), 10) as EventId;
			const jwtPayload = c.get("jwtPayload");
			const ownerUserId = jwtPayload.userId as UserId;

			const result = await deps.repositories.eventRepo.delete(
				eventId,
				ownerUserId
			);

			if (result.ok) {
				return { ok: true, value: { message: "Event deleted successfully" } };
			}
			return result;
		});
	}
});
