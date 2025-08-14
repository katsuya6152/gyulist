import type { AnyD1Database } from "drizzle-orm/d1";
import { describe, expect, it } from "vitest";
import {
	type RegistrationRecord,
	findRegistrationByEmail,
	insertRegistration,
	searchRegistrations
} from "../../../src/repositories/registrationRepository";

const createFakeD1 = () => {
	const calls: { sql: string; binds: unknown[] }[] = [];
	const api = {
		calls,
		prepare(sql: string) {
			return {
				bind: (...args: unknown[]) => {
					calls.push({ sql, binds: args });
					return {
						async run() {
							return { success: true } as const;
						},
						async first<T>() {
							// return first row for SELECT ... LIMIT 1
							return { id: "r1", email: args[0] } as unknown as T;
						},
						async all<T>() {
							return { results: [] as unknown as T[] };
						}
					};
				}
			} as const;
		}
	} as const;
	return api;
};

describe("registrationRepository (D1 path)", () => {
	it("findRegistrationByEmail returns a row", async () => {
		const db = createFakeD1();
		const row = await findRegistrationByEmail(
			db as unknown as AnyD1Database,
			"a@b.com"
		);
		expect(row?.email).toBe("a@b.com");
		expect(db.calls[0].sql).toMatch(/SELECT .* FROM registrations/);
		expect(db.calls[0].binds).toEqual(["a@b.com"]);
	});

	it("insertRegistration issues INSERT with correct binds", async () => {
		const db = createFakeD1();
		const now = Math.floor(Date.now() / 1000);
		const rec: RegistrationRecord = {
			id: "id1",
			email: "x@y.com",
			referralSource: "search",
			status: "confirmed",
			locale: "ja",
			createdAt: now,
			updatedAt: now
		};
		await insertRegistration(db as unknown as AnyD1Database, rec);
		expect(db.calls[0].sql).toMatch(/INSERT INTO registrations/);
		expect(db.calls[0].binds).toEqual([
			rec.id,
			rec.email,
			rec.referralSource,
			rec.status,
			rec.locale,
			rec.createdAt,
			rec.updatedAt
		]);
	});

	it("searchRegistrations builds WHERE and binds for filters", async () => {
		const db = createFakeD1();
		const params = {
			q: "user",
			from: 1,
			to: 10,
			source: "search",
			limit: 5,
			offset: 10
		} as const;
		await searchRegistrations(db as unknown as AnyD1Database, params);
		// first prepared statement is for SELECT ... LIMIT ? OFFSET ?
		expect(db.calls[0].sql).toMatch(/SELECT .* FROM registrations/);
		// binds: q, from, to, source, limit, offset
		expect(db.calls[0].binds).toEqual(["%user%", 1, 10, "search", 5, 10]);
		// second prepared statement is for COUNT(*) with same where binds
		expect(db.calls[1].sql).toMatch(/SELECT COUNT\(\*\)/);
		expect(db.calls[1].binds).toEqual(["%user%", 1, 10, "search"]);
	});

	it("searchRegistrations without filters omits WHERE and binds only limit/offset", async () => {
		const db = createFakeD1();
		await searchRegistrations(db as unknown as AnyD1Database, {
			limit: 10,
			offset: 0
		});
		expect(db.calls[0].sql).toMatch(
			/SELECT .* FROM registrations\s+ORDER BY created_at DESC LIMIT \? OFFSET \?/
		);
		expect(db.calls[0].binds).toEqual([10, 0]);
		expect(db.calls[1].sql).toMatch(
			/SELECT COUNT\(\*\) as count FROM registrations\s*$/
		);
		expect(db.calls[1].binds).toEqual([]);
	});
});
