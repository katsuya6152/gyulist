import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventId, EventsRepoPort } from "../../../events/ports";
import type { DomainError } from "../errors";

type Deps = { repo: EventsRepoPort };

export const remove =
	(deps: Deps) =>
	async (id: EventId): Promise<Result<{ success: true }, DomainError>> => {
		try {
			await deps.repo.delete(id);
			return ok({ success: true });
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to delete event",
				cause
			});
		}
	};
