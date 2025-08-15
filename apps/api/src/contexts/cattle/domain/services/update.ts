import type { CattleId, UserId } from "../../../../shared/brand";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";
import type { Cattle } from "../model/cattle";

type Deps = { repo: CattleRepoPort; clock: ClockPort };

export type UpdateCattleCmd = {
	requesterUserId: UserId;
	id: CattleId;
	patch: Partial<
		Pick<
			Cattle,
			| "name"
			| "gender"
			| "birthday"
			| "growthStage"
			| "breed"
			| "status"
			| "producerName"
			| "barn"
			| "breedingValue"
			| "notes"
		>
	> & {
		breedingStatus?: {
			parity?: number | null;
			expectedCalvingDate?: string | null;
			scheduledPregnancyCheckDate?: string | null;
			daysAfterCalving?: number | null;
			daysOpen?: number | null;
			pregnancyDays?: number | null;
			daysAfterInsemination?: number | null;
			inseminationCount?: number | null;
			breedingMemo?: string | null;
			isDifficultBirth?: boolean | null;
		};
		breedingSummary?: {
			totalInseminationCount?: number | null;
			averageDaysOpen?: number | null;
			averagePregnancyPeriod?: number | null;
			averageCalvingInterval?: number | null;
			difficultBirthCount?: number | null;
			pregnancyHeadCount?: number | null;
			pregnancySuccessRate?: number | null;
		};
	};
};

export const update =
	(deps: Deps) =>
	async (cmd: UpdateCattleCmd): Promise<Result<Cattle, DomainError>> => {
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
		// birthday が変わる場合は年齢派生値を再計算
		const patch = { ...cmd.patch } as Partial<Cattle>;
		if (typeof patch.birthday === "string") {
			const birth = new Date(patch.birthday);
			if (Number.isNaN(birth.getTime())) {
				return err({
					type: "ValidationError",
					message: "Invalid birthday format"
				});
			}
			const now = deps.clock.now();
			const diffMs = now.getTime() - birth.getTime();
			patch.age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
			patch.monthsOld = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
			patch.daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		}
		const updated = await deps.repo.update(cmd.id, {
			...patch,
			updatedAt: deps.clock.now().toISOString()
		});
		// breeding upserts when provided
		if (cmd.patch.breedingStatus) {
			const bs = cmd.patch.breedingStatus;
			// pregnancyDays は scheduledPregnancyCheckDate に基づき自動補完（既存契約踏襲）
			let pregnancyDays: number | null | undefined = bs.pregnancyDays;
			if (pregnancyDays == null && bs.scheduledPregnancyCheckDate) {
				const checkDate = new Date(bs.scheduledPregnancyCheckDate);
				pregnancyDays = Math.floor(
					(deps.clock.now().getTime() - checkDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
			}
			await deps.repo.upsertBreedingStatus(cmd.id, {
				...bs,
				pregnancyDays: pregnancyDays ?? null
			});
		}
		if (cmd.patch.breedingSummary) {
			await deps.repo.upsertBreedingSummary(cmd.id, cmd.patch.breedingSummary);
		}
		return ok(updated);
	};
