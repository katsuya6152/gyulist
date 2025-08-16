import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { Event, EventsRepoPort } from "../../../events/ports";
import type { CreateEventInput } from "../codecs/input";
import type { DomainError } from "../errors";

type Deps = { repo: EventsRepoPort };

export const create =
	(deps: Deps) =>
	async (input: CreateEventInput): Promise<Result<Event, DomainError>> => {
		try {
			const created = await deps.repo.create({
				cattleId: input.cattleId as unknown as Event["cattleId"],
				eventType: input.eventType as Event["eventType"],
				eventDatetime: input.eventDatetime,
				notes: (input.notes ?? null) as Event["notes"],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as unknown as Omit<Event, "eventId">);
			return ok(created);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to create event",
				cause
			});
		}
	};
