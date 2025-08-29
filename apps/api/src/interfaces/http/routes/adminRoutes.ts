/**
 * Admin HTTP Routes
 *
 * 管理者向けの管理機能のHTTPルート定義
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import type { Env } from "../../../types";
import { makeAdminController } from "../controllers/AdminController";
import { basicAuthMiddleware } from "../middleware/basicAuth";

// Validation schemas
const adminRegistrationsQuerySchema = z.object({
	q: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	source: z.string().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0)
});

/**
 * 管理APIルートを作成
 *
 * @returns Honoアプリケーション
 */
export function createAdminRoutes() {
	const app = new Hono<{ Bindings: Env }>()
		.use("*", basicAuthMiddleware)

		// 事前登録一覧取得
		.get(
			"/registrations",
			zValidator("query", adminRegistrationsQuerySchema),
			async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const controller = makeAdminController(deps);
				return controller.getRegistrations(c);
			}
		)

		// 事前登録CSVエクスポート
		.get(
			"/registrations.csv",
			zValidator("query", adminRegistrationsQuerySchema),
			async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const controller = makeAdminController(deps);
				return controller.exportRegistrationsCsv(c);
			}
		);

	return app;
}
