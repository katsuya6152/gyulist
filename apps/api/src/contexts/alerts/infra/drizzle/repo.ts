import type { AnyD1Database } from "drizzle-orm/d1";
import type { AlertsRepoPort, RawAlertRow } from "../../ports";

class DrizzleAlertsRepo implements AlertsRepoPort {
	constructor(private db: AnyD1Database) {}

	async findOpenDaysOver60NoAI(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        WITH last_calving AS (
          SELECT cattleId, MAX(eventDatetime) AS lastCalving
          FROM events
          WHERE eventType = 'CALVING'
          GROUP BY cattleId
        )
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber, lc.lastCalving as dueAt
        FROM cattle c
        JOIN last_calving lc ON lc.cattleId = c.cattleId
        LEFT JOIN breeding_status bs ON bs.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND (c.status IS NULL OR c.status != 'PREGNANT')
          AND (julianday(?) - julianday(lc.lastCalving)) >= 60
          AND NOT EXISTS (
            SELECT 1 FROM events e
            WHERE e.cattleId = c.cattleId
              AND e.eventType = 'INSEMINATION'
              AND julianday(e.eventDatetime) > julianday(lc.lastCalving)
          )
          AND (bs.expectedCalvingDate IS NULL OR julianday(bs.expectedCalvingDate) <= julianday(lc.lastCalving))
      `)
			.bind(ownerUserId, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}

	async findCalvingWithin60(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber,
               bs.expectedCalvingDate as dueAt
        FROM cattle c
        JOIN breeding_status bs ON bs.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND bs.expectedCalvingDate IS NOT NULL
          AND julianday(bs.expectedCalvingDate) >= julianday(?)
          AND julianday(bs.expectedCalvingDate) <= julianday(?, '+60 days')
      `)
			.bind(ownerUserId, nowIso, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}

	async findCalvingOverdue(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber,
               bs.expectedCalvingDate as dueAt
        FROM cattle c
        JOIN breeding_status bs ON bs.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND bs.expectedCalvingDate IS NOT NULL
          AND julianday(bs.expectedCalvingDate) < julianday(?)
          AND (c.status IS NULL OR c.status != 'RESTING')
      `)
			.bind(ownerUserId, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}

	async findEstrusOver20NotPregnant(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        WITH last_estrus AS (
          SELECT cattleId, MAX(eventDatetime) AS lastEstrus
          FROM events
          WHERE eventType = 'ESTRUS'
          GROUP BY cattleId
        )
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber, le.lastEstrus as dueAt
        FROM cattle c
        JOIN last_estrus le ON le.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND (c.status IS NULL OR c.status != 'PREGNANT')
          AND (julianday(?) - julianday(le.lastEstrus)) >= 20
      `)
			.bind(ownerUserId, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}
}

export function makeAlertsRepo(db: AnyD1Database): AlertsRepoPort {
	return new DrizzleAlertsRepo(db);
}
