import type { Hono } from "hono";
import { createAlertRoutes } from "../interfaces/http/routes/alertRoutes";
// New Architecture Routes
import {
	createAuthRoutes,
	createUserRoutes
} from "../interfaces/http/routes/authRoutes";
import { createCattleRoutes } from "../interfaces/http/routes/cattleRoutes";
import { createEventRoutes } from "../interfaces/http/routes/eventRoutes";
import { createKpiRoutes } from "../interfaces/http/routes/kpiRoutes";
import { corsMiddleware } from "../middleware/cors";
import type { Env } from "../shared/ports/d1Database";
import healthRoutes from "./health";
import oauthRoutes from "./oauth";

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
		.route("/cattle", createCattleRoutes());
};
