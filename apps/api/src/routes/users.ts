import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { updateThemeResponseSchema } from "../contexts/auth/domain/codecs/output";
import {
	UpdateThemeSchema,
	UserIdParamSchema
} from "../contexts/auth/domain/codecs/user";
import { updateTheme as updateThemeUseCase } from "../contexts/auth/domain/services/updateTheme";
import type { UserId } from "../contexts/auth/ports";
import { jwtMiddleware } from "../middleware/jwt";
import { makeAuthDeps } from "../shared/config/di";
import { executeUseCase } from "../shared/http/route-helpers";
import { getLogger } from "../shared/logging/logger";
import { extractUserId, parseIdParam } from "../shared/types/safe-cast";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/:id", zValidator("param", UserIdParamSchema), async (c) => {
		const { id } = c.req.valid("param");
		const requestingUserId = extractUserId(c.get("jwtPayload"));
		const targetUserId = parseIdParam(id, "User") as UserId;

		const logger = getLogger(c);
		logger.info("User profile request", {
			requestingUserId,
			targetUserId,
			endpoint: `/users/${id}`
		});

		return executeUseCase(c, async () => {
			const deps = makeAuthDeps(c.env.DB, c.env.JWT_SECRET);
			const user = await deps.repo.findUserById(targetUserId);
			if (!user) {
				return {
					ok: false,
					error: { type: "NotFound", message: "User not found" }
				} as const;
			}
			return { ok: true, value: user } as const;
		});
	})
	.patch(
		"/:id/theme",
		zValidator("param", UserIdParamSchema),
		zValidator("json", UpdateThemeSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const { theme } = c.req.valid("json");
			const requestingUserId = extractUserId(c.get("jwtPayload"));
			const targetUserId = parseIdParam(id, "User") as UserId;

			// 自分のテーマのみ更新可能
			const logger = getLogger(c);
			if (targetUserId !== requestingUserId) {
				logger.warn("Unauthorized theme update attempt", {
					requestingUserId,
					targetUserId,
					endpoint: `/users/${id}/theme`
				});
				return c.json({ error: "Unauthorized" }, 403);
			}

			logger.info("Theme update request", {
				userId: requestingUserId,
				theme,
				endpoint: `/users/${id}/theme`
			});

			return executeUseCase(c, async () => {
				const deps = makeAuthDeps(c.env.DB, c.env.JWT_SECRET);
				const result = await updateThemeUseCase({ repo: deps.repo })({
					requestingUserId,
					targetUserId,
					theme,
					nowIso: new Date().toISOString()
				});
				if (!result.ok) {
					if (result.error.type === "Forbidden") {
						return {
							ok: false,
							error: { ...result.error, httpStatus: 403 }
						} as const;
					}
					return result;
				}
				return {
					ok: true,
					value: updateThemeResponseSchema.parse(result.value)
				} as const;
			});
		}
	);

export default app;
