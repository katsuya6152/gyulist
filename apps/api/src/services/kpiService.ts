import type { AnyD1Database } from "drizzle-orm/d1";
import {
	type RawEvent,
	findEventsForBreedingKpi,
} from "../repositories/kpiRepository";

export type BreedingKpi = {
	conceptionRate: number | null;
	avgDaysOpen: number | null;
	avgCalvingInterval: number | null;
	aiPerConception: number | null;
};

export async function getBreedingKpi(
	db: AnyD1Database,
	ownerUserId: number,
	fromIso?: string,
	toIso?: string,
): Promise<{ metrics: BreedingKpi; counts: Record<string, number> }> {
	const rows = await findEventsForBreedingKpi(db, ownerUserId, fromIso, toIso);

	// グループ化: 個体ごとに時系列
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

	// 集計用カウンタ
	let totalInseminationsInPeriod = 0;
	let totalConceptions = 0;
	const daysOpenPairs: number[] = [];
	const calvingIntervals: number[] = [];
	const aiCountsPerConception: number[] = [];

	for (const [, events] of byCattle) {
		// 時系列順に並んでいる前提
		const insems = events.filter((e) => e.eventType === "INSEMINATION");
		const calvings = events.filter((e) => e.eventType === "CALVING");

		// 分娩間隔
		for (let i = 1; i < calvings.length; i++) {
			const d =
				(new Date(calvings[i].eventDatetime).getTime() -
					new Date(calvings[i - 1].eventDatetime).getTime()) /
				(1000 * 60 * 60 * 24);
			// 終了イベント（後側）が期間内なら採用
			if (
				new Date(calvings[i].eventDatetime) >= from &&
				new Date(calvings[i].eventDatetime) <= to
			) {
				calvingIntervals.push(d);
			}
		}

		// 期間内種付け数
		totalInseminationsInPeriod += insems.filter((e) => {
			const d = new Date(e.eventDatetime);
			return d >= from && d <= to;
		}).length;

		// 受胎判定: 分娩ごとに直前のINSEMINATIONを後方探索し 260-300 日の範囲なら採用
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
							// 前回分娩（存在すれば）以降〜採用AIまでのAI回数
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
				// 期間内に分娩が入っていれば受胎としてカウント
				if (calv >= from && calv <= to) {
					totalConceptions += 1;
					if (aiTrials > 0) aiCountsPerConception.push(aiTrials);
				}

				// days open: 前回分娩→この採用AI
				const prevCalv = i > 0 ? new Date(calvings[i - 1].eventDatetime) : null;
				if (prevCalv) {
					const dOpen =
						(new Date(chosenInsem.eventDatetime).getTime() -
							prevCalv.getTime()) /
						(1000 * 60 * 60 * 24);
					// 採用AI（終了側）が期間内に入っていれば採用（分娩基準でも可だが一貫させる）
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
						daysOpenPairs.reduce((a, b) => a + b, 0) / daysOpenPairs.length,
					)
				: null,
		avgCalvingInterval:
			calvingIntervals.length > 0
				? round1(
						calvingIntervals.reduce((a, b) => a + b, 0) /
							calvingIntervals.length,
					)
				: null,
		aiPerConception:
			aiCountsPerConception.length > 0
				? round1(
						aiCountsPerConception.reduce((a, b) => a + b, 0) /
							aiCountsPerConception.length,
					)
				: null,
	};

	const counts = {
		inseminations: totalInseminationsInPeriod,
		conceptions: totalConceptions,
		calvings: rows.filter(
			(e) =>
				e.eventType === "CALVING" &&
				new Date(e.eventDatetime) >= from &&
				new Date(e.eventDatetime) <= to,
		).length,
		pairsForDaysOpen: daysOpenPairs.length,
	};

	return { metrics, counts };
}
