import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const registrations = sqliteTable("registrations", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	referralSource: text("referral_source"),
	status: text("status").notNull(),
	locale: text("locale").notNull().default("ja"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export type Registration = typeof registrations.$inferSelect;
