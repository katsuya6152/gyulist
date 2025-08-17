import type { CattleId, UserId } from "../../../../shared/brand";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { BreedingRepoPort } from "../../../breeding/ports";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";
import { createBreedingAggregate } from "../model/breedingAggregate";
import type { BreedingAggregate } from "../model/breedingAggregate";
import type { BreedingStatus } from "../model/breedingStatus";
import type { BreedingSummary } from "../model/breedingSummary";
import type { Cattle } from "../model/cattle";

type Deps = {
	repo: CattleRepoPort;
	clock: ClockPort;
	breedingRepo: BreedingRepoPort;
};

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
		// birthday が変わる場合は年齢派生値を再計算（readonlyを直接代入しない）
		const basePatch = { ...cmd.patch } as Partial<Cattle>;
		let updatesForRepo: Partial<Cattle> = basePatch;
		if (typeof basePatch.birthday === "string") {
			const birth = new Date(basePatch.birthday);
			if (Number.isNaN(birth.getTime())) {
				return err({
					type: "ValidationError",
					message: "Invalid birthday format"
				});
			}
			const now = deps.clock.now();
			const diffMs = now.getTime() - birth.getTime();
			updatesForRepo = {
				...basePatch,
				age: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)),
				monthsOld: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)),
				daysOld: Math.floor(diffMs / (1000 * 60 * 60 * 24))
			};
		}
		const updated = await deps.repo.update(
			cmd.id,
			updatesForRepo as unknown as Partial<
				import("../model/cattle").NewCattleProps
			>
		);

		// breeding updates via breedingRepo (Hex)
		if (cmd.patch.breedingStatus || cmd.patch.breedingSummary) {
			const existing =
				(await deps.breedingRepo.findByCattleId(cmd.id)) ??
				createBreedingAggregate(cmd.id, {
					type: "NotBreeding",
					parity: 0,
					daysAfterCalving: null,
					memo: null
				} as unknown as BreedingStatus);

			let nextStatus: BreedingStatus = existing.currentStatus;
			if (cmd.patch.breedingStatus) {
				const bs = cmd.patch.breedingStatus;
				let pregnancyDays = bs.pregnancyDays ?? null;
				if (pregnancyDays == null && bs.scheduledPregnancyCheckDate) {
					const checkDate = new Date(bs.scheduledPregnancyCheckDate);
					pregnancyDays = Math.floor(
						(deps.clock.now().getTime() - checkDate.getTime()) /
							(1000 * 60 * 60 * 24)
					);
				}
				if (pregnancyDays != null) {
					nextStatus = {
						type: "Pregnant",
						parity: (bs.parity ?? 0) as unknown,
						pregnancyDays: pregnancyDays as unknown,
						expectedCalvingDate: bs.expectedCalvingDate
							? new Date(bs.expectedCalvingDate)
							: new Date(),
						scheduledPregnancyCheckDate: bs.scheduledPregnancyCheckDate
							? new Date(bs.scheduledPregnancyCheckDate)
							: null,
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				} else if (bs.daysAfterInsemination != null) {
					nextStatus = {
						type: "Inseminated",
						parity: (bs.parity ?? 0) as unknown,
						daysAfterInsemination: (bs.daysAfterInsemination ?? 0) as unknown,
						inseminationCount: (bs.inseminationCount ?? 1) as unknown,
						daysOpen: (bs.daysOpen ?? null) as unknown,
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				} else if (bs.daysAfterCalving != null) {
					nextStatus = {
						type: "PostCalving",
						parity: (bs.parity ?? 0) as unknown,
						daysAfterCalving: (bs.daysAfterCalving ?? 0) as unknown,
						isDifficultBirth: Boolean(bs.isDifficultBirth),
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				} else {
					nextStatus = {
						type: "NotBreeding",
						parity: (bs.parity ?? 0) as unknown,
						daysAfterCalving: (bs.daysAfterCalving ?? null) as unknown,
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				}
			}

			let nextSummary: BreedingSummary = existing.summary;
			if (cmd.patch.breedingSummary) {
				const s = cmd.patch.breedingSummary;
				nextSummary = {
					...existing.summary,
					totalInseminationCount: (s.totalInseminationCount ??
						(existing.summary
							.totalInseminationCount as unknown as number)) as unknown,
					averageDaysOpen: (s.averageDaysOpen ??
						(existing.summary.averageDaysOpen as unknown as
							| number
							| null)) as unknown,
					averagePregnancyPeriod: (s.averagePregnancyPeriod ??
						(existing.summary.averagePregnancyPeriod as unknown as
							| number
							| null)) as unknown,
					averageCalvingInterval: (s.averageCalvingInterval ??
						(existing.summary.averageCalvingInterval as unknown as
							| number
							| null)) as unknown,
					difficultBirthCount: (s.difficultBirthCount ??
						(existing.summary
							.difficultBirthCount as unknown as number)) as unknown,
					pregnancyHeadCount: (s.pregnancyHeadCount ??
						(existing.summary
							.pregnancyHeadCount as unknown as number)) as unknown,
					pregnancySuccessRate: (s.pregnancySuccessRate ??
						(existing.summary.pregnancySuccessRate as unknown as
							| number
							| null)) as unknown,
					lastUpdated: deps.clock.now()
				} as unknown as BreedingSummary;
			}

			const aggregate: BreedingAggregate = {
				...existing,
				currentStatus: nextStatus,
				summary: nextSummary,
				lastUpdated: deps.clock.now()
			};
			await deps.breedingRepo.save(aggregate);
		}

		return ok(updated);
	};
