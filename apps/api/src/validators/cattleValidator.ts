import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { cattle } from "../db/schema";

// データベース用のスキーマ
export const cattleSchema = createSelectSchema(cattle);

// 新規作成用のスキーマ（年齢関連フィールドを除外）
export const createCattleSchema = createInsertSchema(cattle, {
	age: undefined,
	monthsOld: undefined,
	daysOld: undefined,
});

// 更新用のスキーマ（年齢関連フィールドを除外）
export const updateCattleSchema = createUpdateSchema(cattle, {
	age: undefined,
	monthsOld: undefined,
	daysOld: undefined,
}).partial();

export type Cattle = typeof cattle.$inferSelect;
export type CreateCattleInput = typeof cattle.$inferInsert;
export type UpdateCattleInput = typeof updateCattleSchema._type;
