import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthDeps } from "../../../auth/ports";
import type { DomainError } from "../errors";

export type VerifyCmd = { token: string };
export type VerifyResult = { success: boolean; message: string };

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
