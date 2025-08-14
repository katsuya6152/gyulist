import type { AnyD1Database } from "drizzle-orm/d1";
import {
	events,
	bloodline,
	breedingStatus,
	breedingSummary,
	cattle,
	cattleStatusHistory,
	motherInfo,
	users,
} from "../../../src/db/schema";

type CattleRow = typeof cattle.$inferSelect;
type BloodlineRow = typeof bloodline.$inferSelect;
type MotherInfoRow = typeof motherInfo.$inferSelect;
type BreedingStatusRow = typeof breedingStatus.$inferSelect;
type BreedingSummaryRow = typeof breedingSummary.$inferSelect;
type EventRow = typeof events.$inferSelect;
type StatusHistoryRow = typeof cattleStatusHistory.$inferInsert;
type UserRow = typeof users.$inferSelect;

export type FakeStore = {
	cattle: CattleRow[];
	bloodline: BloodlineRow[];
	motherInfo: MotherInfoRow[];
	breedingStatus: BreedingStatusRow[];
	breedingSummary: BreedingSummaryRow[];
	events: EventRow[];
	statusHistory: StatusHistoryRow[];
	users?: UserRow[];
	// E2E: repositories using db.prepare need additional collections
	registrations?: Array<{
		id: string;
		email: string;
		referralSource: string | null;
		status: string;
		locale: string;
		createdAt: number;
		updatedAt: number;
	}>;
	emailLogs?: Array<{
		id: string;
		email: string;
		type: string;
		httpStatus?: number;
		resendId?: string | null;
		error?: string | null;
		createdAt: number;
	}>;
};

export function createEmptyStore(): FakeStore {
	return {
		cattle: [],
		bloodline: [],
		motherInfo: [],
		breedingStatus: [],
		breedingSummary: [],
		events: [],
		statusHistory: [],
		users: [],
		registrations: [],
		emailLogs: [],
	};
}

function isTable(target: unknown, table: unknown) {
	return target === table;
}

