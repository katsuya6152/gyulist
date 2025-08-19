import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthDeps } from "../../../auth/ports";
import type { DomainError } from "../errors";

/**
 * トークン検証コマンド。
 */
export type VerifyCmd = {
	/** 検証トークン */ token: string;
};

/**
 * トークン検証結果。
 */
export type VerifyResult = {
	/** 成功フラグ */ success: boolean;
	/** 結果メッセージ */ message: string;
};

/**
 * トークン検証ユースケース。
 *
 * 検証トークンの有効性をチェックし、本登録可能かどうかを判定します。
 * トークンの存在と重複登録をチェックします。
 *
 * @param deps - 認証依存関係
 * @returns 成功時は検証結果、失敗時はドメインエラー
 */
export const verify =
	(deps: AuthDeps) =>
	async (cmd: VerifyCmd): Promise<Result<VerifyResult, DomainError>> => {
		try {
			const user = await deps.repo.findUserByVerificationToken(cmd.token);
			if (!user) {
				return ok({ success: false, message: "無効なトークンです。" });
			}
			if (user.isVerified) {
				return ok({ success: false, message: "既に本登録が完了しています。" });
			}
			return ok({
				success: true,
				message: "トークンは有効です。本登録を完了してください。"
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to verify token",
				cause
			});
		}
	};
