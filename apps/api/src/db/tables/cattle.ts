import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const cattle = sqliteTable("cattle", {
	cattleId: integer("cattleId", { mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	// users(id)への外部キー参照
	ownerUserId: integer("ownerUserId", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	// 個体識別番号*
	identificationNumber: integer("identificationNumber", {
		mode: "number",
	}).notNull(),
	// 耳標番号
	earTagNumber: integer("earTagNumber", { mode: "number" }),
	// 名号*
	name: text("name"),
	// 成長段階*
	growthStage: text("growthStage", {
		// enum: ["仔牛", "育成牛", "肥育牛", "初産牛", "経産牛"],
		enum: ["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"],
	}),
	// 出生日
	birthday: text("birthday"),
	// 年齢
	age: integer("age", { mode: "number" }),
	// 月齢
	monthsOld: integer("monthsOld", { mode: "number" }),
	// 日齢
	daysOld: integer("daysOld", { mode: "number" }),
	// 性別*
	gender: text("gender"),
	// 体重
	weight: integer("weight", { mode: "number" }),
	// 得点
	score: integer("score", { mode: "number" }),
	// 品種
	breed: text("breed"),
	// 健康状態
	healthStatus: text("healthStatus"),
	// 生産者
	producerName: text("producerName"),
	// 牛舎
	barn: text("barn"),
	// 育種価
	breedingValue: text("breedingValue"),
	// 備考
	notes: text("notes"),
	// 登録日時
	createdAt: text().default(sql`(datetime('now', 'utc'))`),
	updatedAt: text().default(sql`(datetime('now', 'utc'))`),
});

/**
 * 血統情報
 */
export const bloodline = sqliteTable("bloodline", {
	bloodlineId: integer("bloodlineId", { mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	// 紐づけ対象の個体
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	// 父
	fatherCattleName: text("fatherCattleName"),
	// 母の父
	motherFatherCattleName: text("motherFatherCattleName"),
	// 母の祖父
	motherGrandFatherCattleName: text("motherGrandFatherCattleName"),
	// 母の祖祖父
	motherGreatGrandFatherCattleName: text("motherGreatGrandFatherCattleName"),
});

/**
 * 母情報
 */
export const motherInfo = sqliteTable("mother_info", {
	motherInfoId: integer("motherInfoId", { mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	// 子の個体ID
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	// 実際の母(=cattleテーブル)を参照するID
	motherCattleId: integer("motherCattleId", { mode: "number" }).notNull(),
	// 母の名号
	motherName: text("motherName"),
	// 母の個体識別番号
	motherIdentificationNumber: text("motherIdentificationNumber"),
	// 母の得点
	motherScore: integer("motherScore", { mode: "number" }),
});

/**
 * 現在の繁殖状態
 */
export const breedingStatus = sqliteTable("breeding_status", {
	breedingStatusId: integer("breedingStatusId", { mode: "number" }).primaryKey({
		autoIncrement: true,
	}),
	// 紐づけ対象の個体
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	// 産次
	parity: integer("parity", { mode: "number" }),
	// 分娩予定日
	expectedCalvingDate: text("expectedCalvingDate"),
	// 妊娠鑑定予定日
	scheduledPregnancyCheckDate: text("scheduledPregnancyCheckDate"),
	// 分娩後経過日数
	daysAfterCalving: integer("daysAfterCalving", { mode: "number" }),
	// 空胎日数
	daysOpen: integer("daysOpen", { mode: "number" }),
	// 妊娠日数
	pregnancyDays: integer("pregnancyDays", { mode: "number" }),
	// 受精後日数
	daysAfterInsemination: integer("daysAfterInsemination", { mode: "number" }),
	// 種付回数（現在のサイクル内での試行回数）
	inseminationCount: integer("inseminationCount", { mode: "number" }),
	// 繁殖に関するメモ
	breedingMemo: text("breedingMemo"),
	// 前回の出産が安産か難産か（0=安産 / 1=難産などで管理）
	isDifficultBirth: integer("isDifficultBirth", { mode: "boolean" }),

	// 登録日時・更新日時
	createdAt: text().default(sql`(datetime('now', 'utc'))`),
	updatedAt: text().default(sql`(datetime('now', 'utc'))`),
});

/**
 * 繁殖の累計・統計情報
 */
export const breedingSummary = sqliteTable("breeding_summary", {
	breedingSummaryId: integer("breedingSummaryId", {
		mode: "number",
	}).primaryKey({
		autoIncrement: true,
	}),
	// 紐づけ対象の個体
	cattleId: integer("cattleId", { mode: "number" })
		.references(() => cattle.cattleId)
		.notNull(),
	// 累計種付回数
	totalInseminationCount: integer("totalInseminationCount", { mode: "number" }),
	// 平均空胎日数
	averageDaysOpen: integer("averageDaysOpen", { mode: "number" }),
	// 平均妊娠期間
	averagePregnancyPeriod: integer("averagePregnancyPeriod", { mode: "number" }),
	// 平均分娩間隔
	averageCalvingInterval: integer("averageCalvingInterval", { mode: "number" }),
	// 難産回数
	difficultBirthCount: integer("difficultBirthCount", { mode: "number" }),
	// 受胎頭数
	pregnancyHeadCount: integer("pregnancyHeadCount", { mode: "number" }),
	// 受胎率 (累計に対する受胎成功率)
	pregnancySuccessRate: integer("pregnancySuccessRate", { mode: "number" }),

	// 登録日時・更新日時
	createdAt: text().default(sql`(datetime('now', 'utc'))`),
	updatedAt: text().default(sql`(datetime('now', 'utc'))`),
});

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
