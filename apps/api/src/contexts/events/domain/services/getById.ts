import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { Event, EventId, EventsRepoPort, UserId } from "../../ports";
import type { DomainError } from "../errors";

type Deps = { repo: EventsRepoPort };

export const getById =
	(deps: Deps) =>
	async (
		id: EventId,
		ownerUserId: UserId
	): Promise<Result<Event, DomainError>> => {
		try {
			const found = await deps.repo.findById(id, ownerUserId);
			if (!found) {
				return err({
					type: "NotFound",
					entity: "Event",
					id: id as unknown as number
				});
			}
			return ok(found);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to find event by id",
				cause
			});
		}
	};
