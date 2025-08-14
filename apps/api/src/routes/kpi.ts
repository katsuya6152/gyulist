import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { jwtMiddleware } from "../middleware/jwt";
import { getBreedingKpiDelta } from "../services/kpiDeltaService";
import { getBreedingKpi } from "../services/kpiService";
import { getBreedingKpiTrends } from "../services/kpiTrendsService";
import type { Bindings } from "../types";
import { getBreedingKpi as getBreedingKpiUC } from "../contexts/kpi/domain/services/breeding";
import { getBreedingKpiDelta as getBreedingKpiDeltaUC } from "../contexts/kpi/domain/services/delta";
import { getBreedingKpiTrends as getBreedingKpiTrendsUC } from "../contexts/kpi/domain/services/trends";
import { findEventsForBreedingKpi } from "../repositories/kpiRepository";
import { breedingKpiDeltaSchema, breedingKpiSchema, breedingKpiTrendsSchema } from "../contexts/kpi/domain/codecs/output";

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
			const repo = { findEventsForBreedingKpi: (ownerUserId: number, f?: string, t?: string) => findEventsForBreedingKpi(c.env.DB, ownerUserId, f, t) };
			const result = await getBreedingKpiUC(repo)(userId, from, to);
			if (!result.ok) {
				console.error(result.error);
				return c.json({ message: "Internal Server Error" }, 500);
			}
			return c.json(breedingKpiSchema.parse(result.value));
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})
	.get("/breeding/delta", async (c) => {
		const userId = c.get("jwtPayload").userId;
		const month = c.req.query("month");
		try {
			const repo = { trends: (ownerUserId: number, params: { toMonth?: string; months?: number }) => getBreedingKpiTrends(c.env.DB, ownerUserId, { toMonth: params.toMonth, months: params.months ?? 2 }) };
			const result = await getBreedingKpiDeltaUC(repo)(userId, { month: month ?? undefined });
			if (!result.ok) {
				console.error(result.error);
				return c.json({ message: "Internal Server Error" }, 500);
			}
			return c.json(breedingKpiDeltaSchema.parse(result.value));
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
			const svc = (ownerUserId: number, params: { fromMonth?: string; toMonth?: string; months?: number }) =>
				getBreedingKpiTrends(c.env.DB, ownerUserId, params);
			const result = await getBreedingKpiTrendsUC(svc)(userId, {
				fromMonth: fromMonth ?? undefined,
				toMonth: toMonth ?? undefined,
				months: months ? Number(months) : undefined
			});
			if (!result.ok) {
				console.error(result.error);
				return c.json({ message: "Internal Server Error" }, 500);
			}
			return c.json(breedingKpiTrendsSchema.parse(result.value));
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	});

export default app;
