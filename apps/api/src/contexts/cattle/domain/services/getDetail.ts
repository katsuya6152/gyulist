import type { CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventsRepoPort } from "../../../events/ports";
import type { CattleRepoPort } from "../../ports";
import type { DomainError } from "../errors";

type Deps = {
	repo: CattleRepoPort;
	eventsRepo: EventsRepoPort;
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

		const [events, bloodline, motherInfo, breedingStatus, breedingSummary] =
			await Promise.all([
				deps.eventsRepo.listByCattleId(cmd.id, cmd.requesterUserId),
				deps.repo.getBloodline(cmd.id),
				deps.repo.getMotherInfo(cmd.id),
				deps.repo.getBreedingStatus(cmd.id),
				deps.repo.getBreedingSummary(cmd.id)
			]);

		const normalizedBreedingStatus = breedingStatus
			? {
					...breedingStatus,
					createdAt: new Date(breedingStatus.createdAt),
					updatedAt: new Date(breedingStatus.updatedAt)
				}
			: null;

		const normalizedBreedingSummary = breedingSummary
			? {
					...breedingSummary,
					createdAt: new Date(breedingSummary.createdAt),
					updatedAt: new Date(breedingSummary.updatedAt)
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
