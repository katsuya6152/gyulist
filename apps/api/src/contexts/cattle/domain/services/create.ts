import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { NewCattleInput } from "../codecs/input";
import type { DomainError } from "../errors";
import type { Cattle } from "../model/cattle";
import { createCattle } from "../model/cattle";

type Deps = { repo: CattleRepoPort; clock: ClockPort };

export type CreateCattleCmd = NewCattleInput;

export const create =
	(deps: Deps) =>
	async (cmd: CreateCattleCmd): Promise<Result<Cattle, DomainError>> => {
		const draft = createCattle({
			cattleId: 0 as unknown as Cattle["cattleId"],
			ownerUserId: cmd.ownerUserId as unknown as Cattle["ownerUserId"],
			identificationNumber:
				cmd.identificationNumber as Cattle["identificationNumber"],
			earTagNumber: (cmd.earTagNumber ?? null) as Cattle["earTagNumber"],
			name: (cmd.name ?? null) as Cattle["name"],
			gender: (cmd.gender ?? null) as Cattle["gender"],
			birthday: (cmd.birthday ?? null) as Cattle["birthday"],
			growthStage: (cmd.growthStage ?? null) as Cattle["growthStage"],
			breed: (cmd.breed ?? null) as Cattle["breed"],
			status: (cmd.status ?? "HEALTHY") as Cattle["status"],
			producerName: (cmd.producerName ?? null) as Cattle["producerName"],
			barn: (cmd.barn ?? null) as Cattle["barn"],
			breedingValue: (cmd.breedingValue ?? null) as Cattle["breedingValue"],
			notes: (cmd.notes ?? null) as Cattle["notes"]
		});

		if (!draft.ok) return draft;

		// Overwrite timestamps with ClockPort to avoid Date.now in tests when needed
		const nowIso = deps.clock.now().toISOString();
		const ready: Cattle = {
			...draft.value,
			createdAt: nowIso,
			updatedAt: nowIso
		};

		const created = await deps.repo.create(ready);

		// Optional breeding status upsert to preserve existing side-effects
		// Derive simple defaults mirroring legacy service behavior
		const bs = (
			cmd as unknown as {
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
			}
		).breedingStatus;
		if (bs) {
			let parity: number | null | undefined = bs.parity ?? null;
			// parity: rough estimation from birthday (years - 2, min 0)
			const birthIso = created.birthday ?? cmd.birthday ?? null;
			if (parity == null && birthIso) {
				const birth = new Date(birthIso);
				if (!Number.isNaN(birth.getTime())) {
					const years = Math.floor(
						(deps.clock.now().getTime() - birth.getTime()) /
							(1000 * 60 * 60 * 24 * 365)
					);
					parity = Math.max(0, years - 2);
				}
			}
			let pregnancyDays: number | null | undefined = bs.pregnancyDays;
			if (pregnancyDays == null && bs.scheduledPregnancyCheckDate) {
				const checkDate = new Date(bs.scheduledPregnancyCheckDate);
				if (!Number.isNaN(checkDate.getTime())) {
					pregnancyDays = Math.floor(
						(deps.clock.now().getTime() - checkDate.getTime()) /
							(1000 * 60 * 60 * 24)
					);
				}
			}
			await deps.repo.upsertBreedingStatus(created.cattleId, {
				...bs,
				parity: parity ?? null,
				pregnancyDays: pregnancyDays ?? null
			});
		}

		return ok(created);
	};
