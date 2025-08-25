/**
 * Basic Authentication Middleware
 *
 * 管理者向けのBasic認証を提供するミドルウェア
 */

import type { Context, Next } from "hono";

/**
 * Basic認証ミドルウェア
 *
 * 環境変数から管理者のユーザー名とパスワードを取得し、
 * Basic認証ヘッダーを検証します。
 */
export async function basicAuthMiddleware(c: Context, next: Next) {
	try {
		// OPTIONSリクエストは認証をスキップ
		if (c.req.method === "OPTIONS") {
			await next();
			return;
		}

		const authHeader = c.req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Basic ")) {
			return c.json({ error: "Basic authentication required" }, 401, {
				"WWW-Authenticate": 'Basic realm="Admin Area"'
			});
		}

		const encodedCredentials = authHeader.substring(6);
		const decodedCredentials = atob(encodedCredentials);
		const [username, password] = decodedCredentials.split(":");

		// 環境変数から管理者認証情報を取得
		const adminUsername = c.env.ADMIN_USER || "admin";
		const adminPassword = c.env.ADMIN_PASS || "admin";

		if (username !== adminUsername || password !== adminPassword) {
			return c.json({ error: "Invalid credentials" }, 401, {
				"WWW-Authenticate": 'Basic realm="Admin Area"'
			});
		}

		// 認証成功
		await next();
	} catch (error) {
		console.error("Basic auth error:", error);
		return c.json({ error: "Authentication failed" }, 500);
	}
}
