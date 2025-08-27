/**
 * Shipment HTTP Routes
 *
 * 出荷管理のHTTPルートを定義
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { createDependencies } from "../../../infrastructure/config/dependencies";
import type { Env } from "../../../shared/ports/d1Database";
import { makeShipmentController } from "../controllers/ShipmentController";
import { jwtMiddleware } from "../middleware/jwt";

/**
 * 出荷実績作成のスキーマ
 */
const createShipmentSchema = z.object({
	cattleId: z.number().int().positive(),
	shipmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	price: z.number().int().positive(),
	weight: z.number().positive().optional(),
	ageAtShipment: z.number().int().positive().optional(),
	buyer: z.string().optional(),
	notes: z.string().optional()
});

/**
 * 出荷予定作成のスキーマ
 */
const createShipmentPlanSchema = z.object({
	cattleId: z.number().int().positive(),
	plannedShipmentMonth: z.string().regex(/^\d{4}-\d{2}$/)
});

/**
 * 出荷実績更新のスキーマ
 */
const updateShipmentSchema = z.object({
	shipmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	price: z.number().int().positive(),
	weight: z.number().positive().optional(),
	ageAtShipment: z.number().int().positive().optional(),
	buyer: z.string().optional(),
	notes: z.string().optional()
});

/**
 * 出荷予定更新のスキーマ
 */
const updateShipmentPlanSchema = z.object({
	plannedShipmentMonth: z.string().regex(/^\d{4}-\d{2}$/)
});

/**
 * 出荷管理ルートを作成
 */
export const createShipmentRoutes = () => {
	const app = new Hono<{ Bindings: Env }>();

	return (
		app
			.use("*", jwtMiddleware)
			// 出荷実績関連
			.post("/", zValidator("json", createShipmentSchema), async (c) => {
				const deps = createDependencies(c.env.DB);
				const controller = makeShipmentController(deps);
				return controller.createShipment(c);
			})
			.get("/", async (c) => {
				const deps = createDependencies(c.env.DB);
				const controller = makeShipmentController(deps);
				return controller.getShipments(c);
			})
			.put(
				"/:shipmentId",
				zValidator("json", updateShipmentSchema),
				async (c) => {
					const deps = createDependencies(c.env.DB);
					const controller = makeShipmentController(deps);
					return controller.updateShipment(c);
				}
			)
			.delete("/:shipmentId", async (c) => {
				const deps = createDependencies(c.env.DB);
				const controller = makeShipmentController(deps);
				return controller.deleteShipment(c);
			})
			.get("/mothers/list", async (c) => {
				const deps = createDependencies(c.env.DB);
				const controller = makeShipmentController(deps);
				return controller.getMotherShipmentsList(c);
			})
			.get("/price-stats", async (c) => {
				const deps = createDependencies(c.env.DB);
				const controller = makeShipmentController(deps);
				return controller.getPriceStats(c);
			})
			// 出荷予定関連
			.post(
				"/plans",
				zValidator("json", createShipmentPlanSchema),
				async (c) => {
					const deps = createDependencies(c.env.DB);
					const controller = makeShipmentController(deps);
					return controller.createShipmentPlan(c);
				}
			)
			.get("/plans", async (c) => {
				const deps = createDependencies(c.env.DB);
				const controller = makeShipmentController(deps);
				return controller.getShipmentPlans(c);
			})
			.put(
				"/plans/:cattleId",
				zValidator("json", updateShipmentPlanSchema),
				async (c) => {
					const deps = createDependencies(c.env.DB);
					const controller = makeShipmentController(deps);
					return controller.updateShipmentPlan(c);
				}
			)
			.delete("/plans/:cattleId", async (c) => {
				const deps = createDependencies(c.env.DB);
				const controller = makeShipmentController(deps);
				return controller.deleteShipmentPlan(c);
			})
	);
};
