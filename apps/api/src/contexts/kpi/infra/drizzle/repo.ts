import type { AnyD1Database } from "drizzle-orm/d1";
import type { KpiRepoPort } from "../../ports";

export type RawEvent = {
	cattleId: number;
	eventType: string;
	eventDatetime: string;
};

export type TrendPoint = {
	month: string; // YYYY-MM
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
	counts: Record<string, number>;
};

export type TrendDelta = {
	month: string; // YYYY-MM
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
};

function parseMonth(m: string): Date {
	const [y, mo] = m.split("-").map((s) => Number(s));
	return new Date(Date.UTC(y, mo - 1, 1, 0, 0, 0));
}

function monthKey(d: Date): string {
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

function startOfUtcMonth(d: Date): Date {
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
}

function endOfUtcMonth(d: Date): Date {
	return new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59)
	);
}

class DrizzleKpiRepo implements KpiRepoPort {
	constructor(private db: AnyD1Database) {}

	async findEventsForBreedingKpi(
		ownerUserId: number,
		fromIso?: string,
		toIso?: string
	): Promise<RawEvent[]> {
		// 受胎判定と分娩間隔算出のため、期間前後も広めに取得
		// - 受胎: INSEMINATION→CALVING は最大 ~300 日を見る
		// - 分娩間隔: 前回分娩が期間開始より ~400 日以上前になることがあるため、下側は広げる
		const windowFrom =
			fromIso ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
		const windowTo = toIso ?? new Date().toISOString();

		const stmt = this.db
			.prepare(`
        SELECT e.cattleId as cattleId, e.eventType as eventType, e.eventDatetime as eventDatetime
        FROM events e
        JOIN cattle c ON c.cattleId = e.cattleId
        WHERE c.ownerUserId = ?
          AND julianday(e.eventDatetime) >= julianday(?, '-500 days')
          AND julianday(e.eventDatetime) <= julianday(?, '+300 days')
          AND e.eventType IN ('INSEMINATION','CALVING')
        ORDER BY e.cattleId ASC, e.eventDatetime ASC
      `)
			.bind(ownerUserId, windowFrom, windowTo);
		const rows = (await stmt.all<RawEvent>()).results ?? [];
		return rows;
	}

