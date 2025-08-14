import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { getAlerts } from "../services/alertService";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/", async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const result = await getAlerts(c.env.DB, userId);
			return c.json(result);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	});

export default app;
