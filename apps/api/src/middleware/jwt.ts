import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import type { Bindings } from "../types";

export const jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (
	c,
	next,
) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) {
		return c.json({ error: "No token provided" }, 401);
	}

	const token = authHeader.replace("Bearer ", "");

	try {
		const decodedPayload = await verify(token, c.env.JWT_SECRET);
		c.set("jwtPayload", decodedPayload);
		await next();
	} catch (e) {
		return c.json({ error: "Invalid token" }, 401);
	}
};
