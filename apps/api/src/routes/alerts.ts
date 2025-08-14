import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import type { Bindings } from "../types";
import { getAlerts as getAlertsUC } from "../contexts/alerts/domain/services/get";
import { findCalvingOverdue, findCalvingWithin60, findEstrusOver20NotPregnant, findOpenDaysOver60NoAI } from "../repositories/alertRepository";
import { alertsResponseSchema } from "../contexts/alerts/domain/codecs/output";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/", async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const repo = {
				findOpenDaysOver60NoAI: (ownerUserId: number, nowIso: string) => findOpenDaysOver60NoAI(c.env.DB, ownerUserId, nowIso),
				findCalvingWithin60: (ownerUserId: number, nowIso: string) => findCalvingWithin60(c.env.DB, ownerUserId, nowIso),
				findCalvingOverdue: (ownerUserId: number, nowIso: string) => findCalvingOverdue(c.env.DB, ownerUserId, nowIso),
				findEstrusOver20NotPregnant: (ownerUserId: number, nowIso: string) => findEstrusOver20NotPregnant(c.env.DB, ownerUserId, nowIso)
			};
			const result = await getAlertsUC(repo)(userId, () => new Date());
			if (!result.ok) {
				console.error(result.error);
				return c.json({ message: "Internal Server Error" }, 500);
			}
			return c.json(alertsResponseSchema.parse(result.value));
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	});

export default app;
