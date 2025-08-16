import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleId, Event, EventsRepoPort, UserId } from "../../ports";
import type { DomainError } from "../errors";

type Deps = { repo: EventsRepoPort };

export const listByCattle =
	(deps: Deps) =>
	async (
		cattleId: CattleId,
		ownerUserId: UserId
	): Promise<Result<Event[], DomainError>> => {
		try {
			const rows = await deps.repo.listByCattleId(cattleId, ownerUserId);
			return ok(rows);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to list events by cattle",
				cause
			});
		}
	};
