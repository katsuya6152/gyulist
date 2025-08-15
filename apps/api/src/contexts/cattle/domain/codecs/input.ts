import { z } from "zod";
import type { Gender, GrowthStage, Status } from "../model/cattle";

// 血統情報のスキーマ
export const bloodlineSchema = z.object({
	bloodlineId: z.number().optional(),
	cattleId: z.number().optional(),
	fatherCattleName: z.string().nullable(),
	motherFatherCattleName: z.string().nullable(),
	motherGrandFatherCattleName: z.string().nullable(),
	motherGreatGrandFatherCattleName: z.string().nullable()
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
	updatedAt: z.string().optional()
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
	updatedAt: z.string().optional()
});

export const newCattleSchema = z.object({
	ownerUserId: z.number(),
	identificationNumber: z.number(),
	earTagNumber: z.number().nullable().optional(),
	name: z.string().nullable().optional(),
	gender: z.custom<Gender>().nullable().optional(),
	birthday: z.string().nullable().optional(),
	growthStage: z.custom<GrowthStage>().nullable().optional(),
	breed: z.string().nullable().optional(),
	status: z.custom<Status>().nullable().optional(),
	producerName: z.string().nullable().optional(),
	barn: z.string().nullable().optional(),
	breedingValue: z.string().nullable().optional(),
	notes: z.string().nullable().optional()
});

// 新規作成用のスキーマ（血統・繁殖情報を含む）
export const createCattleSchema = z.object({
	// 基本情報
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
		"MULTI_PAROUS"
	]),
	score: z.number().nullable().optional(),
	breed: z.string().nullable(),
	producerName: z.string().nullable().optional(),
	barn: z.string().nullable().optional(),
	breedingValue: z.string().nullable().optional(),
	notes: z.string().nullable(),
	// 血統情報
	bloodline: bloodlineSchema.optional(),
	// 繁殖情報
	breedingStatus: breedingStatusSchema.optional(),
	breedingSummary: breedingSummarySchema.optional()
});

// 更新用のスキーマ
export const updateCattleSchema = createCattleSchema.partial();

export const updateStatusSchema = z.object({
	status: z.enum([
		"HEALTHY",
		"PREGNANT",
		"RESTING",
		"TREATING",
		"SHIPPED",
		"DEAD"
	]),
	reason: z.string().nullable().optional()
});

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
				.optional()
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
				.optional()
		)
		.optional()
});

export type NewCattleInput = z.infer<typeof newCattleSchema>;
export type CreateCattleInput = z.infer<typeof createCattleSchema>;
export type UpdateCattleInput = z.infer<typeof updateCattleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type SearchCattleQuery = z.infer<typeof searchCattleSchema>;
