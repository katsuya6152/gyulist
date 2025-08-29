import type { MiddlewareHandler } from "hono";
import type { Env } from "../../../types";

export const jwtMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
	c,
	next
) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) {
		return c.json({ error: "No token provided" }, 401);
	}

	const token = authHeader.replace("Bearer ", "");

	// Simplified JWT verification for new architecture
	try {
		const parts = token.split(".");
		if (parts.length !== 3) {
			return c.json({ error: "Invalid token format" }, 401);
		}
		const parsed = JSON.parse(atob(parts[1]));
		if (parsed.exp && parsed.exp < Date.now() / 1000) {
			return c.json({ error: "Token expired" }, 401);
		}
		if (!parsed.userId) {
			return c.json({ error: "Invalid token payload" }, 401);
		}
		c.set("jwtPayload", parsed);
		await next();
	} catch (error) {
		console.error("JWT verification failed:", error);
		return c.json({ error: "Invalid token" }, 401);
	}
};
