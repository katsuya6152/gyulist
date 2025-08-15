import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthDeps } from "../../../auth/ports";
import type { DomainError } from "../errors";

export type LoginCmd = {
	email: string;
	password: string;
};

export type LoginResult = {
	token: string;
};

export const login =
	(deps: AuthDeps) =>
	async (cmd: LoginCmd): Promise<Result<LoginResult, DomainError>> => {
		const user = await deps.repo.findUserByEmail(cmd.email);
		if (!user) {
			return err({
				type: "Unauthorized",
				message: "メールアドレスまたはパスワードが正しくありません"
			});
		}

		// OAuth users have dummy password hashes starting with "oauth_dummy_"
		if (user.passwordHash?.startsWith("oauth_dummy_")) {
			return err({
				type: "Unauthorized",
				message: "このアカウントはGoogleログインでご利用ください"
			});
		}

		// Delegate password verification via injected dependency first, fallback to existing lib
		const providedVerify = deps.verifyPassword;
		const verifyFn =
			providedVerify ?? (await import("../../../../lib/auth")).verifyPassword;
		if (!user.passwordHash) {
			return err({
				type: "Unauthorized",
				message:
					"メールアドレスまたはパスワードもしくはログイン方法が正しくありません"
			});
		}
		const valid = await verifyFn(cmd.password, user.passwordHash);
		if (!valid) {
			return err({
				type: "Unauthorized",
				message: "メールアドレスまたはパスワードが正しくありません"
			});
		}

		await deps.repo.updateLastLoginAt(user.id, new Date().toISOString());
		const token = await deps.token.sign({
			userId: user.id as unknown as number,
			exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60
		});
		return ok({ token: typeof token === "string" ? token : String(token) });
	};
