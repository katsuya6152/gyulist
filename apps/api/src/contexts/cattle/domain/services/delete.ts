import type { CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";

type Deps = { repo: CattleRepoPort };

export type DeleteCattleCmd = {
	requesterUserId: UserId;
	id: CattleId;
};

export const remove =
	(deps: Deps) =>
	async (cmd: DeleteCattleCmd): Promise<Result<void, DomainError>> => {
		const current = await deps.repo.findById(cmd.id);
		if (!current)
			return err({
				type: "NotFound",
				entity: "Cattle",
				id: cmd.id as unknown as number
			});
		if (
			(current.ownerUserId as unknown as number) !==
			(cmd.requesterUserId as unknown as number)
		) {
			return err({ type: "Forbidden", message: "You do not own this cattle" });
		}
		await deps.repo.delete(cmd.id);
		return ok(undefined);
	};
