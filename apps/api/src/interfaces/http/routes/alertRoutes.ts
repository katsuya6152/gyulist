/**
 * Alert Routes - New Architecture
 *
 * アラート管理の新アーキテクチャルート定義
 */

import { zValidator } from "@hono/zod-validator";
import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import { jwtMiddleware } from "../../../middleware/jwt";
import type { AlertId } from "../../../shared/brand";
import type { Bindings } from "../../../types";

// Validation schemas
const updateAlertSchema = z.object({
	status: z
		.enum(["active", "acknowledged", "resolved", "dismissed"])
		.optional(),
	memo: z.string().optional()
});

/**
 * Create Alert Routes
 */
export function createAlertRoutes() {
	const app = new Hono<{ Bindings: Bindings }>();

	// Get alerts for user
	app.get("/", jwtMiddleware, async (c) => {
		const db = c.env.DB;
		const dependencies = makeDependencies(db, { now: () => new Date() });
		const userId = c.get("jwtPayload").userId;

		try {
			const result = await dependencies.useCases.getAlertsUseCase({
				ownerUserId: userId
			});

			if (!result.ok) {
				return c.json({ error: "Failed to get alerts" }, 500);
			}

			return c.json({
				data: {
					results: result.value.results,
					total: result.value.total,
					summary: result.value.summary
				}
			});
		} catch (error) {
			console.error("Alert fetch error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});

	// Update alert status
	app.patch(
		"/:alertId",
		jwtMiddleware,
		zValidator("json", updateAlertSchema),
		async (c) => {
			const db = c.env.DB;
			const dependencies = makeDependencies(db, { now: () => new Date() });
			const alertId = c.req.param("alertId");
			const userId = c.get("jwtPayload").userId;
			const updates = c.req.valid("json");

			try {
				const result = await dependencies.useCases.updateAlertStatusUseCase({
					alertId: Number.parseInt(alertId) as unknown as AlertId,
					newStatus: updates.status || "active",
					requestingUserId: userId
				});

				if (!result.ok) {
					if (result.error.type === "AlertNotFoundError") {
						return c.json({ error: "Alert not found" }, 404);
					}
					return c.json({ error: "Failed to update alert" }, 500);
				}

				return c.json({ message: "Alert updated successfully" });
			} catch (error) {
				console.error("Alert update error:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		}
	);

	return app;
}
