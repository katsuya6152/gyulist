import { z } from "zod";
import type {
	bloodline,
	breedingStatus,
	breedingSummary,
	cattle,
	motherInfo,
} from "../db/schema";

// データベース用のスキーマ
export const cattleSchema = z.object({
	cattleId: z.number(),
	ownerUserId: z.number(),
	identificationNumber: z.number(),
	earTagNumber: z.number(),
	name: z.string(),
	gender: z.string(),
	birthday: z.string(),
	growthStage: z.enum([
		"CALF",
		"GROWING",
		"FATTENING",
		"FIRST_CALVED",
		"MULTI_PAROUS",
	]),
	breed: z.string().nullable(),
	notes: z.string().nullable(),
	age: z.number().nullable(),
	monthsOld: z.number().nullable(),
	daysOld: z.number().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

// 血統情報のスキーマ
export const bloodlineSchema = z.object({
	bloodlineId: z.number().optional(),
	cattleId: z.number().optional(),
	fatherCattleName: z.string().nullable(),
	motherFatherCattleName: z.string().nullable(),
	motherGrandFatherCattleName: z.string().nullable(),
	motherGreatGrandFatherCattleName: z.string().nullable(),
});

// 母情報のスキーマ
export const motherInfoSchema = z.object({
	motherInfoId: z.number().optional(),
	cattleId: z.number().optional(),
	motherCattleId: z.number(),
	motherName: z.string().nullable(),
	motherIdentificationNumber: z.string().nullable(),
	motherScore: z.number().nullable(),
});

// 繁殖状態のスキーマ
export const breedingStatusSchema = z.object({
	breedingStatusId: z.number().optional(),
	cattleId: z.number().optional(),
	parity: z.number().nullable(),
	expectedCalvingDate: z.string().nullable(),
	scheduledPregnancyCheckDate: z.string().nullable(),
	daysAfterCalving: z.number().nullable(),
	daysOpen: z.number().nullable(),
	pregnancyDays: z.number().nullable(),
	daysAfterInsemination: z.number().nullable(),
	inseminationCount: z.number().nullable(),
	breedingMemo: z.string().nullable(),
	isDifficultBirth: z.boolean().nullable(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

// 繁殖統計のスキーマ
export const breedingSummarySchema = z.object({
	breedingSummaryId: z.number().optional(),
	cattleId: z.number().optional(),
	totalInseminationCount: z.number().nullable(),
	averageDaysOpen: z.number().nullable(),
	averagePregnancyPeriod: z.number().nullable(),
	averageCalvingInterval: z.number().nullable(),
	difficultBirthCount: z.number().nullable(),
	pregnancyHeadCount: z.number().nullable(),
	pregnancySuccessRate: z.number().nullable(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

// 新規作成用スキーマ
const baseCreateSchema = z.object({
	identificationNumber: z.number(),
	earTagNumber: z.number(),
	name: z.string(),
	gender: z.string(),
	birthday: z.string(),
	breed: z.string().nullable(),
	notes: z.string().nullable(),
	bloodline: bloodlineSchema.optional(),
});

export const createCalfSchema = baseCreateSchema.extend({
	growthStage: z.enum(["CALF", "GROWING", "FATTENING"]),
	motherInfo: motherInfoSchema,
});

export const createBreedingCowSchema = baseCreateSchema.extend({
	growthStage: z.enum(["FIRST_CALVED", "MULTI_PAROUS"]),
	breedingStatus: breedingStatusSchema.optional(),
	breedingSummary: breedingSummarySchema.optional(),
});

export const createCattleSchema = z.discriminatedUnion("growthStage", [
	createCalfSchema,
	createBreedingCowSchema,
]);

// 更新用のスキーマ
export const updateCalfSchema = createCalfSchema.partial().extend({
	growthStage: z.enum(["CALF", "GROWING", "FATTENING"]),
});

export const updateBreedingCowSchema = createBreedingCowSchema
	.partial()
	.extend({
		growthStage: z.enum(["FIRST_CALVED", "MULTI_PAROUS"]),
	});

export const updateCattleSchema = z.discriminatedUnion("growthStage", [
	updateCalfSchema,
	updateBreedingCowSchema,
]);

export const updateStatusSchema = z.object({
	status: z.enum([
		"HEALTHY",
		"PREGNANT",
		"RESTING",
		"TREATING",
		"SHIPPED",
		"DEAD",
	]),
	reason: z.string().nullable().optional(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export type Cattle = typeof cattle.$inferSelect;
export type Bloodline = typeof bloodline.$inferSelect;
export type BreedingStatus = typeof breedingStatus.$inferSelect;
export type BreedingSummary = typeof breedingSummary.$inferSelect;
export type MotherInfo = typeof motherInfo.$inferSelect;
export type CreateCalfInput = z.infer<typeof createCalfSchema>;
export type CreateBreedingCowInput = z.infer<typeof createBreedingCowSchema>;
export type UpdateCalfInput = z.infer<typeof updateCalfSchema>;
export type UpdateBreedingCowInput = z.infer<typeof updateBreedingCowSchema>;
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
	status: z
		.string()
		.transform((val) => val?.split(","))
		.pipe(
			z
				.enum(["HEALTHY", "PREGNANT", "RESTING", "TREATING", "SHIPPED", "DEAD"])
				.array()
				.optional(),
		)
		.optional(),
});

export type SearchCattleQuery = z.infer<typeof searchCattleSchema>;
