import { z } from "zod";
import type { cattle } from "../db/schema";

// データベース用のスキーマ
export const cattleSchema = z.object({
	cattleId: z.number(),
	ownerUserId: z.number(),
	identificationNumber: z.number(),
	earTagNumber: z.number().nullable(),
	name: z.string().nullable(),
	gender: z.string().nullable(),
	birthDate: z.string().nullable(),
	growthStage: z
		.enum(["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"])
		.nullable(),
	breed: z.string().nullable(),
	notes: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

// 新規作成用のスキーマ
export const createCattleSchema = cattleSchema.omit({
	cattleId: true,
	createdAt: true,
	updatedAt: true,
});

// 更新用のスキーマ
export const updateCattleSchema = createCattleSchema.partial();

export type Cattle = typeof cattle.$inferSelect;
export type CreateCattleInput = typeof cattle.$inferInsert;
export type UpdateCattleInput = Partial<typeof cattle.$inferInsert>;
