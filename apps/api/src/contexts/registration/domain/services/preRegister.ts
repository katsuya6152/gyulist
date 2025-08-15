import type { IdPort } from "../../../../shared/ports/id";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../auth/domain/errors";
import type { RegistrationRepoPort } from "../../ports";

export type PreRegisterCmd = {
	email: string;
	referralSource?: string | null;
	turnstileToken: string;
};

export type PreRegisterDeps = {
	turnstile: { verify(secret: string, token: string): Promise<boolean> };
	id: IdPort;
	time: { nowSeconds(): number };
	repo: RegistrationRepoPort;
	mail: {
		sendCompleted(
			apiKey: string,
			from: string,
			to: string,
			referral: string | null
		): Promise<{ id: string }>;
	};
	secrets: {
		TURNSTILE_SECRET_KEY: string;
		RESEND_API_KEY: string;
		MAIL_FROM: string;
	};
};

export type PreRegisterResult = {
	status: number;
	body: Record<string, unknown>;
};

export const preRegister =
	(deps: PreRegisterDeps) =>
	async (
		cmd: PreRegisterCmd
	): Promise<Result<PreRegisterResult, DomainError>> => {
		const valid = await deps.turnstile.verify(
			deps.secrets.TURNSTILE_SECRET_KEY,
			cmd.turnstileToken
		);
		if (!valid) {
			return ok({
				status: 400,
				body: {
					ok: false,
					code: "TURNSTILE_FAILED",
					message: "Turnstile failed"
				}
			});
		}
		try {
			const existing = await deps.repo.findByEmail(cmd.email);
			if (existing) {
				return ok({ status: 200, body: { ok: true, alreadyRegistered: true } });
			}
			const now = deps.time.nowSeconds();
			const id = deps.id.uuid();
			await deps.repo.insert({
				id,
				email: cmd.email,
				referralSource: cmd.referralSource ?? null,
				status: "confirmed",
				locale: "ja",
				createdAt: now,
				updatedAt: now
			});
			try {
				const mailResult = await deps.mail.sendCompleted(
					deps.secrets.RESEND_API_KEY,
					deps.secrets.MAIL_FROM,
					cmd.email,
					cmd.referralSource ?? null
				);
				await deps.repo.insertEmailLog({
					id: deps.id.uuid(),
					email: cmd.email,
					type: "completed",
					httpStatus: 200,
					resendId: mailResult.id,
					error: null,
					createdAt: now
				});
			} catch (cause) {
				await deps.repo.insertEmailLog({
					id: deps.id.uuid(),
					email: cmd.email,
					type: "completed",
					resendId: null,
					error: (cause as Error).message,
					createdAt: now
				});
				return ok({
					status: 502,
					body: { ok: false, code: "RESEND_FAILED", message: "Resend failed" }
				});
			}
			return ok({ status: 200, body: { ok: true } });
		} catch (cause) {
			return err({ type: "InfraError", message: "pre-register failed", cause });
		}
	};
