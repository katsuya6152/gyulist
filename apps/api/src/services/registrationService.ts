import type { AnyD1Database } from "drizzle-orm/d1";
import { sendCompletionEmail } from "../lib/resend";
import { verifyTurnstile } from "../lib/turnstile";
import {
	type EmailLogRecord,
	insertEmailLog,
} from "../repositories/emailLogRepository";
import {
	type RegistrationRecord,
	type SearchParams,
	findRegistrationByEmail,
	insertRegistration,
	searchRegistrations,
} from "../repositories/registrationRepository";
import type { Bindings } from "../types";
import type { PreRegisterInput } from "../validators/preRegisterValidator";

export async function preRegister(
	env: Bindings,
	db:
		| AnyD1Database
		| { registrations: RegistrationRecord[]; email_logs: EmailLogRecord[] },
	input: PreRegisterInput,
) {
	const valid = await verifyTurnstile(
		env.TURNSTILE_SECRET_KEY,
		input.turnstileToken,
	);
	if (!valid) {
		console.error("Turnstile validation failed");
		return {
			status: 400,
			body: {
				ok: false,
				code: "TURNSTILE_FAILED",
				message: "Turnstile failed",
			},
		};
	}
	try {
		const existing = await findRegistrationByEmail(db, input.email);
		if (existing) {
			return { status: 200, body: { ok: true, alreadyRegistered: true } };
		}
		const now = Math.floor(Date.now() / 1000);
		const reg: RegistrationRecord = {
			id: crypto.randomUUID(),
			email: input.email,
			referralSource: input.referralSource ?? null,
			status: "confirmed",
			locale: "ja",
			createdAt: now,
			updatedAt: now,
		};
		await insertRegistration(db, reg);
		try {
			const mailFrom = env.MAIL_FROM || "no-reply@gyulist.com";
			const result = await sendCompletionEmail(
				env.RESEND_API_KEY,
				mailFrom,
				input.email,
				input.referralSource ?? null,
			);
			await insertEmailLog(db, {
				id: crypto.randomUUID(),
				email: input.email,
				type: "completed",
				httpStatus: 200,
				resendId: result.id,
				error: null,
				createdAt: now,
			});
		} catch (err) {
			console.error(err);
			await insertEmailLog(db, {
				id: crypto.randomUUID(),
				email: input.email,
				type: "completed",
				httpStatus: undefined,
				resendId: null,
				error: (err as Error).message,
				createdAt: now,
			});
			return {
				status: 502,
				body: { ok: false, code: "RESEND_FAILED", message: "Resend failed" },
			};
		}
		return { status: 200, body: { ok: true } };
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			body: { ok: false, code: "INTERNAL_ERROR", message: "Internal error" },
		};
	}
}

export async function listRegistrations(
	db: AnyD1Database | { registrations: RegistrationRecord[] },
	params: SearchParams,
) {
	return searchRegistrations(db, params);
}
