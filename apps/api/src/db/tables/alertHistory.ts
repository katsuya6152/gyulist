import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { alerts } from "./alerts";
import { users } from "./users";

export const alertHistory = sqliteTable("alert_history", {
	id: text("id").primaryKey(),
	alertId: text("alert_id")
		.notNull()
		.references(() => alerts.id, { onDelete: "cascade" }),
	action: text("action", {
		enum: ["created", "updated", "acknowledged", "resolved", "dismissed"]
	}).notNull(),
	previousStatus: text("previous_status"),
	newStatus: text("new_status").notNull(),
	changedBy: integer("changed_by")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	reason: text("reason"),
	createdAt: integer("created_at").notNull() // UNIX timestamp
});
