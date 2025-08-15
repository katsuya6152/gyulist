import { Hono } from "hono";
import { alertsResponseSchema } from "../contexts/alerts/domain/codecs/output";
import { getAlerts as getAlertsUC } from "../contexts/alerts/domain/services/get";
import { makeAlertsRepo } from "../contexts/alerts/infra/drizzle/repo";
import { jwtMiddleware } from "../middleware/jwt";
import { executeUseCase } from "../shared/http/route-helpers";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/", async (c) => {
		const userId = c.get("jwtPayload").userId;

		return executeUseCase(c, async () => {
			const repo = makeAlertsRepo(c.env.DB);
			const result = await getAlertsUC(repo)(userId, () => new Date());
			if (!result.ok) return result;
			return {
				ok: true,
				value: alertsResponseSchema.parse(result.value)
			} as const;
		});
	});

export default app;
