import type { AnyD1Database } from "drizzle-orm/d1";
import type { EmailLog, Registration } from "../types";

export async function findRegistrationByEmail(
	db: AnyD1Database,
	email: string,
) {
	const stmt = db
		.prepare("SELECT * FROM registrations WHERE email = ?")
		.bind(email);
	const res = await stmt.first<Registration>();
	return res ?? null;
}

export async function insertRegistration(
	db: AnyD1Database,
	registration: Registration,
) {
	const stmt = db
		.prepare(
			"INSERT INTO registrations (id, email, referral_source, status, locale, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		)
		.bind(
			registration.id,
			registration.email,
			registration.referral_source,
			registration.status,
			registration.locale,
			registration.created_at,
			registration.updated_at,
		);
	await stmt.run();
}

export type RegistrationFilters = {
	q?: string;
	from?: number;
	to?: number;
	source?: string;
	limit: number;
	offset: number;
};

export async function listRegistrations(
	db: AnyD1Database,
	filters: RegistrationFilters,
): Promise<Registration[]> {
	let sql =
		"SELECT email, referral_source, created_at FROM registrations WHERE 1=1";
	const params: (string | number)[] = [];
	if (filters.q) {
		sql += " AND email LIKE ?";
		params.push(`%${filters.q}%`);
	}
	if (filters.from) {
		sql += " AND created_at >= ?";
		params.push(filters.from);
	}
	if (filters.to) {
		sql += " AND created_at <= ?";
		params.push(filters.to);
	}
	if (filters.source) {
		sql += " AND referral_source = ?";
		params.push(filters.source);
	}
	sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
	params.push(filters.limit, filters.offset);
	const stmt = db.prepare(sql).bind(...params);
	const res = await stmt.all<Registration>();
	return res.results as Registration[];
}

export async function insertEmailLog(db: AnyD1Database, log: EmailLog) {
	const stmt = db
		.prepare(
			"INSERT INTO email_logs (id, email, type, http_status, resend_id, error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		)
		.bind(
			log.id,
			log.email,
			log.type,
			log.http_status ?? null,
			log.resend_id ?? null,
			log.error ?? null,
			log.created_at,
		);
	await stmt.run();
}
