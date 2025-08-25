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
	name: z.string(),
	identificationNumber: z.number(),
	earTagNumber: z.number(),
	gender: z.enum(["雄", "去勢", "雌"]),
	growthStage: z.enum([
		"CALF",
		"GROWING",
		"FATTENING",
		"FIRST_CALVED",
		"MULTI_PAROUS"
	]),
	status: z.enum([
		"HEALTHY",
		"PREGNANT",
		"RESTING",
		"TREATING",
		"SCHEDULED_FOR_SHIPMENT",
		"SHIPPED",
		"DEAD"
	]),
	age: z.number(),
	monthsOld: z.number(),
	daysOld: z.number()
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
