/**
 * Get User Use Case
 *
 * ユーザー情報を取得するユースケース
 */

import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import {
	createInfraError,
	createNotFoundError,
	createUnauthorizedError
} from "../../../domain/errors/auth/AuthErrors";
import type { AuthRepository } from "../../../domain/ports/auth";
import type { User, UserId } from "../../../domain/types/auth";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetUserDeps = {
	authRepo: AuthRepository;
};

/**
 * 取得コマンドの型
 */
export type GetUserInput = {
	userId: UserId;
	requestingUserId: UserId; // リクエストしているユーザーのID（認証用）
};

/**
 * ユーザー情報取得ユースケースの関数型定義
 */
export type GetUserUseCase = (
	deps: GetUserDeps
) => (input: GetUserInput) => Promise<Result<User, AuthError>>;

/**
 * ユーザー情報を取得するユースケース
 *
 * 指定されたユーザーIDのユーザー情報を取得します。
 * セキュリティのため、自分自身の情報のみ取得可能です。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時はユーザー情報、失敗時は `AuthError` を含む `Result`
 */
export const getUserUseCase: GetUserUseCase =
	(deps) =>
	async (input): Promise<Result<User, AuthError>> => {
		try {
			// セキュリティチェック：自分自身の情報のみ取得可能
			if (input.userId !== input.requestingUserId) {
				return err(
					createUnauthorizedError(
						"You can only access your own user information"
					)
				);
			}

			// ユーザー情報を取得
			const result = await deps.authRepo.findById(input.userId);
			if (!result.ok) {
				return result;
			}

			const user = result.value;
			if (!user) {
				return err(createNotFoundError("User", input.userId, "User not found"));
			}

			return ok(user);
		} catch (error) {
			return err(createInfraError("Failed to get user", error));
		}
	};
