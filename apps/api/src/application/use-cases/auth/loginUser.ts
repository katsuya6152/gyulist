/**
 * Login User Use Case
 *
 * ユーザーログインのユースケース実装
 */

import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import type {
	AuthRepository,
	PasswordVerifier
} from "../../../domain/ports/auth";
import type { User } from "../../../domain/types/auth";
import type { ClockPort } from "../../../shared/ports/clock";
import type { TokenPort } from "../../../shared/ports/token";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type LoginUserInput = {
	readonly email: string;
	readonly password: string;
};

export type LoginUserResult = {
	readonly token: string;
	readonly user: User;
};

export type LoginUserDeps = {
	readonly authRepo: AuthRepository;
	readonly passwordVerifier: PasswordVerifier;
	readonly tokenService: TokenPort;
	readonly clock: ClockPort;
};

export type LoginUserUseCase = (
	deps: LoginUserDeps
) => (input: LoginUserInput) => Promise<Result<LoginUserResult, AuthError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * ユーザーログインユースケース
 *
 * メールアドレスとパスワードによる認証を行い、
 * 成功時はJWTトークンとユーザー情報を返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const loginUserUseCase: LoginUserUseCase =
	(deps: LoginUserDeps) =>
	async (
		input: LoginUserInput
	): Promise<Result<LoginUserResult, AuthError>> => {
		// ユーザー検索
		const userResult = await deps.authRepo.findByEmail(input.email);
		if (!userResult.ok) return userResult;

		const user = userResult.value;
		if (!user) {
			return err({
				type: "Unauthorized",
				message: "メールアドレスまたはパスワードが正しくありません"
			});
		}

		// OAuth users have dummy password hashes starting with "oauth_dummy_"
		if (user.passwordHash?.startsWith("oauth_dummy_")) {
			return err({
				type: "Unauthorized",
				message: "このアカウントはGoogleログインでご利用ください"
			});
		}

		// パスワード検証
		if (!user.passwordHash) {
			return err({
				type: "Unauthorized",
				message:
					"メールアドレスまたはパスワードもしくはログイン方法が正しくありません"
			});
		}

		const isValidPassword = await deps.passwordVerifier.verify(
			input.password,
			user.passwordHash
		);

		if (!isValidPassword) {
			return err({
				type: "Unauthorized",
				message: "メールアドレスまたはパスワードが正しくありません"
			});
		}

		// 最終ログイン日時更新
		const currentTime = deps.clock.now();
		const updateResult = await deps.authRepo.updateLastLogin(
			user.id,
			currentTime
		);
		if (!updateResult.ok) return updateResult;

		// JWTトークン生成
		const token = await deps.tokenService.sign({
			userId: user.id as unknown as number,
			exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60 // 12時間
		});

		return ok({
			token: typeof token === "string" ? token : String(token),
			user: updateResult.value
		});
	};
