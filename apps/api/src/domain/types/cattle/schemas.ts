/**
 * Cattle Domain Zod Schemas
 *
 * 牛管理ドメインのZodスキーマ定義
 */

import { z } from "zod";

// Cattle creation schema
export const createCattleSchema = z.object({
	name: z.string().min(1),
	identificationNumber: z.number().positive(),
	earTagNumber: z.number().positive(),
	gender: z.enum(["雄", "去勢", "雌"]),
	growthStage: z.enum([
		"CALF",
		"GROWING",
		"FATTENING",
		"FIRST_CALVED",
		"MULTI_PAROUS"
	]),
	breed: z.string().optional(),
	producerName: z.string().optional(),
	barn: z.string().optional(),
	notes: z.string().optional(),
	weight: z.number().positive().optional(),
	score: z.number().min(1).max(5).optional()
});

// Cattle search schema
export const searchCattleSchema = z.object({
	name: z.string().optional(),
	status: z
		.union([
			z.string(),
			z.array(
				z.enum([
					"HEALTHY",
					"PREGNANT",
					"RESTING",
					"TREATING",
					"SCHEDULED_FOR_SHIPMENT",
					"SHIPPED",
					"DEAD"
				])
			)
		])
		.optional(),
	growthStage: z
		.union([
			z.string(),
			z.array(
				z.enum(["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"])
			)
		])
		.optional(),
	gender: z
		.union([z.string(), z.array(z.enum(["雄", "去勢", "雌"]))])
		.optional(),
	hasAlert: z.union([z.string(), z.boolean()]).optional(),
	search: z.string().optional(),
	limit: z.number().min(1).max(100).optional(),
	cursor: z.string().optional(),
	sortBy: z.string().optional(),
	sortOrder: z.string().optional()
});

// Cattle update schema
export const updateCattleSchema = z.object({
	name: z.string().min(1).optional(),
	breed: z.string().optional(),
	producerName: z.string().optional(),
	barn: z.string().optional(),
	notes: z.string().optional(),
	weight: z.number().positive().optional(),
	score: z.number().min(1).max(5).optional()
});

// Status update schema
export const updateStatusSchema = z.object({
	status: z.enum([
		"HEALTHY",
		"PREGNANT",
		"RESTING",
		"TREATING",
		"SCHEDULED_FOR_SHIPMENT",
		"SHIPPED",
		"DEAD"
	])
});

// Response schemas
export const cattleResponseSchema = z.object({
	cattleId: z.number(),
	name: z.string().nullable(),
	identificationNumber: z.number(),
	earTagNumber: z.number().nullable(),
	gender: z.enum(["雄", "去勢", "雌"]).nullable(),
	growthStage: z
		.enum(["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"])
		.nullable(),
	status: z
		.enum([
			"HEALTHY",
			"PREGNANT",
			"RESTING",
			"TREATING",
			"SCHEDULED_FOR_SHIPMENT",
			"SHIPPED",
			"DEAD"
		])
		.nullable(),
	birthday: z.string().nullable(),
	breed: z.string().nullable(),
	producerName: z.string().nullable(),
	barn: z.string().nullable(),
	breedingValue: z.string().nullable(),
	notes: z.string().nullable(),
	weight: z.number().nullable(),
	score: z.number().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	// 計算フィールド
	daysOld: z.number().nullable(),
	monthsOld: z.number().nullable(),
	age: z.number().nullable(),
	// 繁殖関連情報
	breedingStatus: z
		.object({
			breedingStatusId: z.number(),
			cattleId: z.number(),
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
			createdAt: z.string(),
			updatedAt: z.string()
		})
		.nullable(),
	bloodline: z
		.object({
			bloodlineId: z.number(),
			cattleId: z.number(),
			fatherCattleName: z.string().nullable(),
			motherFatherCattleName: z.string().nullable(),
			motherGrandFatherCattleName: z.string().nullable(),
			motherGreatGrandFatherCattleName: z.string().nullable()
		})
		.nullable(),
	motherInfo: z
		.object({
			motherInfoId: z.number(),
			cattleId: z.number(),
			motherCattleId: z.number(),
			motherName: z.string().nullable(),
			motherIdentificationNumber: z.string().nullable(),
			motherScore: z.number().nullable()
		})
		.nullable(),
	breedingSummary: z
		.object({
			breedingSummaryId: z.number(),
			cattleId: z.number(),
			totalInseminationCount: z.number().nullable(),
			averageDaysOpen: z.number().nullable(),
			averagePregnancyPeriod: z.number().nullable(),
			averageCalvingInterval: z.number().nullable(),
			difficultBirthCount: z.number().nullable(),
			pregnancyHeadCount: z.number().nullable(),
			pregnancySuccessRate: z.number().nullable(),
			createdAt: z.string(),
			updatedAt: z.string()
		})
		.nullable(),
	// イベント情報
	events: z
		.array(
			z.object({
				eventId: z.number(),
				cattleId: z.number(),
				eventType: z.string(),
				eventDatetime: z.string(),
				notes: z.string().nullable(),
				createdAt: z.string(),
				updatedAt: z.string()
			})
		)
		.nullable()
});

export const cattleListResponseSchema = z.object({
	data: z.object({
		results: z.array(cattleResponseSchema),
		total: z.number(),
		hasMore: z.boolean(),
		nextCursor: z.string().nullable()
	})
});

export const cattleStatusCountsResponseSchema = z.object({
	HEALTHY: z.number(),
	PREGNANT: z.number(),
	RESTING: z.number(),
	TREATING: z.number(),
	SCHEDULED_FOR_SHIPMENT: z.number(),
	SHIPPED: z.number(),
	DEAD: z.number()
});

export const cattleStatusUpdateResponseSchema = z.object({
	success: z.boolean(),
	cattleId: z.number(),
	newStatus: z.enum([
		"HEALTHY",
		"PREGNANT",
		"RESTING",
		"TREATING",
		"SCHEDULED_FOR_SHIPMENT",
		"SHIPPED",
		"DEAD"
	])
});
