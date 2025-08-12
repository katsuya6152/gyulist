import type { MiddlewareHandler } from "hono";
import type { Bindings } from "../types";

export const corsMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (
	c,
	next,
) => {
	const origin = c.req.header("Origin");
	if (origin === c.env.WEB_ORIGIN) {
		c.header("Access-Control-Allow-Origin", origin);
		c.header("Vary", "Origin");
	}
	if (c.req.method === "OPTIONS") {
		c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
		c.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
		return c.body(null, 204);
	}
	await next();
};
