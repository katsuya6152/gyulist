import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: integer("user_id", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});
