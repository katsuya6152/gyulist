/**
 * Register User Use Case
 *
 * ユーザー仮登録のユースケース実装
 */

import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import { createUser } from "../../../domain/functions/auth";
import type {
	AuthRepository,
	VerificationTokenGenerator
} from "../../../domain/ports/auth";
import type { User } from "../../../domain/types/auth";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type RegisterUserInput = {
	readonly email: string;
};

export type RegisterUserResult = {
	readonly success: true;
	readonly message: string;
	readonly verificationToken?: string;
};

export type RegisterUserDeps = {
	readonly authRepo: AuthRepository;
	readonly tokenGenerator: VerificationTokenGenerator;
	readonly clock: ClockPort;
};

export type RegisterUserUseCase = (
	deps: RegisterUserDeps
) => (
	input: RegisterUserInput
) => Promise<Result<RegisterUserResult, AuthError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * ユーザー仮登録ユースケース
 *
 * メールアドレスによる仮登録を行い、検証トークンを生成します。
 * 既存ユーザーの場合はセキュリティのため同じメッセージを返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const registerUserUseCase: RegisterUserUseCase =
	(deps: RegisterUserDeps) =>
	async (
		input: RegisterUserInput
	): Promise<Result<RegisterUserResult, AuthError>> => {
		try {
			// 既存ユーザーチェック
			const existingResult = await deps.authRepo.findByEmail(input.email);
			if (!existingResult.ok) return existingResult;

			if (existingResult.value) {
				// Security: return same message for existing user
				return ok({
					success: true,
					message: "仮登録が完了しました。メールを確認してください。"
				});
			}

			// 検証トークン生成
			const verificationToken = await deps.tokenGenerator.generate();

			// 新規ユーザー作成
			const currentTime = deps.clock.now();
			const userResult = createUser(
				{
					userName: "未設定", // 仮登録時は仮の名前
					email: input.email,
					verificationToken
				},
				currentTime
			);

			if (!userResult.ok) return userResult;

			// データベースに保存
			const createResult = await deps.authRepo.create({
				email: input.email,
				verificationToken
			});

			if (!createResult.ok) return createResult;

			return ok({
				success: true,
				message: "仮登録が完了しました。メールを確認してください。",
				verificationToken
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to register user",
				cause
			});
		}
	};
