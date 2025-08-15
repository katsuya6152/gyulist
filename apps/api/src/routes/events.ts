import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { updateStatus as updateCattleStatusUC } from "../contexts/cattle/domain/services/updateStatus";
import {
	createEventSchema,
	searchEventSchema,
	updateEventSchema
} from "../contexts/events/domain/codecs/input";
import {
	eventResponseSchema,
	eventsOfCattleResponseSchema,
	eventsSearchResponseSchema
} from "../contexts/events/domain/codecs/output";
import { create as createEventUC } from "../contexts/events/domain/services/create";
import { remove as deleteEventUC } from "../contexts/events/domain/services/delete";
import { getById as getEventByIdUC } from "../contexts/events/domain/services/getById";
import { listByCattle as listEventsByCattleUC } from "../contexts/events/domain/services/listByCattle";
import { search as searchEventsUC } from "../contexts/events/domain/services/search";
import { update as updateEventUC } from "../contexts/events/domain/services/update";
import { jwtMiddleware } from "../middleware/jwt";
import { makeDeps } from "../shared/config/di";
import { toHttpStatus } from "../shared/http/error-mapper";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)

	// イベント一覧・検索（FDM repoへ委譲、契約維持）
	.get("/", zValidator("query", searchEventSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const q = c.req.valid("query");
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const result = await searchEventsUC({ repo: deps.eventsRepo })(
				userId as unknown as import("../shared/brand").UserId,
				q
			);
			if (!result.ok) {
				c.status(
					toHttpStatus(result.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: result.error });
			}
			return c.json(eventsSearchResponseSchema.parse(result.value));
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			return c.json({ message }, 500);
		}
	})

	// 特定の牛のイベント一覧（FDM repoへ委譲、契約維持）
	.get("/cattle/:cattleId", async (c) => {
		const cattleId = Number.parseInt(c.req.param("cattleId"));
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(cattleId)) {
			return c.json({ message: "無効な牛IDです" }, 400);
		}

		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const res = await listEventsByCattleUC({ repo: deps.eventsRepo })(
				cattleId as unknown as import("../shared/brand").CattleId,
				userId as unknown as import("../shared/brand").UserId
			);
			if (!res.ok) {
				c.status(
					toHttpStatus(res.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: res.error });
			}
			return c.json(eventsOfCattleResponseSchema.parse({ results: res.value }));
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (message.includes("見つからない")) {
				return c.json({ message }, 404);
			}
			if (message.includes("アクセス権限")) {
				return c.json({ message }, 403);
			}
			return c.json({ message }, 500);
		}
	})

	// イベント詳細
	.get("/:id", async (c) => {
		const eventId = Number.parseInt(c.req.param("id"));
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(eventId)) {
			return c.json({ message: "無効なイベントIDです" }, 400);
		}

		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const res = await getEventByIdUC({ repo: deps.eventsRepo })(
				eventId as unknown as import("../contexts/events/ports").EventId,
				userId as unknown as import("../contexts/events/ports").UserId
			);
			if (!res.ok) {
				c.status(
					toHttpStatus(res.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: res.error });
			}
			return c.json(eventResponseSchema.parse(res.value));
		} catch (e) {
			console.error(e);
			return c.json({ message: "内部サーバーエラーが発生しました" }, 500);
		}
	})

	// イベント新規作成
	.post("/", zValidator("json", createEventSchema), async (c) => {
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const createdRes = await createEventUC({ repo: deps.eventsRepo })(data);
			if (!createdRes.ok) {
				c.status(
					toHttpStatus(createdRes.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: createdRes.error });
			}
			const created = createdRes.value;

			// 副作用: CALVING -> RESTING, SHIPMENT -> SHIPPED（契約維持）
			if (data.eventType === "SHIPMENT" || data.eventType === "CALVING") {
				const newStatus = data.eventType === "SHIPMENT" ? "SHIPPED" : "RESTING";
				const res = await updateCattleStatusUC({
					repo: deps.cattleRepo,
					clock: deps.clock
				})({
					requesterUserId: userId as unknown as number,
					id: data.cattleId as unknown as number,
					newStatus,
					reason: null
				} as unknown as Parameters<ReturnType<typeof updateCattleStatusUC>>[0]);
				if (!res.ok) {
					c.status(
						toHttpStatus(res.error) as
							| 200
							| 201
							| 400
							| 401
							| 403
							| 404
							| 409
							| 500
					);
					return c.json({ error: res.error });
				}
			}
			{
				const parsed = eventResponseSchema.safeParse(created);
				return c.json(parsed.success ? parsed.data : created, 201);
			}
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (message.includes("見つからない")) {
				return c.json({ message }, 404);
			}
			if (message.includes("アクセス権限")) {
				return c.json({ message }, 403);
			}
			return c.json({ message }, 500);
		}
	})

	// イベント更新
	.patch("/:id", zValidator("json", updateEventSchema), async (c) => {
		const eventId = Number.parseInt(c.req.param("id"));
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(eventId)) {
			return c.json({ message: "無効なイベントIDです" }, 400);
		}

		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const updatedRes = await updateEventUC({ repo: deps.eventsRepo })(
				eventId as unknown as import("../shared/brand").Brand<
					number,
					"EventId"
				>,
				data
			);
			if (!updatedRes.ok) {
				c.status(
					toHttpStatus(updatedRes.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: updatedRes.error });
			}
			{
				const parsed = eventResponseSchema.safeParse(updatedRes.value);
				return c.json(parsed.success ? parsed.data : updatedRes.value);
			}
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (message.includes("見つからない")) {
				return c.json({ message }, 404);
			}
			if (message.includes("アクセス権限")) {
				return c.json({ message }, 403);
			}
			return c.json({ message }, 500);
		}
	})

	// イベント削除
	.delete("/:id", async (c) => {
		const eventId = Number.parseInt(c.req.param("id"));
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(eventId)) {
			return c.json({ message: "無効なイベントIDです" }, 400);
		}

		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const del = await deleteEventUC({ repo: deps.eventsRepo })(
				eventId as unknown as import("../shared/brand").Brand<number, "EventId">
			);
			if (!del.ok) {
				c.status(
					toHttpStatus(del.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: del.error });
			}
			return c.json({ message: "イベントが正常に削除されました" });
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (message.includes("見つからない")) {
				return c.json({ message }, 404);
			}
			if (message.includes("アクセス権限")) {
				return c.json({ message }, 403);
			}
			return c.json({ message }, 500);
		}
	});

export default app;