	async getBreedingKpiTrends(
		ownerUserId: number,
		params: { fromMonth?: string; toMonth?: string; months?: number }
	): Promise<{ series: TrendPoint[]; deltas: TrendDelta[] }> {
		const to = params.toMonth
			? parseMonth(params.toMonth)
			: startOfUtcMonth(new Date());
		const months = params.months ?? (params.fromMonth ? undefined : 6);
		const from = params.fromMonth
			? parseMonth(params.fromMonth)
			: startOfUtcMonth(
					new Date(
						Date.UTC(
							to.getUTCFullYear(),
							to.getUTCMonth() - ((months ?? 6) - 1),
							1
						)
					)
				);

		const fromIso = startOfUtcMonth(from).toISOString();
		const toIso = endOfUtcMonth(
			new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1))
		).toISOString();

		const rows = await this.findEventsForBreedingKpi(
			ownerUserId,
			fromIso,
			toIso
		);

		// バケット: cattleIdごと→月別に INSEMINATION / CALVING を仕分け
		const eventsByCattle: Map<number, RawEvent[]> = new Map();
		for (const ev of rows) {
			const arr = eventsByCattle.get(ev.cattleId) ?? [];
			arr.push(ev);
			eventsByCattle.set(ev.cattleId, arr);
		}
		for (const [, list] of eventsByCattle) {
			list.sort((a, b) => a.eventDatetime.localeCompare(b.eventDatetime));
		}

		const monthsList: Date[] = [];
		for (
			let d = new Date(from);
			d <= to;
			d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
		) {
			monthsList.push(new Date(d));
		}

		const round1 = (n: number) => Math.round(n * 10) / 10;

		const series: TrendPoint[] = monthsList.map((mDate) => {
			const mStart = startOfUtcMonth(mDate);
			const mEnd = endOfUtcMonth(mDate);

			let inseminationsInMonth = 0;
			let conceptionsInMonth = 0;
			const daysOpenPairs: number[] = [];
			const calvingIntervals: number[] = [];
			const aiCountsPerConception: number[] = [];

			for (const [, events] of eventsByCattle) {
				const insems = events.filter((e) => e.eventType === "INSEMINATION");
				const calvings = events.filter((e) => e.eventType === "CALVING");

				// 分娩間隔: 後側が当月
				for (let i = 1; i < calvings.length; i++) {
					const later = new Date(calvings[i].eventDatetime);
					if (later >= mStart && later <= mEnd) {
						const prev = new Date(calvings[i - 1].eventDatetime);
						calvingIntervals.push(
							(later.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
						);
					}
				}

				// 期間内AI
				inseminationsInMonth += insems.filter((e) => {
					const d = new Date(e.eventDatetime);
					return d >= mStart && d <= mEnd;
				}).length;

				// 受胎リンク（分娩ごと、採用AIは 260-300 日前）
				for (let i = 0; i < calvings.length; i++) {
					const calv = new Date(calvings[i].eventDatetime);
					let chosen: RawEvent | null = null;
					let aiTrials = 0;
					for (let j = insems.length - 1; j >= 0; j--) {
						const ai = new Date(insems[j].eventDatetime);
						if (ai <= calv) {
							if (!chosen) {
								const diff =
									(calv.getTime() - ai.getTime()) / (1000 * 60 * 60 * 24);
								if (diff >= 260 && diff <= 300) {
									chosen = insems[j];
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

					if (chosen) {
						// 受胎は後側分娩が当月
						if (calv >= mStart && calv <= mEnd) {
							conceptionsInMonth += 1;
							if (aiTrials > 0) aiCountsPerConception.push(aiTrials);
						}

						// days open: 採用AIが当月
						const prevCalv =
							i > 0 ? new Date(calvings[i - 1].eventDatetime) : null;
						if (prevCalv) {
							const chosenAiDate = new Date(chosen.eventDatetime);
							if (chosenAiDate >= mStart && chosenAiDate <= mEnd) {
								const dOpen =
									(chosenAiDate.getTime() - prevCalv.getTime()) /
									(1000 * 60 * 60 * 24);
								daysOpenPairs.push(dOpen);
							}
						}
					}
				}
			}

			const metrics = {
				conceptionRate:
					inseminationsInMonth > 0
						? round1((conceptionsInMonth / inseminationsInMonth) * 100)
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
				inseminations: inseminationsInMonth,
				conceptions: conceptionsInMonth,
				calvings: 0, // not displayed currently in trends card, can be added later
				pairsForDaysOpen: daysOpenPairs.length
			};

			return { month: monthKey(mStart), metrics, counts };
		});

		const deltas: TrendDelta[] = series.map((pt, idx) => {
			if (idx === 0)
				return {
					month: pt.month,
					metrics: {
						conceptionRate: null,
						avgDaysOpen: null,
						avgCalvingInterval: null,
						aiPerConception: null
					}
				};
			const prev = series[idx - 1];
			const diff = (a: number | null, b: number | null) =>
				a != null && b != null ? Math.round((a - b) * 10) / 10 : null;
			return {
				month: pt.month,
				metrics: {
					conceptionRate: diff(
						pt.metrics.conceptionRate,
						prev.metrics.conceptionRate
					),
					avgDaysOpen: diff(pt.metrics.avgDaysOpen, prev.metrics.avgDaysOpen),
					avgCalvingInterval: diff(
						pt.metrics.avgCalvingInterval,
						prev.metrics.avgCalvingInterval
					),
					aiPerConception: diff(
						pt.metrics.aiPerConception,
						prev.metrics.aiPerConception
					)
				}
			};
		});

		return { series, deltas };
	}
}

export function makeKpiRepo(db: AnyD1Database): KpiRepoPort {
	return new DrizzleKpiRepo(db);
}
