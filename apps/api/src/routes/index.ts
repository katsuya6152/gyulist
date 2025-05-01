import type { Hono } from "hono";
import type { Bindings } from "../config/app";
import { corsMiddleware } from "../middleware/cors";
import health from "./health";
import users from "./users";

// biome-ignore format:
export const createRoutes = (app: Hono<{ Bindings: Bindings }>) => {
	return app
		.use("*", corsMiddleware)
		.route("/", health)
		.route("/users", users);
};
