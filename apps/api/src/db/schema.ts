import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	userName: text("userName").default("ユーザー"),
	email: text("email").notNull().unique(),
	passwordHash: text("passwordHash").notNull(),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});
