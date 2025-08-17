import type { CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type {
	BloodlineRepoPort,
	BreedingRepoPort,
	MotherInfoRepoPort
} from "../../../breeding/ports";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";

type Deps = {
	repo: CattleRepoPort;
	breedingRepo?: BreedingRepoPort;
	bloodlineRepo?: BloodlineRepoPort;
	motherInfoRepo?: MotherInfoRepoPort;
};

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
		// Orchestrate cross-context deletes first when available (Hex):
		await deps.breedingRepo?.delete(cmd.id);
		await deps.bloodlineRepo?.delete(cmd.id);
		await deps.motherInfoRepo?.delete(cmd.id);
		await deps.repo.delete(cmd.id);
		return ok(undefined);
	};
