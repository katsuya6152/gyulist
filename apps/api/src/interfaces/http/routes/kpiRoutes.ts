/**
 * KPI HTTP Routes
 *
 * KPI管理のHTTPルート定義
 */

import { Hono } from "hono";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import type { Bindings } from "../../../types";
import { makeKpiController } from "../controllers/KpiController";
import { jwtMiddleware } from "../middleware/jwt";

/**
 * KPIルートを作成
 *
 * @returns KPI Honoアプリ
 */
export function createKpiRoutes() {
	const app = new Hono<{ Bindings: Bindings }>()
		.use("*", jwtMiddleware)

		// ルート定義
		.get("/breeding", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeKpiController(deps);
			return controller.getBreedingKpi(c);
		})

		.post("/breeding/calculate", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeKpiController(deps);
			return controller.calculateBreedingMetrics(c);
		});

	return app;
}
