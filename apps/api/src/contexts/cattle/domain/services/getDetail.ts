import type { CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventsRepoPort } from "../../../events/ports";
import type { CattleRepoPort } from "../../ports";
import type { CattleDetailsQueryPort } from "../../ports.details";
import type { DomainError } from "../errors";

type Deps = {
	repo: CattleRepoPort;
	eventsRepo: EventsRepoPort;
	details: CattleDetailsQueryPort;
};

export type GetCattleDetailCmd = {
	id: CattleId;
	requesterUserId: UserId;
};

export const getDetail =
	(deps: Deps) =>
	async (
		cmd: GetCattleDetailCmd
	): Promise<Result<Record<string, unknown>, DomainError>> => {
		const found = await deps.repo.findById(cmd.id);
		if (!found) {
			return err({
				type: "NotFound",
				entity: "Cattle",
				id: cmd.id as unknown as number,
				message: "Cattle not found"
			});
		}

		if (
			(found.ownerUserId as unknown as number) !==
			(cmd.requesterUserId as unknown as number)
		) {
			return err({ type: "Forbidden", message: "Unauthorized" });
		}

		const [
			events,
			bloodline,
			motherInfo,
			breedingStatusRaw,
			breedingSummaryRaw
		] = await Promise.all([
			deps.eventsRepo.listByCattleId(cmd.id, cmd.requesterUserId),
			deps.details.getBloodline(cmd.id),
			deps.details.getMotherInfo(cmd.id),
			deps.details.getBreedingStatus(cmd.id),
			deps.details.getBreedingSummary(cmd.id)
		]);

		const normalizedBreedingStatus = breedingStatusRaw
			? {
					...breedingStatusRaw,
					createdAt: new Date(breedingStatusRaw.createdAt),
					updatedAt: new Date(breedingStatusRaw.updatedAt)
				}
			: null;

		const normalizedBreedingSummary = breedingSummaryRaw
			? {
					...breedingSummaryRaw,
					createdAt: new Date(breedingSummaryRaw.createdAt),
					updatedAt: new Date(breedingSummaryRaw.updatedAt)
				}
			: null;

		return ok({
			...(found as unknown as Record<string, unknown>),
			events,
			bloodline,
			motherInfo,
			breedingStatus: normalizedBreedingStatus,
			breedingSummary: normalizedBreedingSummary
		});
	};
