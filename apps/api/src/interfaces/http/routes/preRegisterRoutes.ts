/**
 * Pre-Register HTTP Routes
 *
 * 事前登録のHTTPルート定義
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { makeDependencies } from "../../../infrastructure/config/dependencies";
import type { Bindings } from "../../../types";
import { makePreRegisterController } from "../controllers/PreRegisterController";

// Validation schemas
const preRegisterSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください").max(254),
	referralSource: z.string().max(100).optional(),
	turnstileToken: z.string().min(10, "Turnstileトークンは必須です")
});

/**
 * 事前登録APIルートを作成
 *
 * @returns Honoアプリケーション
 */
export function createPreRegisterRoutes() {
	const app = new Hono<{ Bindings: Bindings }>()

		// 事前登録処理
		.post("/", zValidator("json", preRegisterSchema), async (c) => {
			const db = c.env.DB;
			const deps = makeDependencies(db, { now: () => new Date() });
			const controller = makePreRegisterController(deps);
			return controller.preRegister(c);
		});

	return app;
}
