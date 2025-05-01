import type { Bindings } from "../types";

const isDev = (env: Bindings) => env.ENVIRONMENT !== "production";

export async function sendVerificationEmail(
	env: Bindings,
	email: string,
	token: string,
) {
	const verificationLink = `${env.APP_URL}/verify?token=${token}`;

	if (isDev(env)) {
		console.log(
			`【開発モード】メール送信: ${email} - リンク: ${verificationLink}`,
		);
		return;
	}
	// TODO: SendGrid実装予定
}
