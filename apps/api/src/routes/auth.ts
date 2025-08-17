import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	CompleteSchema,
	LoginSchema,
	RegisterSchema,
	VerifySchema
} from "../contexts/auth/domain/codecs/input";
import {
	completeResponseSchema,
	loginResponseSchema,
	registerResponseSchema,
	verifyResponseSchema
} from "../contexts/auth/domain/codecs/output";
import { complete as completeUseCase } from "../contexts/auth/domain/services/complete";
import { login as loginUseCase } from "../contexts/auth/domain/services/login";
import { register as registerUseCase } from "../contexts/auth/domain/services/register";
import { verify as verifyUseCase } from "../contexts/auth/domain/services/verify";
import { makeAuthDeps } from "../shared/config/di";
import { executeUseCase } from "../shared/http/route-helpers";
import { getLogger } from "../shared/logging/logger";
import {
	getAuthenticatedUser,
	getRequestInfo
} from "../shared/utils/request-helpers";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>()
	// 仮登録エンドポイント
	.post("/register", zValidator("json", RegisterSchema), async (c) => {
		const input = c.req.valid("json");
		const requestInfo = getRequestInfo(c);
		const logger = getLogger(c);

		logger.apiRequest(
			requestInfo.method,
			requestInfo.endpoint,
			undefined,
			requestInfo.requestId
		);

		const deps = makeAuthDeps(c.env.DB, c.env.JWT_SECRET);

		return executeUseCase(c, async () => {
			const result = await registerUseCase(deps)(input);
			// 既存契約: 常に success true / メッセージ固定
			const body = {
				success: true,
				message: result.ok
					? result.value.message
					: "仮登録が完了しました。メールを確認してください。"
			};
			return { ok: true, value: registerResponseSchema.parse(body) } as const;
		});
	})

	// 認証リンククリック（トークン検証）
	.post("/verify", zValidator("json", VerifySchema), async (c) => {
		const input = c.req.valid("json");
		const deps = makeAuthDeps(c.env.DB, c.env.JWT_SECRET);

		return executeUseCase(c, async () => {
			const result = await verifyUseCase(deps)({ token: input.token });
			if (!result.ok) return result;
			return {
				ok: true,
				value: verifyResponseSchema.parse(result.value)
			} as const;
		});
	})

	// 本登録エンドポイント
	.post("/complete", zValidator("json", CompleteSchema), async (c) => {
		const input = c.req.valid("json");
		const deps = makeAuthDeps(c.env.DB, c.env.JWT_SECRET);

		return executeUseCase(c, async () => {
			const result = await completeUseCase(deps)(input);
			if (!result.ok) return result;
			return {
				ok: true,
				value: completeResponseSchema.parse(result.value)
			} as const;
		});
	})

	// ログインエンドポイント
	.post("/login", zValidator("json", LoginSchema), async (c) => {
		const input = c.req.valid("json");
		const deps = makeAuthDeps(c.env.DB, c.env.JWT_SECRET);

		return executeUseCase(c, async () => {
			const result = await loginUseCase(deps)(input);
			if (!result.ok) {
				if (result.error.type === "Unauthorized") {
					return {
						ok: false,
						error: { ...result.error, httpStatus: 401 }
					} as const;
				}
				return result;
			}
			return {
				ok: true,
				value: loginResponseSchema.parse({ token: result.value.token })
			} as const;
		});
	});

export default app;
