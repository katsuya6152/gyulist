/**
 * Auth Controller
 *
 * 認証・ユーザー管理のHTTPコントローラー
 */

import type { Context } from "hono";
import type {
	CompleteRegistrationInput,
	CompleteRegistrationUseCase,
	GetUserInput,
	GetUserUseCase,
	LoginUserInput,
	LoginUserUseCase,
	RegisterUserInput,
	RegisterUserUseCase,
	UpdateUserThemeInput,
	UpdateUserThemeUseCase,
	VerifyTokenInput,
	VerifyTokenUseCase
} from "../../../application/use-cases/auth";
import type { UserId } from "../../../domain/types/auth";
import type { Env } from "../../../types";

// ============================================================================
// Controller Dependencies
// ============================================================================

export type AuthControllerDeps = {
	readonly loginUserUseCase: (
		input: LoginUserInput
	) => Promise<
		import("../../../shared/result").Result<
			import("../../../application/use-cases/auth").LoginUserResult,
			import("../../../domain/errors/auth/AuthErrors").AuthError
		>
	>;
	readonly registerUserUseCase: (
		input: RegisterUserInput
	) => Promise<
		import("../../../shared/result").Result<
			import("../../../application/use-cases/auth").RegisterUserResult,
			import("../../../domain/errors/auth/AuthErrors").AuthError
		>
	>;
	readonly verifyTokenUseCase: (
		input: VerifyTokenInput
	) => Promise<
		import("../../../shared/result").Result<
			import("../../../application/use-cases/auth").VerifyTokenResult,
			import("../../../domain/errors/auth/AuthErrors").AuthError
		>
	>;
	readonly completeRegistrationUseCase: (
		input: CompleteRegistrationInput
	) => Promise<
		import("../../../shared/result").Result<
			import("../../../application/use-cases/auth").CompleteRegistrationResult,
			import("../../../domain/errors/auth/AuthErrors").AuthError
		>
	>;
	readonly updateUserThemeUseCase: (
		input: UpdateUserThemeInput
	) => Promise<
		import("../../../shared/result").Result<
			import("../../../application/use-cases/auth").UpdateUserThemeResult,
			import("../../../domain/errors/auth/AuthErrors").AuthError
		>
	>;
	readonly getUserUseCase: (
		input: GetUserInput
	) => Promise<
		import("../../../shared/result").Result<
			import("../../../domain/types/auth").User,
			import("../../../domain/errors/auth/AuthErrors").AuthError
		>
	>;
};

// ============================================================================
// Controller Implementation
// ============================================================================

/**
 * 認証コントローラー
 *
 * HTTPリクエストを受け取り、適切なユースケースに委譲します。
 */
export class AuthController {
	constructor(private readonly deps: AuthControllerDeps) {}

	/**
	 * ユーザーログイン
	 * POST /auth/login
	 */
	async login(c: Context<{ Bindings: Env }>) {
		try {
			console.log("Login method called");
			const body = await c.req.json();
			console.log("Request body parsed:", { email: body.email });

			const input: LoginUserInput = {
				email: body.email,
				password: body.password
			};

			console.log("Login attempt for:", input.email);
			console.log("About to call loginUserUseCase");
			const result = await this.deps.loginUserUseCase(input);
			console.log("loginUserUseCase completed, result:", result);

			if (!result.ok) {
				console.log("Login failed:", result.error);
				if (result.error.type === "Unauthorized") {
					return c.json({ error: result.error.message }, 401);
				}
				if (result.error.type === "ValidationError") {
					return c.json({ error: result.error.message }, 400);
				}
				return c.json({ error: "Internal server error" }, 500);
			}

			console.log("Login successful for:", input.email);
			return c.json({
				token: result.value.token,
				user: {
					id: result.value.user.id,
					userName: result.value.user.userName,
					email: result.value.user.email,
					theme: result.value.user.theme
				}
			});
		} catch (error) {
			console.error("Login error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}

	/**
	 * ユーザー仮登録
	 * POST /auth/register
	 */
	async register(c: Context<{ Bindings: Env }>) {
		const body = await c.req.json();

		const input: RegisterUserInput = {
			email: body.email
		};

		const result = await this.deps.registerUserUseCase(input);

		if (!result.ok) {
			if (result.error.type === "ValidationError") {
				return c.json({ error: result.error.message }, 400);
			}
			return c.json({ error: "Internal server error" }, 500);
		}

		return c.json({
			success: result.value.success,
			message: result.value.message
		});
	}

	/**
	 * トークン検証
	 * POST /auth/verify
	 */
	async verify(c: Context<{ Bindings: Env }>) {
		const body = await c.req.json();

		const input: VerifyTokenInput = {
			token: body.token
		};

		const result = await this.deps.verifyTokenUseCase(input);

		if (!result.ok) {
			return c.json({ error: "Internal server error" }, 500);
		}

		return c.json({
			success: result.value.success,
			message: result.value.message
		});
	}

	/**
	 * 本登録完了
	 * POST /auth/complete
	 */
	async complete(c: Context<{ Bindings: Env }>) {
		const body = await c.req.json();

		const input: CompleteRegistrationInput = {
			token: body.token,
			name: body.name,
			password: body.password
		};

		const result = await this.deps.completeRegistrationUseCase(input);

		if (!result.ok) {
			if (result.error.type === "ValidationError") {
				return c.json({ error: result.error.message }, 400);
			}
			return c.json({ error: "Internal server error" }, 500);
		}

		return c.json({
			success: result.value.success,
			message: result.value.message
		});
	}

	/**
	 * ユーザーテーマ更新
	 * PATCH /users/:id/theme
	 */
	async updateTheme(c: Context<{ Bindings: Env }>) {
		try {
			const body = await c.req.json();
			const userId = Number.parseInt(c.req.param("id")) as UserId;
			const requestingUserId = c.get("jwtPayload").userId as UserId;

			const input: UpdateUserThemeInput = {
				userId,
				requestingUserId,
				theme: body.theme
			};

			const result = await this.deps.updateUserThemeUseCase(input);

			if (!result.ok) {
				return c.json({ error: result.error }, 400);
			}

			return c.json({ success: true, data: result.value });
		} catch (error) {
			console.error("Theme update error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}

	/**
	 * ユーザー情報取得
	 * GET /users/:id
	 */
	async getUser(c: Context<{ Bindings: Env }>) {
		try {
			const jwtPayload = c.get("jwtPayload");
			const requestingUserId = jwtPayload.userId as UserId;
			const userId = Number.parseInt(c.req.param("id")) as UserId;

			const input: GetUserInput = {
				userId,
				requestingUserId
			};

			const result = await this.deps.getUserUseCase(input);

			if (!result.ok) {
				if (result.error.type === "Unauthorized") {
					return c.json({ error: result.error.message }, 403);
				}
				if (result.error.type === "NotFound") {
					return c.json({ error: result.error.message }, 404);
				}
				return c.json({ error: result.error.message }, 500);
			}

			return c.json({ success: true, data: result.value });
		} catch (error) {
			console.error("Get user error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
}
