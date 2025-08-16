import type { MiddlewareHandler } from "hono";
import type { Bindings } from "../types";

export const basicAuthMiddleware: MiddlewareHandler<{
	Bindings: Bindings;
}> = async (c, next) => {
	if (c.req.method === "OPTIONS") {
		return next();
	}
	const header = c.req.header("Authorization");
	if (!header?.startsWith("Basic ")) {
		c.header("WWW-Authenticate", 'Basic realm="admin"');
		return c.json(
			{ ok: false, code: "UNAUTHORIZED", message: "Unauthorized" },
			401
		);
	}
	const decoded = atob(header.slice(6));
	const [user, pass] = decoded.split(":");
	if (user !== c.env.ADMIN_USER || pass !== c.env.ADMIN_PASS) {
		c.header("WWW-Authenticate", 'Basic realm="admin"');
		return c.json(
			{ ok: false, code: "UNAUTHORIZED", message: "Unauthorized" },
			401
		);
	}
	await next();
};
