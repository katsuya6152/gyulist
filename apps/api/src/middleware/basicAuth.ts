import type { MiddlewareHandler } from "hono";
import type { Bindings } from "../types";

export const basicAuth = (): MiddlewareHandler<{ Bindings: Bindings }> => {
	return async (c, next) => {
		const auth = c.req.header("authorization") || "";
		const { ADMIN_USER, ADMIN_PASS } = c.env;
		const expected = `Basic ${btoa(`${ADMIN_USER}:${ADMIN_PASS}`)}`;
		if (auth !== expected) {
			c.header("WWW-Authenticate", 'Basic realm="Restricted"');
			return c.json(
				{ ok: false, code: "UNAUTHORIZED", message: "Unauthorized" },
				401,
			);
		}
		await next();
	};
};
