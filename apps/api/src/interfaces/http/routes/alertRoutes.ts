/**
 * Alert Routes - New Architecture
 *
 * アラート管理の新アーキテクチャルート定義
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import { jwtMiddleware } from "../../../middleware/jwt";
import type { Bindings } from "../../../types";
import { makeAlertController } from "../controllers/AlertController";

// Validation schemas
const updateAlertSchema = z.object({
	status: z
		.enum(["active", "acknowledged", "resolved", "dismissed"])
		.optional(),
	memo: z.string().optional()
});

const updateMemoSchema = z.object({
	memo: z.string()
});

const updateStatusSchema = z.object({
	status: z.enum(["acknowledged", "resolved", "dismissed"])
});

/**
 * Create Alert Routes
 */
export function createAlertRoutes() {
	const app = new Hono<{ Bindings: Bindings }>()
		.use("*", jwtMiddleware)

		// Get alerts for user
		.get("/", async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeAlertController(deps);
			return controller.getAlerts(c);
		})

		// Update alert status
		.patch("/:alertId", zValidator("json", updateAlertSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeAlertController(deps);
			return controller.updateAlertStatus(c);
		})

		// Update alert memo
		.put("/:alertId/memo", zValidator("json", updateMemoSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makeAlertController(deps);
			return controller.updateAlertMemo(c);
		})

		// Update alert status (dedicated endpoint)
		.put(
			"/:alertId/status",
			zValidator("json", updateStatusSchema),
			async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const controller = makeAlertController(deps);
				return controller.updateAlertStatus(c);
			}
		);

	return app;
}
