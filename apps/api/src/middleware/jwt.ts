import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import type { Bindings } from "../types";

export const jwtMiddleware: MiddlewareHandler<{ Bindings: Bindings }> = async (
	c,
	next,
) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) {
		return c.json({ error: "No token provided" }, 401);
	}

	const token = authHeader.replace("Bearer ", "");

	try {
		// 通常のJWT検証を試す
		const decodedPayload = await verify(token, c.env.JWT_SECRET);
		c.set("jwtPayload", decodedPayload);
		await next();
	} catch (e) {
		// 通常のJWT検証が失敗した場合、OAuth用の簡易JWT形式を試す
		try {
			// JWT形式かチェック（3つの部分がドットで区切られているか）
			const parts = token.split(".");
			if (parts.length !== 3) {
				return c.json({ error: "Invalid token format" }, 401);
			}

			// ペイロード部分をデコード
			const payload = JSON.parse(atob(parts[1]));

			// 有効期限をチェック
			if (payload.exp && payload.exp < Date.now() / 1000) {
				return c.json({ error: "Token expired" }, 401);
			}

			// userIdが存在するかチェック
			if (!payload.userId) {
				return c.json({ error: "Invalid token payload" }, 401);
			}

			c.set("jwtPayload", payload);
			await next();
		} catch (oauthError) {
			console.error("JWT verification failed:", e);
			console.error("OAuth JWT verification failed:", oauthError);
			return c.json({ error: "Invalid token" }, 401);
		}
	}
};
