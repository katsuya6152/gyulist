import { Hono } from "hono";
import { hc } from "hono/client";
import { BASE_PATH, type Bindings } from "./config/app";
import { createRoutes } from "./routes";

const app = new Hono<{ Bindings: Bindings }>().basePath(BASE_PATH);

const routes = createRoutes(app);

export type AppType = typeof routes;

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default app;
