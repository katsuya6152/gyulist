import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import health from "./routes/health";
import users from "./routes/users";

type Bindings = {
	DB: AnyD1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

const routes = app
	.use(
		"*",
		cors({
			origin: ["http://localhost:3000", "https://gyulist.pages.dev"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type"],
			credentials: true,
		}),
	)
	.route("/", health)
	.route("/users", users);

export type AppType = typeof routes;

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default app;
