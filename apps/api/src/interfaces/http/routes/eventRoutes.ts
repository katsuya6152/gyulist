/**
 * Event Routes - New Architecture
 *
 * イベント管理の新アーキテクチャルート定義
 */

import { zValidator } from "@hono/zod-validator";
import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import type { Bindings } from "../../../types";
import { makeEventController } from "../controllers/EventController";
import { jwtMiddleware } from "../middleware/jwt";

// Validation schemas
const createEventSchema = z.object({
	cattleId: z.number().positive("牛のIDは正の数である必要があります"),
	eventType: z.string().min(1, "イベントタイプは必須です"),
	eventDatetime: z.string().min(1, "イベント日時は必須です"),
	notes: z.string().optional()
});

const updateEventSchema = z.object({
	eventType: z.string().min(1, "イベントタイプは必須です").optional(),
	eventDatetime: z.string().min(1, "イベント日時は必須です").optional(),
	notes: z.string().optional()
});

const searchEventsQuerySchema = z.object({
	cattleId: z.coerce.number().positive().optional(),
	eventType: z.string().optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	cursor: z.coerce.number().positive().optional()
});

/**
 * Create Event Routes
 */
export function createEventRoutes() {
	const app = new Hono<{ Bindings: Bindings }>()
		.use("*", jwtMiddleware)

		// イベント一覧・検索
		.get("/", zValidator("query", searchEventsQuerySchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeEventController(deps);
			return controller.search(c);
		})

		// イベント作成
		.post("/", zValidator("json", createEventSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeEventController(deps);
			return controller.create(c);
		})

		// 特定の牛のイベント一覧
		.get("/cattle/:cattleId", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeEventController(deps);
			return controller.listByCattleId(c);
		})

		// イベント詳細取得
		.get("/:id", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeEventController(deps);
			return controller.get(c);
		})

		// イベント更新
		.patch("/:id", zValidator("json", updateEventSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeEventController(deps);
			return controller.update(c);
		})

		// イベント削除
		.delete("/:id", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeEventController(deps);
			return controller.delete(c);
		});

	return app;
}
