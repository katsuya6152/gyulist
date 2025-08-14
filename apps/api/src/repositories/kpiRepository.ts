import type { AnyD1Database } from "drizzle-orm/d1";

export type RawEvent = {
	cattleId: number;
	eventType: string;
	eventDatetime: string;
};

export async function findEventsForBreedingKpi(
	db: AnyD1Database,
	ownerUserId: number,
	fromIso?: string,
	toIso?: string,
): Promise<RawEvent[]> {
	// 受胎判定と分娩間隔算出のため、期間前後も広めに取得
	// - 受胎: INSEMINATION→CALVING は最大 ~300 日を見る
	// - 分娩間隔: 前回分娩が期間開始より ~400 日以上前になることがあるため、下側は広げる
	const windowFrom =
		fromIso ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
	const windowTo = toIso ?? new Date().toISOString();

	const stmt = db
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
