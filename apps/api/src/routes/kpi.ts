import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt";
import { getBreedingKpiDelta } from "../services/kpiDeltaService";
import { getBreedingKpi } from "../services/kpiService";
import { getBreedingKpiTrends } from "../services/kpiTrendsService";
import type { Bindings } from "../types";

const querySchema = z.object({
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional()
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
	})
	.get("/breeding/delta", async (c) => {
		const userId = c.get("jwtPayload").userId;
		const month = c.req.query("month");
		try {
			const result = await getBreedingKpiDelta(c.env.DB, userId, {
				month: month ?? undefined
			});
			return c.json(result);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})
	.get("/breeding/trends", async (c) => {
		const userId = c.get("jwtPayload").userId;
		const fromMonth = c.req.query("from");
		const toMonth = c.req.query("to");
		const months = c.req.query("months");
		try {
			const result = await getBreedingKpiTrends(c.env.DB, userId, {
				fromMonth: fromMonth ?? undefined,
				toMonth: toMonth ?? undefined,
				months: months ? Number(months) : undefined
			});
			return c.json(result);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	});

export default app;
