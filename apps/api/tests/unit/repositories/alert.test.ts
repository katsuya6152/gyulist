import type { AnyD1Database } from "drizzle-orm/d1";
import { describe, expect, it } from "vitest";
import type { RawAlertRow } from "../../../src/repositories/alertRepository";
import {
	findCalvingOverdue,
	findCalvingWithin60,
	findEstrusOver20NotPregnant,
	findOpenDaysOver60NoAI,
} from "../../../src/repositories/alertRepository";

type Cattle = {
	cattleId: number;
	ownerUserId: number;
	name: string | null;
	earTagNumber: number | null;
	status: string | null;
};

type Event = {
	cattleId: number;
	eventType: string;
	eventDatetime: string;
};

type BreedingStatus = {
	cattleId: number;
	expectedCalvingDate: string | null;
};

class FakeStmt {
	private sql: string;
	private db: FakeDB;
	private args: unknown[] = [];
	constructor(db: FakeDB, sql: string) {
		this.db = db;
		this.sql = sql;
	}
	bind(...args: unknown[]) {
		this.args = args;
		return this;
	}
	async all<T>() {
		const results = this.db.execQuery(this.sql, this.args);
		return { results: results as unknown as T[] };
	}
}

class FakeDB implements AnyD1Database {
	// minimal AnyD1Database shape
	prepare: (query: string) => FakeStmt;
	private cattle: Cattle[];
	private events: Event[];
	private breeding: BreedingStatus[];
	constructor(cattle: Cattle[], events: Event[], breeding: BreedingStatus[]) {
		this.cattle = cattle;
		this.events = events;
		this.breeding = breeding;
		this.prepare = (q: string) => new FakeStmt(this, q);
	}

