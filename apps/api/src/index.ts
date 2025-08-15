import { Hono } from "hono";
import { hc } from "hono/client";
import { createRoutes } from "./routes";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

const routes = createRoutes(app);

export type AppType = typeof routes;
export * from "./contexts/events/domain/constants";
export * from "./contexts/cattle/domain/constants";
export * from "./contexts/cattle/domain/codecs/input";
export * from "./contexts/events/domain/codecs/input";

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default app;
