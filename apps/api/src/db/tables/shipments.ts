import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cattle } from "./cattle";

/**
 * 出荷実績テーブル
 */
export const shipments = sqliteTable("shipments", {
	// 出荷ID
	shipmentId: text("shipmentId").primaryKey(),
	// 出荷対象の牛ID
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	// 出荷日
	shipmentDate: text("shipmentDate").notNull(),
	// 出荷価格（円）
	price: integer("price", { mode: "number" }).notNull(),
	// 出荷時体重（kg）
	weight: real("weight"),
	// 出荷時日齢
	ageAtShipment: integer("ageAtShipment", { mode: "number" }),
	// 購買者
	buyer: text("buyer"),
	// 備考
	notes: text("notes"),
	// 登録日時
	createdAt: text("createdAt").default(sql`(datetime('now', 'utc'))`),
	// 更新日時
	updatedAt: text("updatedAt").default(sql`(datetime('now', 'utc'))`)
});

/**
 * 出荷予定テーブル
 */
export const shipmentPlans = sqliteTable("shipment_plans", {
	// 出荷予定ID
	planId: text("planId").primaryKey(),
	// 出荷予定の牛ID
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	// 出荷予定月（YYYY-MM形式）
	plannedShipmentMonth: text("plannedShipmentMonth").notNull(),
	// 登録日時
	createdAt: text("createdAt").default(sql`(datetime('now', 'utc'))`),
	// 更新日時
	updatedAt: text("updatedAt").default(sql`(datetime('now', 'utc'))`)
});
