import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthRepoPort } from "../../../auth/ports";
import type { DomainError } from "../errors";

/**
 * テーマ更新コマンド。
 */
export type UpdateThemeCmd = {
	/** リクエスト元ユーザーID */ requestingUserId: number;
	/** 対象ユーザーID */ targetUserId: number;
	/** 新しいテーマ */ theme: string;
	/** 現在日時（ISO8601） */ nowIso: string;
};

/**
 * テーマ更新結果。
 */
export type UpdateThemeResult = {
	/** 成功フラグ */ success: true;
	/** 更新されたテーマ */ theme: string;
};

/**
 * テーマ更新の依存関係。
 */
type Deps = {
	/** 認証リポジトリ */ repo: AuthRepoPort;
};

/**
 * テーマ更新ユースケース。
 *
 * ユーザーのテーマ設定を更新します。
 * セキュリティのため、自分自身のテーマのみ更新可能です。
 *
 * @param deps - 依存関係
 * @returns 成功時は更新結果、失敗時はドメインエラー
 */
export const updateTheme =
	(deps: Deps) =>
	async (
		cmd: UpdateThemeCmd
	): Promise<Result<UpdateThemeResult, DomainError>> => {
		if (cmd.requestingUserId !== cmd.targetUserId) {
			return err({
				type: "Forbidden",
				message: "You cannot update others' theme"
			});
		}
		await deps.repo.updateUserTheme(
			cmd.targetUserId as unknown as never,
			cmd.theme,
			cmd.nowIso
		);
		return ok({ success: true, theme: cmd.theme });
	};
