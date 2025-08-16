import type { AnyD1Database } from "drizzle-orm/d1";
import type {
	EmailLogRecord,
	RegistrationRecord,
	RegistrationRepoPort,
	SearchParams
} from "../../ports";

type MemoryDB = {
	registrations: RegistrationRecord[];
	email_logs: EmailLogRecord[];
};

const isMemory = (db: unknown): db is MemoryDB =>
	Array.isArray((db as MemoryDB).registrations);

class DrizzleRegistrationRepo implements RegistrationRepoPort {
	constructor(private db: AnyD1Database | MemoryDB) {}

	async findByEmail(email: string): Promise<RegistrationRecord | null> {
		if (isMemory(this.db)) {
			return this.db.registrations.find((r) => r.email === email) ?? null;
		}
		const stmt = this.db
			.prepare(
				"SELECT id, email, referral_source AS referralSource, status, locale, created_at AS createdAt, updated_at AS updatedAt FROM registrations WHERE email = ? LIMIT 1"
			)
			.bind(email);
		const row = await stmt.first<RegistrationRecord>();
		return row ?? null;
	}

	async insert(reg: RegistrationRecord): Promise<void> {
		if (isMemory(this.db)) {
			this.db.registrations.push(reg);
			return;
		}
		await this.db
			.prepare(
				"INSERT INTO registrations (id,email,referral_source,status,locale,created_at,updated_at) VALUES (?,?,?,?,?,?,?)"
			)
			.bind(
				reg.id,
				reg.email,
				reg.referralSource,
				reg.status,
				reg.locale,
				reg.createdAt,
				reg.updatedAt
			)
			.run();
	}

	async search(
		params: SearchParams
	): Promise<{ items: RegistrationRecord[]; total: number }> {
		if (isMemory(this.db)) {
			let items = [...this.db.registrations];
			if (typeof params.q === "string") {
				const q = params.q;
				items = items.filter((r) => r.email.includes(q));
			}
			if (typeof params.from === "number") {
				const from = params.from;
				items = items.filter((r) => r.createdAt >= from);
			}
			if (typeof params.to === "number") {
				const to = params.to;
				items = items.filter((r) => r.createdAt <= to);
			}
			if (typeof params.source === "string") {
				const source = params.source;
				items = items.filter((r) => r.referralSource === source);
			}
			items.sort((a, b) => b.createdAt - a.createdAt);
			const total = items.length;
			const sliced = items.slice(params.offset, params.offset + params.limit);
			return { items: sliced, total };
		}
		const where: string[] = [];
		const binds: (string | number)[] = [];
		if (params.q) {
			where.push("email LIKE ?");
			binds.push(`%${params.q}%`);
		}
		if (params.from !== undefined) {
			where.push("created_at >= ?");
			binds.push(params.from);
		}
		if (params.to !== undefined) {
			where.push("created_at <= ?");
			binds.push(params.to);
		}
		if (params.source) {
			where.push("referral_source = ?");
			binds.push(params.source);
		}
		const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
		const itemsStmt = this.db
			.prepare(
				`SELECT id, email, referral_source AS referralSource, status, locale, created_at AS createdAt, updated_at AS updatedAt FROM registrations ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
			)
			.bind(...binds, params.limit, params.offset);
		const items = (await itemsStmt.all<RegistrationRecord>()).results as
			| RegistrationRecord[]
			| undefined;
		const totalStmt = this.db
			.prepare(`SELECT COUNT(*) as count FROM registrations ${whereSql}`)
			.bind(...binds);
		const totalRow = await totalStmt.first<{ count: number }>();
		return { items: items ?? [], total: totalRow?.count ?? 0 };
	}

	async insertEmailLog(log: EmailLogRecord): Promise<void> {
		if (isMemory(this.db)) {
			this.db.email_logs.push(log);
			return;
		}
		await this.db
			.prepare(
				"INSERT INTO email_logs (id,email,type,http_status,resend_id,error,created_at) VALUES (?,?,?,?,?,?,?)"
			)
			.bind(
				log.id,
				log.email,
				log.type,
				log.httpStatus ?? null,
				log.resendId ?? null,
				log.error ?? null,
				log.createdAt
			)
			.run();
	}
}

export function makeRegistrationRepo(
	db: AnyD1Database | MemoryDB
): RegistrationRepoPort {
	return new DrizzleRegistrationRepo(db);
}
