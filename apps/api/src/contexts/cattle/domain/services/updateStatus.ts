import type { CattleId, UserId } from "../../../../shared/brand";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";
import type { Cattle } from "../model/cattle";

type Deps = { repo: CattleRepoPort; clock: ClockPort };

export type UpdateStatusCmd = {
	requesterUserId: UserId;
	id: CattleId;
	newStatus: NonNullable<Cattle["status"]>;
	reason?: string | null;
};

export const updateStatus =
	(deps: Deps) =>
	async (cmd: UpdateStatusCmd): Promise<Result<Cattle, DomainError>> => {
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
		const updated = await deps.repo.update(cmd.id, {
			status: cmd.newStatus,
			updatedAt: deps.clock.now().toISOString()
		});
		await deps.repo.appendStatusHistory({
			cattleId: cmd.id,
			oldStatus: current.status ?? null,
			newStatus: cmd.newStatus,
			changedBy: cmd.requesterUserId,
			reason: cmd.reason ?? null
		});
		return ok(updated);
	};
