import type { AnyD1Database } from "drizzle-orm/d1";
import { describe, expect, it } from "vitest";
import {
	type EmailLogRecord,
	insertEmailLog
} from "../../../src/repositories/emailLogRepository";

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
						}
					};
				}
			} as const;
		}
	} as const;
	return api;
};

describe("emailLogRepository (D1 path)", () => {
	it("insertEmailLog issues INSERT with proper binds including nulls", async () => {
		const db = createFakeD1();
		const log: EmailLogRecord = {
			id: "e1",
			email: "user@example.com",
			type: "completed",
			httpStatus: 200,
			resendId: "rid",
			error: null,
			createdAt: 123
		};
		await insertEmailLog(db as unknown as AnyD1Database, log);
		expect(db.calls[0].sql).toMatch(/INSERT INTO email_logs/);
		expect(db.calls[0].binds).toEqual([
			log.id,
			log.email,
			log.type,
			log.httpStatus,
			log.resendId,
			log.error,
			log.createdAt
		]);
	});

	it("insertEmailLog allows undefined for httpStatus and coerces to NULL at DB layer", async () => {
		const db = createFakeD1();
		const log: EmailLogRecord = {
			id: "e2",
			email: "user2@example.com",
			type: "completed",
			createdAt: 124
		} as unknown as EmailLogRecord;
		await insertEmailLog(db as unknown as AnyD1Database, log);
		expect(db.calls[0].binds[3]).toBeNull();
	});
});
