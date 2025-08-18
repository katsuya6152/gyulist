import { Hono } from "hono";
import { alertsResponseSchema } from "../contexts/alerts/domain/codecs/output";
import { getAlerts as getAlertsUC } from "../contexts/alerts/domain/services/get";
import { makeAlertsRepo } from "../contexts/alerts/infra/drizzle/repo";
import { createCryptoIdPort } from "../contexts/auth/infra/id";
import { jwtMiddleware } from "../middleware/jwt";
import { executeUseCase } from "../shared/http/route-helpers";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/", async (c) => {
		const userId = c.get("jwtPayload").userId;

		return executeUseCase(
			c,
			async () => {
				const deps = {
					repo: makeAlertsRepo(c.env.DB),
					id: createCryptoIdPort(),
					time: { nowSeconds: () => Math.floor(Date.now() / 1000) }
				};
				const result = await getAlertsUC(deps)({
					ownerUserId: userId as number,
					now: () => new Date()
				});
				if (!result.ok) return result;
				return {
					ok: true,
					value: alertsResponseSchema.parse(result.value)
				} as const;
			},
			{ envelope: "data" }
		);
	});

export default app;
