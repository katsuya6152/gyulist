import type { MiddlewareHandler } from "hono";
import { createHonoJwtTokenPort } from "../contexts/auth/infra/token";
import type { Bindings } from "../types";

export const jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (
	c,
	next
) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) {
		return c.json({ error: "No token provided" }, 401);
	}

	const token = authHeader.replace("Bearer ", "");

	const tokenPort = createHonoJwtTokenPort(c.env.JWT_SECRET);
	const payload = await tokenPort.verify(token);
	if (!payload) {
		// Preserve previous logging behavior for JWT failure + OAuth fallback
		console.error("JWT verification failed");
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
			return;
		} catch (oauthError) {
			console.error("OAuth JWT verification failed:", oauthError);
			return c.json({ error: "Invalid token" }, 401);
		}
	}
	if (payload.exp && payload.exp < Date.now() / 1000) {
		return c.json({ error: "Token expired" }, 401);
	}
	if (!payload.userId) {
		return c.json({ error: "Invalid token payload" }, 401);
	}
	c.set("jwtPayload", payload);
	await next();
};
