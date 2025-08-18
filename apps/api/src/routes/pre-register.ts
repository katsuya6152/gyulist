import { Hono } from "hono";
import { createCryptoIdPort } from "../contexts/auth/infra/id";
import { preRegisterSchema } from "../contexts/registration/domain/codecs/input";
import { preRegisterSuccessSchema } from "../contexts/registration/domain/codecs/output";
import {
	toEmail,
	toReferralSource
} from "../contexts/registration/domain/model/converters";
import { preRegister as preRegisterUC } from "../contexts/registration/domain/services/preRegister";
import { makeRegistrationRepo } from "../contexts/registration/infra/drizzle/repo";
import { sendCompletionEmail } from "../lib/resend";
import { verifyTurnstile } from "../lib/turnstile";
import {
	executeUseCase,
	handleValidationError
} from "../shared/http/route-helpers";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const parsed = preRegisterSchema.safeParse(body);
	if (!parsed.success) {
		return handleValidationError(c, parsed.error);
	}

	return executeUseCase(
		c,
		async () => {
			const deps = {
				repo: makeRegistrationRepo(c.env.DB),
				id: createCryptoIdPort(),
				time: { nowSeconds: () => Math.floor(Date.now() / 1000) },
				turnstile: { verify: verifyTurnstile },
				mail: { sendCompleted: sendCompletionEmail },
				secrets: {
					TURNSTILE_SECRET_KEY: c.env.TURNSTILE_SECRET_KEY,
					RESEND_API_KEY: c.env.RESEND_API_KEY,
					MAIL_FROM: c.env.MAIL_FROM || "no-reply@gyulist.com"
				}
			};

			const cmd = {
				email: toEmail(parsed.data.email),
				referralSource: toReferralSource(parsed.data.referralSource),
				turnstileToken: parsed.data.turnstileToken
			};
			const result = await preRegisterUC(deps)(cmd);
			if (!result.ok) return result;

			return {
				ok: true,
				value: preRegisterSuccessSchema.parse(result.value.body)
			} as const;
		},
		{ envelope: "data" }
	);
});

export default app;
