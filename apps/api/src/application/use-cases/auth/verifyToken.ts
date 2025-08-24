/**
 * Verify Token Use Case
 *
 * トークン検証のユースケース実装
 */

import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import { UserRules } from "../../../domain/functions/auth";
import type { AuthRepository } from "../../../domain/ports/auth";
import type { Result } from "../../../shared/result";
import { ok } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type VerifyTokenInput = {
	readonly token: string;
};

export type VerifyTokenResult = {
	readonly success: boolean;
	readonly message: string;
};

export type VerifyTokenDeps = {
	readonly authRepo: AuthRepository;
};

export type VerifyTokenUseCase = (
	deps: VerifyTokenDeps
) => (input: VerifyTokenInput) => Promise<Result<VerifyTokenResult, AuthError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * トークン検証ユースケース
 *
 * 検証トークンの有効性をチェックし、本登録可能かどうかを判定します。
 * トークンの存在と重複登録をチェックします。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const verifyTokenUseCase: VerifyTokenUseCase =
	(deps: VerifyTokenDeps) =>
	async (
		input: VerifyTokenInput
	): Promise<Result<VerifyTokenResult, AuthError>> => {
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

			return ok({
				success: true,
				message: "トークンは有効です。本登録を完了してください。"
			});
		} catch (cause) {
			return ok({
				success: false,
				message: "トークンの検証中にエラーが発生しました。"
			});
		}
	};
