import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const emailLogs = sqliteTable("email_logs", {
	id: text("id").primaryKey(),
	email: text("email").notNull(),
	type: text("type").notNull(),
	httpStatus: integer("http_status"),
	resendId: text("resend_id"),
	error: text("error"),
	createdAt: integer("created_at").notNull()
});

export type EmailLog = typeof emailLogs.$inferSelect;
