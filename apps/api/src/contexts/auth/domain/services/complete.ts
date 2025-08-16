import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthDeps } from "../../../auth/ports";
import type { DomainError } from "../errors";

export type CompleteCmd = { token: string; name: string; password: string };
export type CompleteResult = { success: boolean; message: string };

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