	execQuery(sql: string, args: unknown[]): RawAlertRow[] {
		if (sql.includes("WITH last_calving")) {
			const [ownerUserId, nowIso] = args as [number, string];
			const now = new Date(nowIso);
			const lastCalvingMap = new Map<number, string>();
			for (const e of this.events.filter((e) => e.eventType === "CALVING")) {
				const prev = lastCalvingMap.get(e.cattleId);
				if (!prev || new Date(e.eventDatetime) > new Date(prev)) {
					lastCalvingMap.set(e.cattleId, e.eventDatetime);
				}
			}
			const results: RawAlertRow[] = [];
			for (const c of this.cattle.filter(
				(c) => c.ownerUserId === ownerUserId,
			)) {
				const lastCalving = lastCalvingMap.get(c.cattleId);
				if (!lastCalving) continue;
				if (c.status === "PREGNANT") continue;
				// Exclude if breeding expectedCalvingDate exists and is after lastCalving
				const bs = this.breeding.find((b) => b.cattleId === c.cattleId);
				if (
					bs?.expectedCalvingDate &&
					new Date(bs.expectedCalvingDate) > new Date(lastCalving)
				) {
					continue;
				}
				const days =
					(now.getTime() - new Date(lastCalving).getTime()) /
					(1000 * 60 * 60 * 24);
				if (days < 60) continue;
				const hasInseminationAfter = this.events.some(
					(e) =>
						e.cattleId === c.cattleId &&
						e.eventType === "INSEMINATION" &&
						new Date(e.eventDatetime) > new Date(lastCalving),
				);
				if (hasInseminationAfter) continue;
				results.push({
					cattleId: c.cattleId,
					cattleName: c.name,
					cattleEarTagNumber: c.earTagNumber?.toString() ?? null,
					dueAt: lastCalving,
				});
			}
			return results;
		}

		if (sql.includes("JOIN breeding_status") && sql.includes("+60 days")) {
			const [ownerUserId, nowIso] = args as [number, string];
			const now = new Date(nowIso);
			const limit = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
			const results: RawAlertRow[] = [];
			for (const bs of this.breeding) {
				if (!bs.expectedCalvingDate) continue;
				const c = this.cattle.find(
					(x) => x.cattleId === bs.cattleId && x.ownerUserId === ownerUserId,
				);
				if (!c) continue;
				const date = new Date(bs.expectedCalvingDate);
				if (date >= now && date <= limit) {
					results.push({
						cattleId: c.cattleId,
						cattleName: c.name,
						cattleEarTagNumber: c.earTagNumber?.toString() ?? null,
						dueAt: bs.expectedCalvingDate,
					});
				}
			}
			return results;
		}

		if (
			sql.includes("JOIN breeding_status") &&
			sql.includes("< julianday(?)")
		) {
			const [ownerUserId, nowIso] = args as [number, string];
			const now = new Date(nowIso);
			const results: RawAlertRow[] = [];
			for (const bs of this.breeding) {
				if (!bs.expectedCalvingDate) continue;
				const c = this.cattle.find(
					(x) => x.cattleId === bs.cattleId && x.ownerUserId === ownerUserId,
				);
				if (!c) continue;
				if (c.status === "RESTING") continue;
				const date = new Date(bs.expectedCalvingDate);
				if (date < now) {
					results.push({
						cattleId: c.cattleId,
						cattleName: c.name,
						cattleEarTagNumber: c.earTagNumber?.toString() ?? null,
						dueAt: bs.expectedCalvingDate,
					});
				}
			}
			return results;
		}

		if (sql.includes("WITH last_estrus")) {
			const [ownerUserId, nowIso] = args as [number, string];
			const now = new Date(nowIso);
			const lastEstrusMap = new Map<number, string>();
			for (const e of this.events.filter((e) => e.eventType === "ESTRUS")) {
				const prev = lastEstrusMap.get(e.cattleId);
				if (!prev || new Date(e.eventDatetime) > new Date(prev)) {
					lastEstrusMap.set(e.cattleId, e.eventDatetime);
				}
			}
			const results: RawAlertRow[] = [];
			for (const c of this.cattle.filter(
				(c) => c.ownerUserId === ownerUserId,
			)) {
				if (c.status === "PREGNANT") continue;
				const last = lastEstrusMap.get(c.cattleId);
				if (!last) continue;
				const days =
					(now.getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
				if (days >= 20) {
					results.push({
						cattleId: c.cattleId,
						cattleName: c.name,
						cattleEarTagNumber: c.earTagNumber?.toString() ?? null,
						dueAt: last,
					});
				}
			}
			return results;
		}

		return [];
	}
}

describe("alertRepository logic extraction with mock data", () => {
	const owner = 1;
	const nowIso = "2024-12-10T00:00:00Z";

	const cattle: Cattle[] = [
		{
			cattleId: 1,
			ownerUserId: owner,
			name: "A",
			earTagNumber: 111,
			status: "HEALTHY",
		},
		{
			cattleId: 2,
			ownerUserId: owner,
			name: "B",
			earTagNumber: 222,
			status: "PREGNANT",
		},
		{
			cattleId: 3,
			ownerUserId: owner,
			name: "C",
			earTagNumber: 333,
			status: "RESTING",
		},
		{
			cattleId: 4,
			ownerUserId: owner,
			name: "D",
			earTagNumber: 444,
			status: "HEALTHY",
		},
	];

	const events: Event[] = [
		// Calving for cow1 70 days before now
		{
			cattleId: 1,
			eventType: "CALVING",
			eventDatetime: "2024-10-01T00:00:00Z",
		},
		// Insemination for cow1 BEFORE calving (should not exclude)
		{
			cattleId: 1,
			eventType: "INSEMINATION",
			eventDatetime: "2024-09-01T00:00:00Z",
		},
		// Estrus for cow1 25 days before now
		{ cattleId: 1, eventType: "ESTRUS", eventDatetime: "2024-11-15T00:00:00Z" },

		// Cow2 pregnant, estrus should be ignored
		{ cattleId: 2, eventType: "ESTRUS", eventDatetime: "2024-11-01T00:00:00Z" },

		// Cow4 overdue calving
		{
			cattleId: 4,
			eventType: "CALVING",
			eventDatetime: "2024-01-01T00:00:00Z",
		},
	];

	const breeding: BreedingStatus[] = [
		{ cattleId: 2, expectedCalvingDate: "2025-03-01T00:00:00Z" }, // within 60d if now is 2025-01-10 (not our now)
		{ cattleId: 3, expectedCalvingDate: "2024-12-01T00:00:00Z" }, // overdue but RESTING
		{ cattleId: 4, expectedCalvingDate: "2024-10-15T00:00:00Z" }, // before last calving -> ignore in open-days, but overdue overall
	];

	const db = new FakeDB(cattle, events, breeding) as unknown as AnyD1Database;

	it("openDaysOver60NoAI extracts cow1", async () => {
		const rows = await findOpenDaysOver60NoAI(db, owner, nowIso);
		expect(rows.map((r) => r.cattleId)).toEqual([1]);
	});

	it("calvingWithin60 extracts none for nowIso 2024-12-10", async () => {
		const rows = await findCalvingWithin60(db, owner, nowIso);
		expect(rows.length).toBe(0);
	});

	it("calvingOverdue extracts cow4 and excludes RESTING cow3", async () => {
		const rows = await findCalvingOverdue(db, owner, nowIso);
		expect(rows.map((r) => r.cattleId)).toEqual([4]);
	});

	it("estrusOver20NotPregnant extracts cow1 only", async () => {
		const rows = await findEstrusOver20NotPregnant(db, owner, nowIso);
		expect(rows.map((r) => r.cattleId)).toEqual([1]);
	});
});
