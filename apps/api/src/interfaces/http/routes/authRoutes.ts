/**
 * Auth Routes
 *
 * 認証・ユーザー管理のHTTPルート定義（新アーキテクチャ）
 */

import { zValidator } from "@hono/zod-validator";
import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";

import { makeDependencies } from "../../../infrastructure/config/dependencies";
import { jwtMiddleware } from "../../../middleware/jwt";
import type { Bindings } from "../../../types";
import { AuthController } from "../controllers/AuthController";

// ============================================================================
// Validation Schemas
// ============================================================================

const loginSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください"),
	password: z.string().min(8, "パスワードは8文字以上で入力してください")
});

const registerSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください")
});

const verifySchema = z.object({
	token: z.string().min(1, "トークンは必須です")
});

const completeSchema = z.object({
	token: z.string().min(1, "トークンは必須です"),
	name: z
		.string()
		.min(1, "ユーザー名は必須です")
		.max(100, "ユーザー名は100文字以下で入力してください"),
	password: z
		.string()
		.min(8, "パスワードは8文字以上で入力してください")
		.max(128, "パスワードは128文字以下で入力してください")
});

const updateThemeSchema = z.object({
	theme: z.enum(["light", "dark", "auto"], {
		errorMap: () => ({
			message: "テーマは light, dark, auto のいずれかを選択してください"
		})
	})
});

// ============================================================================
// Route Factory
// ============================================================================

/**
 * 認証ルートを作成
 *
 * @returns Honoアプリケーション
 */
export function createAuthRoutes() {
	return (
		new Hono<{ Bindings: Bindings }>()
			// ログイン
			.post("/login", zValidator("json", loginSchema), async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const authController = new AuthController({
					loginUserUseCase: deps.useCases.loginUserUseCase,
					registerUserUseCase: deps.useCases.registerUserUseCase,
					verifyTokenUseCase: deps.useCases.verifyTokenUseCase,
					completeRegistrationUseCase:
						deps.useCases.completeRegistrationUseCase,
					updateUserThemeUseCase: deps.useCases.updateUserThemeUseCase
				});
				return authController.login(c);
			})

			// 仮登録
			.post("/register", zValidator("json", registerSchema), async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const authController = new AuthController({
					loginUserUseCase: deps.useCases.loginUserUseCase,
					registerUserUseCase: deps.useCases.registerUserUseCase,
					verifyTokenUseCase: deps.useCases.verifyTokenUseCase,
					completeRegistrationUseCase:
						deps.useCases.completeRegistrationUseCase,
					updateUserThemeUseCase: deps.useCases.updateUserThemeUseCase
				});
				return authController.register(c);
			})

			// トークン検証
			.post("/verify", zValidator("json", verifySchema), async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const authController = new AuthController({
					loginUserUseCase: deps.useCases.loginUserUseCase,
					registerUserUseCase: deps.useCases.registerUserUseCase,
					verifyTokenUseCase: deps.useCases.verifyTokenUseCase,
					completeRegistrationUseCase:
						deps.useCases.completeRegistrationUseCase,
					updateUserThemeUseCase: deps.useCases.updateUserThemeUseCase
				});
				return authController.verify(c);
			})

			// 本登録完了
			.post("/complete", zValidator("json", completeSchema), async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const authController = new AuthController({
					loginUserUseCase: deps.useCases.loginUserUseCase,
					registerUserUseCase: deps.useCases.registerUserUseCase,
					verifyTokenUseCase: deps.useCases.verifyTokenUseCase,
					completeRegistrationUseCase:
						deps.useCases.completeRegistrationUseCase,
					updateUserThemeUseCase: deps.useCases.updateUserThemeUseCase
				});
				return authController.complete(c);
			})
	);
}

/**
 * ユーザールートを作成（認証が必要）
 *
 * @returns Honoアプリケーション
 */
export function createUserRoutes() {
	return (
		new Hono<{ Bindings: Bindings }>()
			.use("*", jwtMiddleware)

			// ユーザー情報取得
			.get("/:id", async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const authController = new AuthController({
					loginUserUseCase: deps.useCases.loginUserUseCase,
					registerUserUseCase: deps.useCases.registerUserUseCase,
					verifyTokenUseCase: deps.useCases.verifyTokenUseCase,
					completeRegistrationUseCase:
						deps.useCases.completeRegistrationUseCase,
					updateUserThemeUseCase: deps.useCases.updateUserThemeUseCase,
					getUserUseCase: deps.useCases.getUserUseCase
				});
				return authController.getUser(c);
			})

			// ユーザーテーマ更新
			.patch("/:id/theme", zValidator("json", updateThemeSchema), async (c) => {
				const db = c.env.DB;
				const deps = makeDependencies(db, { now: () => new Date() });
				const authController = new AuthController({
					loginUserUseCase: deps.useCases.loginUserUseCase,
					registerUserUseCase: deps.useCases.registerUserUseCase,
					verifyTokenUseCase: deps.useCases.verifyTokenUseCase,
					completeRegistrationUseCase:
						deps.useCases.completeRegistrationUseCase,
					updateUserThemeUseCase: deps.useCases.updateUserThemeUseCase,
					getUserUseCase: deps.useCases.getUserUseCase
				});
				return authController.updateTheme(c);
			})
	);
}
