import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	completeRegistration,
	register,
	verifyToken,
} from "../services/authService";
import type { Bindings } from "../types";
import {
	CompleteSchema,
	RegisterSchema,
	VerifySchema,
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
	});

export default app;