export function createFakeDrizzle(store: FakeStore) {
	// Minimal chainable API used by current repositories
	return {
		select(_columns?: unknown) {
			const api: Record<string, unknown> = {};
			let fromTable: unknown;
			const selectedColumns: unknown = _columns;
			let joinedTable: unknown = undefined;
			api.from = (tbl: unknown) => {
				fromTable = tbl;
				return api;
			};
			api.leftJoin = (_tbl: unknown, _on: unknown) => api;
			api.innerJoin = (tbl: unknown, _on: unknown) => {
				joinedTable = tbl;
				return api;
			};
			api.where = () => {
				// findCattleById path: when columns is an object shape selecting multiple tables
				if (
					fromTable &&
					isTable(fromTable, cattle) &&
					selectedColumns &&
					typeof selectedColumns === "object"
				) {
					const rows = store.cattle.map((c) => ({
						cattle: c,
						bloodline:
							store.bloodline.find((b) => b.cattleId === c.cattleId) ?? null,
						motherInfo:
							store.motherInfo.find((m) => m.cattleId === c.cattleId) ?? null,
						breedingStatus:
							store.breedingStatus.find((s) => s.cattleId === c.cattleId) ??
							null,
						breedingSummary:
							store.breedingSummary.find((s) => s.cattleId === c.cattleId) ??
							null,
						events: store.events.find((e) => e.cattleId === c.cattleId) ?? null,
					}));
					// provide groupBy for count queries
					const groupable: Record<string, unknown> = rows as unknown as Record<
						string,
						unknown
					>;
					(groupable as { groupBy: (_: unknown) => unknown[] }).groupBy =
						() => {
							const counts: Record<string, number> = {};
							for (const c of store.cattle) {
								const key = (c.status ?? "null") as string;
								counts[key] = (counts[key] ?? 0) + 1;
							}
							return Object.entries(counts).map(([status, count]) => ({
								status,
								count,
							}));
						};
					return groupable as unknown;
				}
				// events repository paths using innerJoin
				if (
					fromTable &&
					isTable(fromTable, events) &&
					joinedTable &&
					isTable(joinedTable, cattle) &&
					selectedColumns &&
					typeof selectedColumns === "object"
				) {
					// Map events joined with cattle
					let mapped = store.events
						.slice()
						.sort(
							(a, b) =>
								new Date(b.eventDatetime).getTime() -
								new Date(a.eventDatetime).getTime(),
						)
						.map((ev) => {
							const cat = store.cattle.find((c) => c.cattleId === ev.cattleId);
							return {
								eventId: ev.eventId,
								cattleId: ev.cattleId,
								eventType: ev.eventType,
								eventDatetime: ev.eventDatetime,
								notes: ev.notes ?? null,
								createdAt: ev.createdAt,
								updatedAt: ev.updatedAt,
								cattleName: cat?.name ?? null,
								cattleEarTagNumber:
									(cat?.earTagNumber as unknown as number) ?? null,
							} as Record<string, unknown>;
						});
					// for getEventsByCattleId path, ensure we only return rows for that cattleId if possible
					// heuristic: when only one cattle exists in store, this already holds; otherwise filter to existing first cattleId
					if (store.cattle.length > 0) {
						const cid = store.cattle[0]?.cattleId;
						if (cid) {
							mapped = mapped.filter(
								(r) => (r as { cattleId: number }).cattleId === cid,
							);
						}
					}
					const joinChain: Record<string, unknown> = {} as unknown as Record<
						string,
						unknown
					>;
					// orderBy returns the final array but with a .limit method attached for the search path
					(joinChain as { orderBy: (_: unknown) => unknown }).orderBy = () => {
						(
							mapped as unknown as { limit: (n: number) => Promise<unknown> }
						).limit = async (n: number) =>
							typeof n === "number"
								? (mapped.slice(0, n) as unknown)
								: (mapped as unknown);
						return mapped as unknown;
					};
					(joinChain as { limit: (n: number) => Promise<unknown> }).limit =
						async (n: number) =>
							typeof n === "number"
								? (mapped.slice(0, n) as unknown)
								: (mapped as unknown);
					return joinChain as unknown;
				}
				// generic select path: return an array enhanced with chain methods
				const listForTable = isTable(fromTable, cattle)
					? [...store.cattle]
					: isTable(fromTable, bloodline)
						? [...store.bloodline]
						: isTable(fromTable, breedingStatus)
							? [...store.breedingStatus]
							: isTable(fromTable, breedingSummary)
								? [...store.breedingSummary]
								: isTable(fromTable, events)
									? [...store.events]
									: isTable(fromTable, motherInfo)
										? [...store.motherInfo]
										: isTable(fromTable, users)
											? [...(store.users ?? [])]
											: [];
				const chain: Record<string, unknown> =
					listForTable as unknown as Record<string, unknown>;
				(chain as { orderBy: () => unknown }).orderBy = () => chain;
				// naive cursor pagination simulation for cattle list: return a window that advances by (n-1) each call
				(chain as { limit: (n: number) => Promise<unknown> }).limit = async (
					n: number,
				) => {
					if (isTable(fromTable, cattle) && typeof n === "number") {
						// module-scoped offset
						const window = getCattleWindow(store.cattle, n);
						return window as unknown;
					}
					return typeof n === "number"
						? (listForTable.slice(0, n) as unknown)
						: (listForTable as unknown);
				};
				(chain as { groupBy?: (_: unknown) => unknown[] }).groupBy = (
					_grp: unknown,
				) => {
					// simple groupBy for cattle.status counts
					if (isTable(fromTable, cattle)) {
						const counts: Record<string, number> = {};
						for (const c of store.cattle) {
							const key = (c.status ?? "null") as string;
							counts[key] = (counts[key] ?? 0) + 1;
						}
						return Object.entries(counts).map(([status, count]) => ({
							status,
							count,
						}));
					}
					return [] as unknown[];
				};
				return chain as unknown;
			};
			api.orderBy = () => api;
			api.limit = async (n: number) => {
				const list = isTable(fromTable, cattle)
					? [...store.cattle]
					: isTable(fromTable, bloodline)
						? [...store.bloodline]
						: isTable(fromTable, breedingStatus)
							? [...store.breedingStatus]
							: isTable(fromTable, breedingSummary)
								? [...store.breedingSummary]
								: isTable(fromTable, events)
									? [...store.events]
									: isTable(fromTable, motherInfo)
										? [...store.motherInfo]
										: [];
				if (isTable(fromTable, cattle) && typeof n === "number") {
					const window = getCattleWindow(
						list as unknown as FakeStore["cattle"],
						n,
					);
					return window as unknown;
				}
				return typeof n === "number"
					? (list.slice(0, n) as unknown)
					: (list as unknown);
			};
			return api;
		},
		insert(tbl: unknown) {
			return {
				values: (val: unknown) => {
					return {
						returning: async () => {
							if (isTable(tbl, cattle)) {
								const nextId = (store.cattle.at(-1)?.cattleId ?? 0) + 1;
								const row = {
									...(val as object),
									cattleId: nextId,
								} as CattleRow;
								store.cattle.push(row);
								return [row];
							}
							if (isTable(tbl, bloodline)) {
								const row = { ...(val as object) } as BloodlineRow;
								store.bloodline.push(row);
								return [row];
							}
							if (isTable(tbl, breedingStatus)) {
								const row = { ...(val as object) } as BreedingStatusRow;
								store.breedingStatus.push(row);
								return [row];
							}
							if (isTable(tbl, breedingSummary)) {
								const row = { ...(val as object) } as BreedingSummaryRow;
								store.breedingSummary.push(row);
								return [row];
							}
							if (isTable(tbl, events)) {
								const nextId = (store.events.at(-1)?.eventId ?? 0) + 1;
								const row = { ...(val as object), eventId: nextId } as EventRow;
								store.events.push(row);
								return [row];
							}
							if (isTable(tbl, users)) {
								const nextId = ((store.users ?? []).at(-1)?.id ?? 0) + 1;
								const row = {
									id: nextId,
									...(val as object),
								} as unknown as UserRow;
								if (!store.users) {
									store.users = [];
								}
								store.users.push(row);
								return [row as unknown as Record<string, unknown>];
							}
							if (isTable(tbl, cattleStatusHistory)) {
								const row = { ...(val as object) } as StatusHistoryRow;
								store.statusHistory.push(row);
								return [row];
							}
							return [{}];
						},
					};
				},
			};
		},
		update(tbl: unknown) {
			return {
				set: (val: unknown) => {
					return {
						where: () => {
							return {
								returning: async () => {
									if (isTable(tbl, cattle)) {
										const current = store.cattle[0];
										if (current) {
											const updated = {
												...current,
												...(val as object),
											} as CattleRow;
											store.cattle[0] = updated;
											return [updated];
										}
									}
									if (isTable(tbl, breedingStatus)) {
										if (store.breedingStatus[0]) {
											store.breedingStatus[0] = {
												...store.breedingStatus[0],
												...(val as object),
											} as BreedingStatusRow;
											return [store.breedingStatus[0]];
										}
									}
									if (isTable(tbl, breedingSummary)) {
										if (store.breedingSummary[0]) {
											store.breedingSummary[0] = {
												...store.breedingSummary[0],
												...(val as object),
											} as BreedingSummaryRow;
											return [store.breedingSummary[0]];
										}
									}
									if (isTable(tbl, bloodline)) {
										if (store.bloodline[0]) {
											store.bloodline[0] = {
												...store.bloodline[0],
												...(val as object),
											} as BloodlineRow;
											return [store.bloodline[0]];
										}
									}
									if (isTable(tbl, users)) {
										if (store.users?.[0]) {
											store.users[0] = {
												...store.users[0],
												...(val as object),
											} as UserRow;
											return [
												store.users[0] as unknown as Record<string, unknown>,
											];
										}
									}
									return [{}];
								},
							};
						},
					};
				},
			};
		},
		delete(tbl: unknown) {
			return {
				where: async () => {
					if (isTable(tbl, cattle)) {
						store.cattle.shift();
					}
					if (isTable(tbl, events)) {
						store.events = [];
					}
					if (isTable(tbl, bloodline)) {
						store.bloodline = [];
					}
					if (isTable(tbl, breedingStatus)) {
						store.breedingStatus = [] as BreedingStatusRow[];
					}
					if (isTable(tbl, breedingSummary)) {
						store.breedingSummary = [] as BreedingSummaryRow[];
					}
					if (isTable(tbl, motherInfo)) {
						store.motherInfo = [] as MotherInfoRow[];
					}
				},
			};
		},
	} satisfies Record<string, unknown>;
}

