import type { Hono } from "hono";
import { corsMiddleware } from "../middleware/cors";
import type { Bindings } from "../types";
import auth from "./auth";
import cattle from "./cattle";
import events from "./events";
import health from "./health";
import users from "./users";

// biome-ignore format:
export const createRoutes = (app: Hono<{ Bindings: Bindings }>) => {
	return app
		.basePath("/api/v1")
		.use("*", corsMiddleware)
		.route("/", health)
		.route("/auth", auth)
		.route("/users", users)
		.route("/cattle", cattle)
		.route("/events", events);
};
