import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { getCattleList } from "../services/cattleService";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/", async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const cattle = await getCattleList(c.env.DB, userId);
			return c.json(cattle);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	});

export default app;
