import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthDeps } from "../../../auth/ports";
import type { DomainError } from "../errors";

export type RegisterCmd = {
	email: string;
};

export type RegisterResult = {
	success: true;
	message: string;
	verificationToken?: string;
};

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
