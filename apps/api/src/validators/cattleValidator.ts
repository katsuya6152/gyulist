import { z } from "zod";
import type { cattle } from "../db/schema";

// データベース用のスキーマ
export const cattleSchema = z.object({
	cattleId: z.number(),
	ownerUserId: z.number(),
	identificationNumber: z.number(),
	earTagNumber: z.number(),
	name: z.string(),
	gender: z.string(),
	birthDate: z.string(),
	growthStage: z.enum([
		"CALF",
		"GROWING",
		"FATTENING",
		"FIRST_CALVED",
		"MULTI_PAROUS",
	]),
	breed: z.string().nullable(),
	notes: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

// 新規作成用のスキーマ
export const createCattleSchema = cattleSchema.omit({
	cattleId: true,
	ownerUserId: true,
	createdAt: true,
	updatedAt: true,
});

// 更新用のスキーマ
export const updateCattleSchema = createCattleSchema.partial();

export type Cattle = typeof cattle.$inferSelect;
export type CreateCattleInput = typeof cattle.$inferInsert;
export type UpdateCattleInput = Partial<typeof cattle.$inferInsert>;

// 検索クエリ用のスキーマ
export const searchCattleSchema = z.object({
	cursor: z.string().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	sort_by: z.enum(["id", "name", "days_old"]).default("id"),
	sort_order: z.enum(["asc", "desc"]).default("desc"),
	search: z.string().optional(),
	growth_stage: z
		.string()
		.transform((val) => val?.split(","))
		.pipe(
			z
				.enum(["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"])
				.array()
				.optional(),
		)
		.optional(),
	gender: z
		.string()
		.transform((val) => val?.split(","))
		.pipe(z.enum(["オス", "メス"]).array().optional())
		.optional(),
});

export type SearchCattleQuery = z.infer<typeof searchCattleSchema>;
