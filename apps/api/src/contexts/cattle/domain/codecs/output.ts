import { z } from "zod";
import { eventSchema } from "../../../events/domain/codecs/output";

// 血統情報スキーマ
const bloodlineSchema = z.object({
	bloodlineId: z.number(),
	cattleId: z.number(),
	fatherCattleName: z.string().nullable(),
	motherFatherCattleName: z.string().nullable(),
	motherGrandFatherCattleName: z.string().nullable(),
	motherGreatGrandFatherCattleName: z.string().nullable()
});

// 母情報スキーマ
const motherInfoSchema = z.object({
	motherInfoId: z.number(),
	cattleId: z.number(),
	motherCattleId: z.number(),
	motherName: z.string().nullable(),
	motherIdentificationNumber: z.number().nullable(),
	motherScore: z.number().nullable()
});

// 繁殖状態スキーマ
const breedingStatusSchema = z.object({
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
});

// 繁殖統計スキーマ
const breedingSummarySchema = z.object({
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
});

const cattleSchema = z.object({
	cattleId: z.number(),
	ownerUserId: z.number(),
	identificationNumber: z.number().optional(),
	earTagNumber: z.number().nullable(),
	name: z.string().nullable(),
	gender: z.string().nullable(),
	birthday: z.string().nullable(),
	growthStage: z.string().nullable(),
	age: z.number().nullable(),
	monthsOld: z.number().nullable(),
	daysOld: z.number().nullable(),
	breed: z.string().nullable(),
	status: z.string().nullable(),
	producerName: z.string().nullable(),
	barn: z.string().nullable(),
	breedingValue: z.string().nullable(),
	notes: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string()
});

export const cattleListResponseSchema = z.object({
	results: z.array(cattleSchema),
	next_cursor: z.string().nullable(),
	has_next: z.boolean()
});

export const cattleStatusCountsResponseSchema = z.object({
	counts: z.record(z.number())
});

// 牛の詳細レスポンス（イベント、血統、繁殖情報を含む）
export const cattleResponseSchema = cattleSchema.extend({
	events: z.array(eventSchema).optional(),
	bloodline: bloodlineSchema.nullable().optional(),
	motherInfo: motherInfoSchema.nullable().optional(),
	breedingStatus: breedingStatusSchema.nullable().optional(),
	breedingSummary: breedingSummarySchema.nullable().optional()
});
export const cattleStatusUpdateResponseSchema = cattleSchema;
