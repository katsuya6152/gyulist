import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventsRepoPort } from "../../../events/ports";
import type { CattleId, UserId } from "../../../events/ports";
import type { SearchEventsInput } from "../codecs/input";
import type { DomainError } from "../errors";

type Deps = { repo: EventsRepoPort };

export const search =
	(deps: Deps) =>
	async (
		ownerUserId: UserId,
		q: SearchEventsInput
	): Promise<
		Result<Awaited<ReturnType<EventsRepoPort["search"]>>, DomainError>
	> => {
		try {
			const res = await deps.repo.search({
				ownerUserId,
				cattleId: q.cattleId as unknown as CattleId | undefined,
				eventType: q.eventType,
				startDate: q.startDate,
				endDate: q.endDate,
				cursor: q.cursor ?? null,
				limit: q.limit
			});
			return ok(res);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to search events",
				cause
			});
		}
	};
