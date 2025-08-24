/**
 * Cattle HTTP Routes
 *
 * 牛管理のHTTPルート定義（新アーキテクチャ）
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema,
	updateStatusSchema
} from "../../../domain/types/cattle";
import {
	cattleListResponseSchema,
	cattleResponseSchema,
	cattleStatusCountsResponseSchema,
	cattleStatusUpdateResponseSchema
} from "../../../domain/types/cattle";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import { jwtMiddleware } from "../../../middleware/jwt";
import type { Bindings } from "../../../types";
import { makeCattleController } from "../controllers/CattleController";

/**
 * 牛管理のHTTPルートを作成
 *
 * @returns Honoアプリケーション
 */
export function createCattleRoutes() {
	const app = new Hono<{ Bindings: Bindings }>()
		.use("*", jwtMiddleware)

		// 牛の一覧・検索
		.get("/", zValidator("query", searchCattleSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeCattleController(deps);
			return controller.search(c);
		})

		// 牛の詳細取得
		.get("/:id", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeCattleController(deps);
			return controller.get(c);
		})

		// 牛の新規作成
		.post("/", zValidator("json", createCattleSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeCattleController(deps);
			return controller.create(c);
		})

		// 牛の更新
		.patch("/:id", zValidator("json", updateCattleSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeCattleController(deps);
			return controller.update(c);
		})

		// 牛の削除
		.delete("/:id", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeCattleController(deps);
			return controller.delete(c);
		});

	return app;
}
