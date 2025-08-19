import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthDeps } from "../../../auth/ports";
import type { DomainError } from "../errors";

/**
 * 本登録完了コマンド。
 */
export type CompleteCmd = {
	/** 検証トークン */ token: string;
	/** ユーザー名 */ name: string;
	/** パスワード */ password: string;
};

/**
 * 本登録完了結果。
 */
export type CompleteResult = {
	/** 成功フラグ */ success: boolean;
	/** 結果メッセージ */ message: string;
};

/**
 * 本登録完了ユースケース。
 *
 * 検証トークンを使用して本登録を完了し、パスワードをハッシュ化して保存します。
 * トークンの有効性と重複登録をチェックします。
 *
 * @param deps - 認証依存関係
 * @returns 成功時は完了結果、失敗時はドメインエラー
 */
export const complete =
	(deps: AuthDeps) =>
	async (cmd: CompleteCmd): Promise<Result<CompleteResult, DomainError>> => {
		try {
			const user = await deps.repo.findUserByVerificationToken(cmd.token);
			if (!user) {
				return ok({ success: false, message: "無効なトークンです。" });
			}
			if (user.isVerified) {
				return ok({ success: false, message: "既に本登録が完了しています。" });
			}
			const hasher =
				deps.hashPassword ??
				(await import("../../../../lib/token")).hashPassword;
			const passwordHash = await hasher(cmd.password);
			await deps.repo.completeUserRegistration({
				token: cmd.token,
				name: cmd.name,
				passwordHash
			});
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
