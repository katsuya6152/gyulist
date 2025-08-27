import { relations } from "drizzle-orm";
import { alerts } from "./tables/alerts";
import { bloodline, cattle, motherInfo } from "./tables/cattle";
import { shipmentPlans, shipments } from "./tables/shipments";
import { users } from "./tables/users";

// Cattle relations
export const cattleRelations = relations(cattle, ({ one, many }) => ({
	owner: one(users, {
		fields: [cattle.ownerUserId],
		references: [users.id]
	}),
	alerts: many(alerts),
	shipments: many(shipments),
	shipmentPlan: one(shipmentPlans),
	bloodline: one(bloodline),
	motherInfo: one(motherInfo),
	// 母牛として参照される関係
	calves: many(motherInfo, { relationName: "motherToCalves" })
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

// Shipments relations
export const shipmentsRelations = relations(shipments, ({ one }) => ({
	cattle: one(cattle, {
		fields: [shipments.cattleId],
		references: [cattle.cattleId]
	})
}));

// Shipment Plans relations
export const shipmentPlansRelations = relations(shipmentPlans, ({ one }) => ({
	cattle: one(cattle, {
		fields: [shipmentPlans.cattleId],
		references: [cattle.cattleId]
	})
}));

// Bloodline relations
export const bloodlineRelations = relations(bloodline, ({ one }) => ({
	cattle: one(cattle, {
		fields: [bloodline.cattleId],
		references: [cattle.cattleId]
	})
}));

// Mother Info relations
export const motherInfoRelations = relations(motherInfo, ({ one }) => ({
	calf: one(cattle, {
		fields: [motherInfo.cattleId],
		references: [cattle.cattleId]
	}),
	mother: one(cattle, {
		fields: [motherInfo.motherCattleId],
		references: [cattle.cattleId],
		relationName: "motherToCalves"
	})
}));

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
	cattle: many(cattle),
	alerts: many(alerts)
}));
