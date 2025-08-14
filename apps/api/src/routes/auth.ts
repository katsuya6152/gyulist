import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	completeRegistration,
	login,
	register,
	verifyToken
} from "../services/authService";
import type { Bindings } from "../types";
import {
	CompleteSchema,
	LoginSchema,
	RegisterSchema,
	VerifySchema
} from "../validators/authValidator";

const app = new Hono<{ Bindings: Bindings }>()
	// 仮登録エンドポイント
	.post("/register", zValidator("json", RegisterSchema), async (c) => {
		const input = c.req.valid("json");
		const result = await register(c.env, c.env.DB, input);
		return c.json(result);
	})

	// 認証リンククリック（トークン検証）
	.post("/verify", zValidator("json", VerifySchema), async (c) => {
		const input = c.req.valid("json");
		const result = await verifyToken(c.env, c.env.DB, input.token);
		return c.json(result);
	})

	// 本登録エンドポイント
	.post("/complete", zValidator("json", CompleteSchema), async (c) => {
		const input = c.req.valid("json");
		const result = await completeRegistration(c.env, c.env.DB, input);
		return c.json(result);
	})

	// ログインエンドポイント
	.post("/login", zValidator("json", LoginSchema), async (c) => {
		const input = c.req.valid("json");
		try {
			const result = await login(c.env.DB, c.env.JWT_SECRET, input);
			if (!result.success) {
				return c.json({ error: result.message }, 401);
			}
			return c.json({ token: result.token });
		} catch (e) {
			console.error(e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});

export default app;
