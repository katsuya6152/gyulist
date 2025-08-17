import type { Hono } from "hono";
import { corsMiddleware } from "../middleware/cors";
import type { Bindings } from "../types";
import adminRoutes from "./admin";
import alertsRoutes from "./alerts";
import authRoutes from "./auth";
import cattleRoutes from "./cattle";
import eventsRoutes from "./events";
import healthRoutes from "./health";
import kpiRoutes from "./kpi";
import oauthRoutes from "./oauth";
import openapiRoutes from "./openapi";
import preRegisterRoutes from "./pre-register";
import usersRoutes from "./users";

// biome-ignore format:
export const createRoutes = (app: Hono<{ Bindings: Bindings }>) => {
return app
.basePath("/api/v1")
.use("*", corsMiddleware)
.get("/", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))
.route("/", healthRoutes)
.route("/pre-register", preRegisterRoutes)
.route("/admin", adminRoutes)
.route("/auth", authRoutes)
.route("/oauth", oauthRoutes)
.route("/users", usersRoutes)
.route("/alerts", alertsRoutes)
.route("/kpi", kpiRoutes)
.route("/cattle", cattleRoutes)
.route("/events", eventsRoutes)
// OpenAPI doc & Swagger UI are served under /api-docs
.route("/api-docs", openapiRoutes);
};
