/**
 * Update User Theme Use Case
 *
 * ユーザーテーマ更新のユースケース実装
 */

import type { AuthError } from "../../../domain/errors/auth/AuthErrors";
import type { AuthRepository } from "../../../domain/ports/auth";
import type { User, UserId } from "../../../domain/types/auth";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";
import { err } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type UpdateUserThemeInput = {
	readonly userId: UserId;
	readonly requestingUserId: UserId;
	readonly theme: string;
};

export type UpdateUserThemeResult = {
	readonly user: User;
};

export type UpdateUserThemeDeps = {
	readonly authRepo: AuthRepository;
	readonly clock: ClockPort;
};

export type UpdateUserThemeUseCase = (
	deps: UpdateUserThemeDeps
) => (
	input: UpdateUserThemeInput
) => Promise<Result<UpdateUserThemeResult, AuthError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * ユーザーテーマ更新ユースケース
 *
 * ユーザーのテーマ設定を更新します。
 * 本人のみが更新可能で、他のユーザーのテーマは更新できません。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const updateUserThemeUseCase: UpdateUserThemeUseCase =
	(deps: UpdateUserThemeDeps) =>
	async (
		input: UpdateUserThemeInput
	): Promise<Result<UpdateUserThemeResult, AuthError>> => {
		// 権限チェック：本人のみが更新可能
		if (input.userId !== input.requestingUserId) {
			return err({
				type: "Forbidden",
				message: "他のユーザーのテーマは変更できません"
			});
		}

		// ユーザー存在確認
		const userResult = await deps.authRepo.findById(input.userId);
		if (!userResult.ok) return userResult;

		const user = userResult.value;
		if (!user) {
			return err({
				type: "NotFound",
				entity: "User",
				id: input.userId,
				message: "ユーザーが見つかりません"
			});
		}

		// テーマバリデーション
		const validThemes = ["light", "dark", "auto"];
		if (!validThemes.includes(input.theme)) {
			return err({
				type: "ValidationError",
				message: "無効なテーマです",
				field: "theme"
			});
		}

		// テーマ更新
		const currentTime = deps.clock.now();
		const updateResult = await deps.authRepo.updateTheme(
			input.userId,
			input.theme,
			currentTime
		);

		if (!updateResult.ok) return updateResult;

		return {
			ok: true,
			value: {
				user: updateResult.value
			}
		};
	};
