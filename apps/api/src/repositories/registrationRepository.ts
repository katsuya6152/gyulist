import type { AnyD1Database } from "drizzle-orm/d1";

export type RegistrationRecord = {
	id: string;
	email: string;
	referralSource: string | null;
	status: string;
	locale: string;
	createdAt: number;
	updatedAt: number;
};

type MemoryDB = {
	registrations: RegistrationRecord[];
};

const isMemory = (db: unknown): db is MemoryDB =>
	Array.isArray((db as MemoryDB).registrations);

export async function findRegistrationByEmail(
	db: AnyD1Database | MemoryDB,
	email: string,
) {
	if (isMemory(db)) {
		return db.registrations.find((r) => r.email === email) ?? null;
	}
	const stmt = db
		.prepare(
			"SELECT id, email, referral_source AS referralSource, status, locale, created_at AS createdAt, updated_at AS updatedAt FROM registrations WHERE email = ? LIMIT 1",
		)
		.bind(email);
	const row = await stmt.first<RegistrationRecord>();
	return row ?? null;
}

export async function insertRegistration(
	db: AnyD1Database | MemoryDB,
	reg: RegistrationRecord,
) {
	if (isMemory(db)) {
		db.registrations.push(reg);
		return;
	}
	await db
		.prepare(
			"INSERT INTO registrations (id,email,referral_source,status,locale,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
		)
		.bind(
			reg.id,
			reg.email,
			reg.referralSource,
			reg.status,
			reg.locale,
			reg.createdAt,
			reg.updatedAt,
		)
		.run();
}

export type SearchParams = {
	q?: string;
	from?: number;
	to?: number;
	source?: string;
	limit: number;
	offset: number;
};

export async function searchRegistrations(
	db: AnyD1Database | MemoryDB,
	params: SearchParams,
) {
	if (isMemory(db)) {
		let items = [...db.registrations];
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
	const whereSql = where.length ? `WHERE ${where.join(" AND")}` : "";
	const itemsStmt = db
		.prepare(
			`SELECT id, email, referral_source AS referralSource, status, locale, created_at AS createdAt, updated_at AS updatedAt FROM registrations ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
		)
		.bind(...binds, params.limit, params.offset);
	const items = (await itemsStmt.all<RegistrationRecord>()).results as
		| RegistrationRecord[]
		| undefined;
	const totalStmt = db
		.prepare(`SELECT COUNT(*) as count FROM registrations ${whereSql}`)
		.bind(...binds);
	const totalRow = await totalStmt.first<{ count: number }>();
	return { items: items ?? [], total: totalRow?.count ?? 0 };
}
