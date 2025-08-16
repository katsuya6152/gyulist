import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
	breedingKpiDeltaSchema,
	breedingKpiSchema,
	breedingKpiTrendsSchema
} from "../contexts/kpi/domain/codecs/output";
import { getBreedingKpi as getBreedingKpiUC } from "../contexts/kpi/domain/services/breeding";
import { getBreedingKpiDelta as getBreedingKpiDeltaUC } from "../contexts/kpi/domain/services/delta";
import { getBreedingKpiTrends as getBreedingKpiTrendsUC } from "../contexts/kpi/domain/services/trends";
import { makeKpiRepo } from "../contexts/kpi/infra/drizzle/repo";
import { jwtMiddleware } from "../middleware/jwt";
import { executeUseCase } from "../shared/http/route-helpers";
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

		return executeUseCase(
			c,
			async () => {
				const repo = makeKpiRepo(c.env.DB);
				const result = await getBreedingKpiUC(repo)(userId, from, to);
				if (!result.ok) return result;
				return {
					ok: true,
					value: breedingKpiSchema.parse(result.value)
				} as const;
			},
			{ envelope: "data" }
		);
	})
	.get("/breeding/delta", async (c) => {
		const userId = c.get("jwtPayload").userId;
		const month = c.req.query("month");

		return executeUseCase(
			c,
			async () => {
				const repo = makeKpiRepo(c.env.DB);
				const result = await getBreedingKpiDeltaUC(repo)(userId, {
					month: month ?? undefined
				});
				if (!result.ok) return result;
				return {
					ok: true,
					value: breedingKpiDeltaSchema.parse(result.value)
				} as const;
			},
			{ envelope: "data" }
		);
	})
	.get("/breeding/trends", async (c) => {
		const userId = c.get("jwtPayload").userId;
		const fromMonth = c.req.query("from");
		const toMonth = c.req.query("to");
		const months = c.req.query("months");

		return executeUseCase(
			c,
			async () => {
				const repo = makeKpiRepo(c.env.DB);
				const result = await getBreedingKpiTrendsUC(repo)(userId, {
					fromMonth: fromMonth ?? undefined,
					toMonth: toMonth ?? undefined,
					months: months ? Number(months) : undefined
				});
				if (!result.ok) return result;
				return {
					ok: true,
					value: breedingKpiTrendsSchema.parse(result.value)
				} as const;
			},
			{ envelope: "data" }
		);
	});

export default app;
