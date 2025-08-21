import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { alertsResponseSchema } from "../contexts/alerts/domain/codecs/output";
import { toTimestamp } from "../contexts/alerts/domain/model";
import type { AlertId, UserId } from "../contexts/alerts/domain/model/types";
import {
	updateAlertMemo as updateAlertMemoUC,
	updateAlertStatus as updateAlertStatusUC
} from "../contexts/alerts/domain/services/alertUpdater";
import { getAlerts as getAlertsUC } from "../contexts/alerts/domain/services/get";
import { makeAlertsRepo } from "../contexts/alerts/infra/drizzle/repo";
import { createCryptoIdPort } from "../contexts/auth/infra/id";
import { jwtMiddleware } from "../middleware/jwt";
import { executeUseCase } from "../shared/http/route-helpers";
import type { Bindings } from "../types";

const updateMemoSchema = z.object({
	memo: z.string().max(1000).optional()
});

const updateStatusSchema = z.object({
	status: z.enum(["acknowledged", "resolved", "dismissed"])
});

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
	})
	.put("/:id/memo", zValidator("json", updateMemoSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;
		const alertId = c.req.param("id");
		const { memo } = c.req.valid("json");

		return executeUseCase(c, async () => {
			const deps = {
				repo: makeAlertsRepo(c.env.DB),
				time: { nowSeconds: () => Math.floor(Date.now() / 1000) },
				idGenerator: {
					generate: () =>
						`memo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
				}
			};
			const result = await updateAlertMemoUC(deps)({
				alertId: alertId as AlertId,
				memo: memo || "",
				userId: userId as UserId
			});
			if (!result.ok) return result;
			return {
				ok: true,
				value: { message: "メモが更新されました" }
			} as const;
		});
	})
	.put("/:id/status", zValidator("json", updateStatusSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;
		const alertId = c.req.param("id");
		const { status } = c.req.valid("json");

		return executeUseCase(c, async () => {
			const deps = {
				repo: makeAlertsRepo(c.env.DB),
				time: { nowSeconds: () => Math.floor(Date.now() / 2) },
				idGenerator: {
					generate: () =>
						`status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
				}
			};
			const result = await updateAlertStatusUC(deps)({
				alertId: alertId as AlertId,
				newStatus: status,
				reason: "ユーザーによる手動更新",
				changedBy: userId as UserId,
				currentTime: toTimestamp(Math.floor(Date.now() / 1000))
			});
			if (!result.ok) return result;
			return {
				ok: true,
				value: { message: "ステータスが更新されました" }
			} as const;
		});
	});

export default app;
