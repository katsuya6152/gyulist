import { compare } from "bcryptjs";
import { sign } from "hono/jwt";

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return compare(password, hash);
}

export async function signToken(
	payload: Record<string, unknown>,
	secret: string,
): Promise<string> {
	// トークンの有効期限を12時間に設定
	const expiresIn = 12 * 60 * 60;

	return await sign(
		{
			...payload,
			exp: Math.floor(Date.now() / 1000) + expiresIn,
		},
		secret,
	);
}

/**
 * OAuthユーザー用のダミーパスワードハッシュを生成
 * 実際のパスワードではないことを明確にするためのプレフィックス付き
 */
export function generateOAuthDummyPasswordHash(): string {
	const randomBytes = crypto.getRandomValues(new Uint8Array(32));
	const randomString = Array.from(randomBytes, (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
	return `oauth_dummy_${randomString}`;
}
