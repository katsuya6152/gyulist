import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cattle } from "./cattle";
import { users } from "./users";

export const alerts = sqliteTable("alerts", {
	id: text("id").primaryKey(),
	type: text("type", {
		enum: [
			"OPEN_DAYS_OVER60_NO_AI",
			"CALVING_WITHIN_60",
			"CALVING_OVERDUE",
			"ESTRUS_OVER20_NOT_PREGNANT"
		]
	}).notNull(),
	severity: text("severity", { enum: ["high", "medium", "low"] }).notNull(),
	status: text("status", {
		enum: ["active", "acknowledged", "resolved", "dismissed"]
	}).notNull(),
	cattleId: integer("cattle_id")
		.notNull()
		.references(() => cattle.cattleId, { onDelete: "cascade" }),
	cattleName: text("cattle_name"),
	cattleEarTagNumber: text("cattle_ear_tag_number"),
	dueAt: text("due_at"), // ISO8601形式
	message: text("message").notNull(),
	memo: text("memo"), // メモフィールドを追加
	ownerUserId: integer("owner_user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: integer("created_at").notNull(), // UNIX timestamp
	updatedAt: integer("updated_at").notNull(), // UNIX timestamp
	acknowledgedAt: integer("acknowledged_at"), // UNIX timestamp
	resolvedAt: integer("resolved_at") // UNIX timestamp
});
