import { Hono } from "hono";
import { hc } from "hono/client";
import { createRoutes } from "./routes";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

const routes = createRoutes(app);

export type AppType = typeof routes;
export * from "./constants/events";
export * from "./constants/cattle";
export * from "./validators/cattleValidator";
export * from "./validators/eventValidator";

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default app;
