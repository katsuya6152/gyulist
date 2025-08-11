import {
	findRegistrationByEmail,
	insertEmailLog,
	insertRegistration,
} from "../repositories/registrationRepository";
import type { Bindings } from "../types";
import type { PreRegisterInput } from "../validators/registrationValidator";

async function verifyTurnstile(env: Bindings, token: string) {
	const body = new URLSearchParams({
		secret: env.TURNSTILE_SECRET_KEY,
		response: token,
	});
	const res = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{
			method: "POST",
			body,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		},
	);
	const data = await res.json<{ success: boolean; "error-codes"?: string[] }>();
	return data.success === true;
}

async function sendCompletedEmail(
	env: Bindings,
	email: string,
	referralSource: string | null,
) {
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: env.MAIL_FROM,
			to: email,
			subject: "事前登録ありがとうございます",
			html: `<p>Gyulistへの事前登録が完了しました。</p><p>登録メール: ${email}</p><p>どこで知ったか: ${referralSource ?? ""}</p>`,
		}),
	});
	let resendId: string | undefined;
	let error: string | undefined;
	if (res.ok) {
		const json = await res.json<{ id: string }>();
		resendId = json.id;
	} else {
		error = await res.text();
		console.error("Resend failed", error);
	}
	await insertEmailLog(env.DB, {
		id: crypto.randomUUID(),
		email,
		type: "completed",
		http_status: res.status,
		resend_id: resendId,
		error,
		created_at: Math.floor(Date.now() / 1000),
	});
	if (!res.ok) {
		throw new Error("RESEND_FAILED");
	}
}

export async function preRegister(env: Bindings, data: PreRegisterInput) {
	const ok = await verifyTurnstile(env, data.turnstileToken);
	if (!ok) {
		console.error("Turnstile verification failed", data.email);
		return { error: "TURNSTILE_FAILED" } as const;
	}
	const existing = await findRegistrationByEmail(env.DB, data.email);
	if (existing) {
		return { alreadyRegistered: true } as const;
	}
	const now = Math.floor(Date.now() / 1000);
	try {
		await insertRegistration(env.DB, {
			id: crypto.randomUUID(),
			email: data.email,
			referral_source: data.referralSource || null,
			status: "confirmed",
			locale: "ja",
			created_at: now,
			updated_at: now,
		});
	} catch (e) {
		console.error("DB insert failed", e);
		return { error: "DB_FAILED" } as const;
	}
	try {
		await sendCompletedEmail(env, data.email, data.referralSource || null);
	} catch (e) {
		return { error: "RESEND_FAILED" } as const;
	}
	return { alreadyRegistered: false } as const;
}
