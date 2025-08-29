/**
 * Cattle HTTP Routes
 *
 * 牛管理のHTTPルート定義（新アーキテクチャ）
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema
} from "../../../domain/types/cattle";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import type { Env } from "../../../types";
import { makeCattleController } from "../controllers/CattleController";
import { jwtMiddleware } from "../middleware/jwt";

// ステータス更新用のスキーマ
const updateCattleStatusSchema = z.object({
	status: z.enum([
		"HEALTHY",
		"PREGNANT",
		"RESTING",
		"TREATING",
		"SHIPPED",
		"DEAD"
	]),
	reason: z.string().optional()
});

/**
 * 牛管理のHTTPルートを作成
 *
 * @returns Honoアプリケーション
 */
export function createCattleRoutes() {
	const app = new Hono<{ Bindings: Env }>()
		.use("*", jwtMiddleware)

		// 牛の一覧・検索
		.get("/", zValidator("query", searchCattleSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeCattleController(deps);
			return controller.search(c);
		})

		// ステータス別頭数取得
		.get("/status-counts", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeCattleController(deps);
			return controller.getStatusCounts(c);
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
		})

		// 牛のステータス更新
		.patch(
			"/:id/status",
			zValidator("json", updateCattleStatusSchema),
			async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const controller = makeCattleController(deps);
				return controller.updateStatus(c);
			}
		);

	return app;
}