// Helper to create a test app env DB binding with minimal D1 prepare support
export function createFakeD1(store?: FakeStore): AnyD1Database {
	const db: Record<string, unknown> = {};
	(
		db as {
			prepare: (sql: string) => {
				bind: (...args: unknown[]) => unknown;
				all: () => Promise<{ results: unknown[] }>;
				first: () => Promise<unknown | null>;
				run: () => Promise<{ success: boolean }>;
			};
		}
	).prepare = (sql: string) => {
		const statement = {
			_sql: sql,
			_binds: [] as unknown[],
			bind(...args: unknown[]) {
				this._binds = args;
				return this;
			},
			async all() {
				// registrations list query
				if (sql.includes("FROM registrations") && sql.includes("ORDER BY")) {
					const limit = Number(this._binds[this._binds.length - 2]);
					const offset = Number(this._binds[this._binds.length - 1]);
					const regs = (store?.registrations ?? []).slice();
					// crude LIKE filter support when present
					// (we ignore other filters for simplicity in tests unless provided)
					return { results: regs.slice(offset, offset + limit) as unknown[] };
				}
				// registrations total count query
				if (sql.includes("SELECT COUNT(*) as count FROM registrations")) {
					const total = (store?.registrations ?? []).length;
					return { results: [{ count: total }] as unknown[] };
				}
				// KPI events window query
				if (
					sql.includes("FROM events e") &&
					sql.includes("JOIN cattle c") &&
					sql.includes("eventType IN ('INSEMINATION','CALVING')")
				) {
					const ownerUserId = Number(this._binds[0]);
					const windowFrom = new Date(String(this._binds[1]));
					const windowTo = new Date(String(this._binds[2]));
					const rows = (store?.events ?? [])
						.filter((e) =>
							(store?.cattle ?? []).some(
								(c) =>
									c.cattleId === e.cattleId && c.ownerUserId === ownerUserId,
							),
						)
						.filter(
							(e) =>
								e.eventType === "INSEMINATION" || e.eventType === "CALVING",
						)
						.filter((e) => {
							const t = new Date(e.eventDatetime);
							// emulate julianday(e) between from-500 and to+300
							const lower = new Date(
								windowFrom.getTime() - 500 * 24 * 60 * 60 * 1000,
							);
							const upper = new Date(
								windowTo.getTime() + 300 * 24 * 60 * 60 * 1000,
							);
							return t >= lower && t <= upper;
						})
						.sort(
							(a, b) =>
								a.cattleId - b.cattleId ||
								new Date(a.eventDatetime).getTime() -
									new Date(b.eventDatetime).getTime(),
						)
						.map((e) => ({
							cattleId: e.cattleId,
							eventType: e.eventType,
							eventDatetime: e.eventDatetime,
						})) as unknown[];
					return { results: rows };
				}
				// Alerts queries
				if (sql.includes("WITH last_calving")) {
					// open days over 60 no AI
					const ownerUserId = Number(this._binds[0]);
					const nowIso = String(this._binds[1]);
					const now = new Date(nowIso);
					const results = (store?.cattle ?? [])
						.filter(
							(c) => c.ownerUserId === ownerUserId && c.status !== "PREGNANT",
						)
						.map((c) => {
							const lastCalving = (store?.events ?? [])
								.filter(
									(e) => e.cattleId === c.cattleId && e.eventType === "CALVING",
								)
								.map((e) => new Date(e.eventDatetime))
								.sort((a, b) => b.getTime() - a.getTime())[0];
							if (!lastCalving) return null;
							const days =
								(now.getTime() - lastCalving.getTime()) / (1000 * 60 * 60 * 24);
							const hasAiAfter = (store?.events ?? []).some(
								(e) =>
									e.cattleId === c.cattleId &&
									e.eventType === "INSEMINATION" &&
									new Date(e.eventDatetime) > lastCalving,
							);
							const bs = (store?.breedingStatus ?? []).find(
								(s) => s.cattleId === c.cattleId,
							);
							const okBs =
								!bs?.expectedCalvingDate ||
								new Date(bs.expectedCalvingDate) <= lastCalving;
							if (days >= 60 && !hasAiAfter && okBs) {
								return {
									cattleId: c.cattleId,
									cattleName: c.name ?? null,
									cattleEarTagNumber: String(c.earTagNumber ?? ""),
									dueAt: lastCalving.toISOString(),
								} as unknown;
							}
							return null;
						})
						.filter(Boolean) as unknown[];
					return { results };
				}
				if (
					sql.includes("JOIN breeding_status bs") &&
					sql.includes("expectedCalvingDate") &&
					sql.includes("<= julianday(?, '+60 days')")
				) {
					// calving within 60
					const ownerUserId = Number(this._binds[0]);
					const nowIso = String(this._binds[1]);
					const now = new Date(nowIso);
					const upper = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
					const results = (store?.breedingStatus ?? [])
						.filter(
							(bs) =>
								bs.expectedCalvingDate &&
								(store?.cattle ?? []).some(
									(c) =>
										c.cattleId === bs.cattleId && c.ownerUserId === ownerUserId,
								),
						)
						.filter((bs) => {
							const d = new Date(String(bs.expectedCalvingDate));
							return d >= now && d <= upper;
						})
						.map((bs) => {
							const c = (store?.cattle ?? []).find(
								(x) => x.cattleId === bs.cattleId,
							);
							if (!c) return null as unknown;
							return {
								cattleId: c.cattleId,
								cattleName: c.name ?? null,
								cattleEarTagNumber: String(c.earTagNumber ?? ""),
								dueAt: bs.expectedCalvingDate,
							} as unknown;
						})
						.filter(Boolean) as unknown[];
					return { results };
				}
				if (
					sql.includes("JOIN breeding_status bs") &&
					sql.includes("expectedCalvingDate") &&
					sql.includes("< julianday(?))")
				) {
					// calving overdue
					const ownerUserId = Number(this._binds[0]);
					const nowIso = String(this._binds[1]);
					const now = new Date(nowIso);
					const results = (store?.breedingStatus ?? [])
						.filter(
							(bs) =>
								bs.expectedCalvingDate &&
								(store?.cattle ?? []).some(
									(c) =>
										c.cattleId === bs.cattleId &&
										c.ownerUserId === ownerUserId &&
										c.status !== "RESTING",
								),
						)
						.filter((bs) => new Date(String(bs.expectedCalvingDate)) < now)
						.map((bs) => {
							const c = (store?.cattle ?? []).find(
								(x) => x.cattleId === bs.cattleId,
							);
							if (!c) return null as unknown;
							return {
								cattleId: c.cattleId,
								cattleName: c.name ?? null,
								cattleEarTagNumber: String(c.earTagNumber ?? ""),
								dueAt: bs.expectedCalvingDate,
							} as unknown;
						})
						.filter(Boolean) as unknown[];
					return { results };
				}
				if (sql.includes("WITH last_estrus")) {
					// estrus over 20 not pregnant
					const ownerUserId = Number(this._binds[0]);
					const nowIso = String(this._binds[1]);
					const now = new Date(nowIso);
					const results = (store?.cattle ?? [])
						.filter(
							(c) => c.ownerUserId === ownerUserId && c.status !== "PREGNANT",
						)
						.map((c) => {
							const last = (store?.events ?? [])
								.filter(
									(e) => e.cattleId === c.cattleId && e.eventType === "ESTRUS",
								)
								.map((e) => new Date(e.eventDatetime))
								.sort((a, b) => b.getTime() - a.getTime())[0];
							if (!last) return null;
							const days =
								(now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
							if (days >= 20) {
								return {
									cattleId: c.cattleId,
									cattleName: c.name ?? null,
									cattleEarTagNumber: String(c.earTagNumber ?? ""),
									dueAt: last.toISOString(),
								} as unknown;
							}
							return null;
						})
						.filter(Boolean) as unknown[];
					return { results };
				}
				// default: empty
				return { results: [] as unknown[] };
			},
			async first() {
				const allRes = await this.all();
				const arr = allRes.results as unknown[];
				return arr[0] ?? null;
			},
			async run() {
				// handle inserts
				if (sql.startsWith("INSERT INTO registrations")) {
					if (store) {
						const [
							id,
							email,
							referralSource,
							status,
							locale,
							createdAt,
							updatedAt,
						] = this._binds as [
							string,
							string,
							string | null,
							string,
							string,
							number,
							number,
						];
						if (!store.registrations) store.registrations = [];
						store.registrations.push({
							id,
							email,
							referralSource,
							status,
							locale,
							createdAt,
							updatedAt,
						});
					}
				}
				if (sql.startsWith("INSERT INTO email_logs")) {
					if (store) {
						const [id, email, type, httpStatus, resendId, error, createdAt] =
							this._binds as [
								string,
								string,
								string,
								number | null,
								string | null,
								string | null,
								number,
							];
						if (!store.emailLogs) store.emailLogs = [];
						store.emailLogs.push({
							id,
							email,
							type,
							httpStatus: httpStatus ?? undefined,
							resendId,
							error,
							createdAt,
						});
					}
				}
				return { success: true };
			},
		};
		return statement;
	};
	return db as unknown as AnyD1Database;
}

// naive moving window across cattle for pagination simulation (stateful per test run)
let cattleWindowOffset = 0;
function getCattleWindow(
	list: FakeStore["cattle"],
	n: number,
): FakeStore["cattle"] {
	if (n <= 0) return [] as unknown as FakeStore["cattle"];
	const dbResults = list.slice(
		cattleWindowOffset,
		cattleWindowOffset + n,
	) as unknown as FakeStore["cattle"];
	if (dbResults.length >= n) {
		// advance by (limit) because repo requests (limit+1)
		cattleWindowOffset += n - 1;
	} else {
		// reset when exhausted
		cattleWindowOffset = 0;
	}
	return dbResults;
}
