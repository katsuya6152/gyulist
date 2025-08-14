import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt";
import { getBreedingKpi } from "../services/kpiService";
import type { Bindings } from "../types";

const querySchema = z.object({
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional(),
});

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/breeding", zValidator("query", querySchema), async (c) => {
		const userId = c.get("jwtPayload").userId;
		const { from, to } = c.req.valid("query");
		try {
			const result = await getBreedingKpi(c.env.DB, userId, from, to);
			return c.json(result);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	});

export default app;
