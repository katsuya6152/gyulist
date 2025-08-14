import type { AnyD1Database } from "drizzle-orm/d1";

export type EmailLogRecord = {
	id: string;
	email: string;
	type: string;
	httpStatus?: number;
	resendId?: string | null;
	error?: string | null;
	createdAt: number;
};

type MemoryDB = {
	email_logs: EmailLogRecord[];
};

const isMemory = (db: unknown): db is MemoryDB =>
	Array.isArray((db as MemoryDB).email_logs);

export async function insertEmailLog(
	db: AnyD1Database | MemoryDB,
	log: EmailLogRecord
) {
	if (isMemory(db)) {
		db.email_logs.push(log);
		return;
	}
	await db
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
