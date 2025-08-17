import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { Event, EventId, EventsRepoPort } from "../../../events/ports";
import type { UpdateEventInput } from "../codecs/input";
import type { DomainError } from "../errors";

type Deps = { repo: EventsRepoPort };

export const update =
	(deps: Deps) =>
	async (
		id: EventId,
		input: UpdateEventInput
	): Promise<Result<Event, DomainError>> => {
		try {
			const updated = await deps.repo.update(id, {
				...(input as Partial<Event>),
				updatedAt: new Date().toISOString()
			});
			return ok(updated);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to update event",
				cause
			});
		}
	};
