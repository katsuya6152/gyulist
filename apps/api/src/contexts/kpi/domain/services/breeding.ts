import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../auth/domain/errors";

export type RawEvent = {
	cattleId: number;
	eventType: string;
	eventDatetime: string;
};

import type { KpiRepoPort } from "../../ports";

export type Repo = KpiRepoPort;

export type BreedingKpi = {
	conceptionRate: number | null;
	avgDaysOpen: number | null;
	avgCalvingInterval: number | null;
	aiPerConception: number | null;
};

export const getBreedingKpi =
	(repo: Repo) =>
	async (
		ownerUserId: number,
		fromIso?: string,
		toIso?: string
	): Promise<
		Result<
			{ metrics: BreedingKpi; counts: Record<string, number> },
			DomainError
		>
	> => {
		try {
			const rows = await repo.findEventsForBreedingKpi(
				ownerUserId,
				fromIso,
				toIso
			);
			const byCattle = new Map<number, RawEvent[]>();
			for (const ev of rows) {
				const arr = byCattle.get(ev.cattleId) ?? [];
				arr.push(ev);
				byCattle.set(ev.cattleId, arr);
			}

			const from = fromIso
				? new Date(fromIso)
				: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
			const to = toIso ? new Date(toIso) : new Date();

			let totalInseminationsInPeriod = 0;
			let totalConceptions = 0;
			const daysOpenPairs: number[] = [];
			const calvingIntervals: number[] = [];
			const aiCountsPerConception: number[] = [];

			for (const [, events] of byCattle) {
				const insems = events.filter((e) => e.eventType === "INSEMINATION");
				const calvings = events.filter((e) => e.eventType === "CALVING");
				for (let i = 1; i < calvings.length; i++) {
					const d =
						(new Date(calvings[i].eventDatetime).getTime() -
							new Date(calvings[i - 1].eventDatetime).getTime()) /
						(1000 * 60 * 60 * 24);
					if (
						new Date(calvings[i].eventDatetime) >= from &&
						new Date(calvings[i].eventDatetime) <= to
					) {
						calvingIntervals.push(d);
					}
				}
				totalInseminationsInPeriod += insems.filter((e) => {
					const d = new Date(e.eventDatetime);
					return d >= from && d <= to;
				}).length;
				for (let i = 0; i < calvings.length; i++) {
					const calv = new Date(calvings[i].eventDatetime);
					let chosenInsem: RawEvent | null = null;
					let aiTrials = 0;
					for (let j = insems.length - 1; j >= 0; j--) {
						const ai = new Date(insems[j].eventDatetime);
						if (ai <= calv) {
							if (!chosenInsem) {
								const diff =
									(calv.getTime() - ai.getTime()) / (1000 * 60 * 60 * 24);
								if (diff >= 260 && diff <= 300) {
									chosenInsem = insems[j];
									const prevCalv =
										i > 0 ? new Date(calvings[i - 1].eventDatetime) : null;
									aiTrials = insems.filter((e) => {
										const t = new Date(e.eventDatetime);
										return (!prevCalv || t > prevCalv) && t <= ai;
									}).length;
								}
							}
						}
					}
					if (chosenInsem) {
						if (calv >= from && calv <= to) {
							totalConceptions += 1;
							if (aiTrials > 0) aiCountsPerConception.push(aiTrials);
						}
						const prevCalv =
							i > 0 ? new Date(calvings[i - 1].eventDatetime) : null;
						if (prevCalv) {
							const dOpen =
								(new Date(chosenInsem.eventDatetime).getTime() -
									prevCalv.getTime()) /
								(1000 * 60 * 60 * 24);
							const chosenAiDate = new Date(chosenInsem.eventDatetime);
							if (chosenAiDate >= from && chosenAiDate <= to) {
								daysOpenPairs.push(dOpen);
							}
						}
					}
				}
			}

			const round1 = (n: number) => Math.round(n * 10) / 10;
			const metrics: BreedingKpi = {
				conceptionRate:
					totalInseminationsInPeriod > 0
						? round1((totalConceptions / totalInseminationsInPeriod) * 100)
						: null,
				avgDaysOpen:
					daysOpenPairs.length > 0
						? round1(
								daysOpenPairs.reduce((a, b) => a + b, 0) / daysOpenPairs.length
							)
						: null,
				avgCalvingInterval:
					calvingIntervals.length > 0
						? round1(
								calvingIntervals.reduce((a, b) => a + b, 0) /
									calvingIntervals.length
							)
						: null,
				aiPerConception:
					aiCountsPerConception.length > 0
						? round1(
								aiCountsPerConception.reduce((a, b) => a + b, 0) /
									aiCountsPerConception.length
							)
						: null
			};
			const counts = {
				inseminations: totalInseminationsInPeriod,
				conceptions: totalConceptions,
				calvings: rows.filter(
					(e) =>
						e.eventType === "CALVING" &&
						new Date(e.eventDatetime) >= from &&
						new Date(e.eventDatetime) <= to
				).length,
				pairsForDaysOpen: daysOpenPairs.length
			};
			return ok({ metrics, counts });
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to get breeding KPI",
				cause
			});
		}
	};
