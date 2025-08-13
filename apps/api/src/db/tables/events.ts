import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cattle } from "./cattle";
import { users } from "./users";

/**
 * イベント情報
 */
export const events = sqliteTable("events", {
	eventId: integer("eventId", { mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	eventType: text("eventType", {
		enum: [
			"ESTRUS", // 発情
			"INSEMINATION", // 受精（人工授精）
			"CALVING", // 分娩
			"VACCINATION", // ワクチン接種
			"SHIPMENT", // 出荷
			"HOOF_TRIMMING", // 削蹄
			"OTHER", // その他
		],
	}).notNull(),
	// イベントが起こった日時
	eventDatetime: text("eventDatetime").notNull(),
	// イベントに関する自由メモ
	notes: text("notes"),
	// 登録日時・更新日時
	createdAt: text().default(sql`(datetime('now', 'utc'))`),
	updatedAt: text().default(sql`(datetime('now', 'utc'))`),
});

/**
 * ステータス履歴
 */
export const cattleStatusHistory = sqliteTable("cattle_status_history", {
	historyId: integer("historyId", { mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	oldStatus: text("oldStatus", {
		enum: ["HEALTHY", "PREGNANT", "RESTING", "TREATING", "SHIPPED", "DEAD"],
	}),
	newStatus: text("newStatus", {
		enum: ["HEALTHY", "PREGNANT", "RESTING", "TREATING", "SHIPPED", "DEAD"],
	}).notNull(),
	changedAt: text().default(sql`(datetime('now', 'utc'))`),
	changedBy: integer("changedBy", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	reason: text("reason"),
});
