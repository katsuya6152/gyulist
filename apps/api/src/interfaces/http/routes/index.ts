import type { Hono } from "hono";
import type { Env } from "../../../shared/ports/d1Database";
import { corsMiddleware } from "../middleware/cors";
import { createAdminRoutes } from "./adminRoutes";
import { createAlertRoutes } from "./alertRoutes";
import { createAuthRoutes, createUserRoutes } from "./authRoutes";
import { createCattleRoutes } from "./cattleRoutes";
import { createEventRoutes } from "./eventRoutes";
import healthRoutes from "./healthRoutes";
import { createKpiRoutes } from "./kpiRoutes";
import oauthRoutes from "./oauthRoutes";
import { createPreRegisterRoutes } from "./preRegisterRoutes";
import { createShipmentRoutes } from "./shipmentRoutes";

// biome-ignore format:
export const createRoutes = (app: Hono<{ Bindings: Env }>) => {
	return app
		.basePath("/api/v1/")
		.use("*", corsMiddleware)
		.get("/", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))
		.route("/health", healthRoutes)
		.route("/auth", createAuthRoutes())
		.route("/oauth", oauthRoutes)
		.route("/users", createUserRoutes())
		.route("/alerts", createAlertRoutes())
		.route("/events", createEventRoutes())
		.route("/kpi", createKpiRoutes())
		.route("/cattle", createCattleRoutes())
		.route("/shipments", createShipmentRoutes())
		.route("/admin", createAdminRoutes())
		.route("/pre-register", createPreRegisterRoutes());
};
