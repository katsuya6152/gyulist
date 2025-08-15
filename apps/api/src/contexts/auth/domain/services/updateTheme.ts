import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AuthRepoPort } from "../../../auth/ports";
import type { DomainError } from "../errors";

export type UpdateThemeCmd = {
	requestingUserId: number;
	targetUserId: number;
	theme: string;
	nowIso: string;
};

export type UpdateThemeResult = { success: true; theme: string };

type Deps = { repo: AuthRepoPort };

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
