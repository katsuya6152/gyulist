import { relations } from "drizzle-orm";
import { alerts } from "./tables/alerts";
import { cattle } from "./tables/cattle";
import { users } from "./tables/users";

// Cattle relations
export const cattleRelations = relations(cattle, ({ one, many }) => ({
	owner: one(users, {
		fields: [cattle.ownerUserId],
		references: [users.id]
	}),
	alerts: many(alerts)
}));

// Alerts relations
export const alertsRelations = relations(alerts, ({ one }) => ({
	cattle: one(cattle, {
		fields: [alerts.cattleId],
		references: [cattle.cattleId]
	}),
	owner: one(users, {
		fields: [alerts.ownerUserId],
		references: [users.id]
	})
}));

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
	cattle: many(cattle),
	alerts: many(alerts)
}));
