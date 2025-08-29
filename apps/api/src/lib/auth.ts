import { compare } from "bcryptjs";
import { sign } from "hono/jwt";

export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	return compare(password, hash);
}

export async function signToken(
	payload: Record<string, unknown>,
	secret: string
): Promise<string> {
	// トークンの有効期限を12時間に設定
	const expiresIn = 12 * 60 * 60;

	return await sign(
		{
			...payload,
			exp: Math.floor(Date.now() / 1000) + expiresIn
		},
		secret
	);
}

/**
 * OAuthユーザー用のダミーパスワードハッシュを生成
 * 実際のパスワードではないことを明確にするためのプレフィックス付き
 */
export function generateOAuthDummyPasswordHash(): string {
	// Cloudflare Workers環境での互換性のため、複数の方法を試行
	let randomBytes: Uint8Array;

	try {
		// まずcrypto.getRandomValuesを試行
		if (typeof crypto !== "undefined" && crypto.getRandomValues) {
			randomBytes = crypto.getRandomValues(new Uint8Array(32));
		} else {
			// フォールバック: Math.random()を使用（本番環境では推奨されないが、OAuthダミーハッシュ用）
			randomBytes = new Uint8Array(32);
			for (let i = 0; i < 32; i++) {
				randomBytes[i] = Math.floor(Math.random() * 256);
			}
		}
	} catch (error) {
		// エラーが発生した場合のフォールバック
		randomBytes = new Uint8Array(32);
		for (let i = 0; i < 32; i++) {
			randomBytes[i] = Math.floor(Math.random() * 256);
		}
	}

	const randomString = Array.from(randomBytes, (byte) =>
		byte.toString(16).padStart(2, "0")
	).join("");
	return `oauth_dummy_${randomString}`;
}
