import type { Hono } from "hono";
import { corsMiddleware } from "../middleware/cors";
import type { Bindings } from "../types";
import authRoutes from "./auth";
import cattleRoutes from "./cattle";
import eventsRoutes from "./events";
import healthRoutes from "./health";
import oauthRoutes from "./oauth";
import registrationsRoutes from "./registrations";
import usersRoutes from "./users";

// biome-ignore format:
export const createRoutes = (app: Hono<{ Bindings: Bindings }>) => {
	return app
		.basePath("/api/v1")
                .use("*", corsMiddleware)
                .route("/", healthRoutes)
                .route("/", registrationsRoutes)
                .route("/auth", authRoutes)
                .route("/oauth", oauthRoutes)
                .route("/users", usersRoutes)
                .route("/cattle", cattleRoutes)
                .route("/events", eventsRoutes);
};
