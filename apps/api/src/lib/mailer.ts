import type { Env } from "../types";
import { generateVerificationEmailHtml } from "./templates/verificationEmail";

const isDev = (env: Env) => env.ENVIRONMENT !== "production";

export async function sendVerificationEmail(
	env: Env,
	email: string,
	token: string
) {
	const verificationLink = `${env.WEB_ORIGIN}/verify?token=${token}`;

	// 開発環境でもRESEND_API_KEYが設定されている場合はメール送信を試行
	if (isDev(env) && !env.RESEND_API_KEY) {
		console.log(
			`【開発モード】メール送信: ${email} - リンク: ${verificationLink}`
		);
		return;
	}

	// Resend APIを使用してメール送信
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				from: env.MAIL_FROM || "noreply@gyulist.com",
				to: email,
				subject: "ギュウリスト会員登録の確認",
				html: generateVerificationEmailHtml(verificationLink)
			})
		});

		if (!res.ok) {
			throw new Error(`Resend API error: ${res.status}`);
		}

		const result = await res.json();
		console.log(`メール送信成功: ${email}, Resend ID: ${result.id}`);
		return result;
	} catch (error) {
		console.error(`メール送信失敗: ${email}`, error);
		throw error;
	}
}
