/**
 * Complete Registration Use Case
 *
 * ユーザー本登録完了のユースケース実装
 */

import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import { UserRules } from "../../../domain/functions/auth";
import type {
	AuthRepository,
	PasswordHasher
} from "../../../domain/ports/auth";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type CompleteRegistrationInput = {
	readonly token: string;
	readonly name: string;
	readonly password: string;
};

export type CompleteRegistrationResult = {
	readonly success: boolean;
	readonly message: string;
};

export type CompleteRegistrationDeps = {
	readonly authRepo: AuthRepository;
	readonly passwordHasher: PasswordHasher;
	readonly clock: ClockPort;
};

export type CompleteRegistrationUseCase = (
	deps: CompleteRegistrationDeps
) => (
	input: CompleteRegistrationInput
) => Promise<Result<CompleteRegistrationResult, AuthError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * ユーザー本登録完了ユースケース
 *
 * 検証トークンを使用して本登録を完了し、パスワードをハッシュ化して保存します。
 * トークンの有効性と重複登録をチェックします。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const completeRegistrationUseCase: CompleteRegistrationUseCase =
	(deps: CompleteRegistrationDeps) =>
	async (
		input: CompleteRegistrationInput
	): Promise<Result<CompleteRegistrationResult, AuthError>> => {
		try {
			// トークンでユーザー検索
			const userResult = await deps.authRepo.findByVerificationToken(
				input.token
			);
			if (!userResult.ok) return userResult;

			const user = userResult.value;
			if (!user) {
				return ok({
					success: false,
					message: "無効なトークンです。"
				});
			}

			// 既に認証済みかチェック
			if (UserRules.isVerified(user)) {
				return ok({
					success: false,
					message: "既に本登録が完了しています。"
				});
			}

			// パスワードバリデーション
			if (!input.password || input.password.length < 8) {
				return err({
					type: "ValidationError",
					message: "パスワードは8文字以上で入力してください",
					field: "password"
				});
			}

			if (input.password.length > 128) {
				return err({
					type: "ValidationError",
					message: "パスワードは128文字以下で入力してください",
					field: "password"
				});
			}

			// ユーザー名バリデーション
			if (!input.name || input.name.trim().length === 0) {
				return err({
					type: "ValidationError",
					message: "ユーザー名は必須です",
					field: "name"
				});
			}

			if (input.name.trim().length > 100) {
				return err({
					type: "ValidationError",
					message: "ユーザー名は100文字以下で入力してください",
					field: "name"
				});
			}

			// パスワードハッシュ化
			const passwordHash = await deps.passwordHasher.hash(input.password);

			// 登録完了
			const completeResult = await deps.authRepo.completeRegistration({
				token: input.token,
				name: input.name.trim(),
				passwordHash
			});

			if (!completeResult.ok) return completeResult;

			return ok({
				success: true,
				message: "本登録が完了しました。ログインしてください。"
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to complete registration",
				cause
			});
		}
	};
