import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import {
	createNewEvent,
	deleteEventData,
	getEventById,
	getEventsByCattleId,
	searchEventList,
	updateEventData,
} from "../services/eventService";
import type { Bindings } from "../types";
import {
	createEventSchema,
	searchEventSchema,
	updateEventSchema,
} from "../validators/eventValidator";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)

	// イベント一覧・検索
	.get("/", zValidator("query", searchEventSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const query = c.req.valid("query");
			const result = await searchEventList(c.env.DB, userId, query);
			return c.json(result);
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			return c.json({ message }, 500);
		}
	})

	// 特定の牛のイベント一覧
	.get("/cattle/:cattleId", async (c) => {
		const cattleId = Number.parseInt(c.req.param("cattleId"));
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(cattleId)) {
			return c.json({ message: "無効な牛IDです" }, 400);
		}

		try {
			const events = await getEventsByCattleId(c.env.DB, cattleId, userId);
			return c.json({ results: events });
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (
				message.includes("見つからない") ||
				message.includes("アクセス権限")
			) {
				return c.json(
					{ message },
					message.includes("見つからない") ? 404 : 403,
				);
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
			const event = await getEventById(c.env.DB, eventId, userId);
			return c.json(event);
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (
				message.includes("見つからない") ||
				message.includes("アクセス権限")
			) {
				return c.json(
					{ message },
					message.includes("見つからない") ? 404 : 403,
				);
			}
			return c.json({ message }, 500);
		}
	})

	// イベント新規作成
	.post("/", zValidator("json", createEventSchema), async (c) => {
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		try {
			const result = await createNewEvent(c.env.DB, data, userId);
			return c.json(result, 201);
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (
				message.includes("見つからない") ||
				message.includes("アクセス権限")
			) {
				return c.json(
					{ message },
					message.includes("見つからない") ? 404 : 403,
				);
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
			const result = await updateEventData(c.env.DB, eventId, data, userId);
			return c.json(result);
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (
				message.includes("見つからない") ||
				message.includes("アクセス権限")
			) {
				return c.json(
					{ message },
					message.includes("見つからない") ? 404 : 403,
				);
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
			await deleteEventData(c.env.DB, eventId, userId);
			return c.json({ message: "イベントが正常に削除されました" });
		} catch (e) {
			console.error(e);
			const message =
				e instanceof Error ? e.message : "内部サーバーエラーが発生しました";
			if (
				message.includes("見つからない") ||
				message.includes("アクセス権限")
			) {
				return c.json(
					{ message },
					message.includes("見つからない") ? 404 : 403,
				);
			}
			return c.json({ message }, 500);
		}
	});

export default app;
