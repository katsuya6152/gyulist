import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthDeps } from "../../../auth/ports";
import type { DomainError } from "../errors";

/**
 * ユーザー登録コマンド。
 */
export type RegisterCmd = {
	/** メールアドレス */ email: string;
};

/**
 * ユーザー登録結果。
 */
export type RegisterResult = {
	/** 成功フラグ */ success: true;
	/** 結果メッセージ */ message: string;
	/** 検証トークン（新規登録時のみ） */ verificationToken?: string;
};

/**
 * ユーザー登録ユースケース。
 *
 * メールアドレスによる仮登録を行い、検証トークンを生成します。
 * 既存ユーザーの場合はセキュリティのため同じメッセージを返します。
 *
 * @param deps - 認証依存関係
 * @returns 成功時は登録結果、失敗時はドメインエラー
 */
export const register =
	(deps: AuthDeps) =>
	async (cmd: RegisterCmd): Promise<Result<RegisterResult, DomainError>> => {
		const existing = await deps.repo.findUserByEmail(cmd.email);
		if (existing) {
			// Security: return same message for existing user
			return ok({
				success: true,
				message: "仮登録が完了しました。メールを確認してください。"
			});
		}

		try {
			const generateVerificationToken =
				deps.generateVerificationToken ??
				(await import("../../../../lib/token")).generateToken;
			const token = await generateVerificationToken();
			await deps.repo.createUser({
				email: cmd.email,
				verificationToken: token
			});
			return ok({
				success: true,
				message: "仮登録が完了しました。メールを確認してください。",
				verificationToken: token
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to register user",
				cause
			});
		}
	};
