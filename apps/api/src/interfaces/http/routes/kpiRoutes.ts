/**
 * KPI HTTP Routes
 *
 * KPI管理のHTTPルート定義
 */

import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import type { Bindings } from "../../../types";
import { KpiController } from "../controllers/KpiController";

/**
 * KPIルートを作成
 *
 * @returns KPI Honoアプリ
 */
export function createKpiRoutes() {
	const app = new Hono<{ Bindings: Bindings }>();

	// ルート定義
	app.get("/breeding", async (c) => {
		const db = c.env.DB;
		const deps = makeDependencies(db, { now: () => new Date() });
		const kpiController = new KpiController(deps);
		return kpiController.getBreedingKpi(c);
	});
	app.get("/breeding/trends", async (c) => {
		const db = c.env.DB;
		const deps = makeDependencies(db, { now: () => new Date() });
		const kpiController = new KpiController(deps);
		return kpiController.getBreedingTrends(c);
	});
	app.post("/breeding/calculate", async (c) => {
		const db = c.env.DB;
		const deps = makeDependencies(db, { now: () => new Date() });
		const kpiController = new KpiController(deps);
		return kpiController.calculateBreedingMetrics(c);
	});

	return app;
}
