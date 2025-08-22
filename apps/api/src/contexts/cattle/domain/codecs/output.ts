import { z } from "zod";
import { calculateAgeInfo } from "../../../../shared/utils/data-helpers";
import { eventSchema } from "../../../events/domain/codecs/output";
import {
	GENDERS_TUPLE,
	GROWTH_STAGES_TUPLE,
	STATUSES_TUPLE
} from "../model/types";

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
	motherIdentificationNumber: z.string().nullable(),
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
	createdAt: z.date().transform((date) => date.toISOString()),
	updatedAt: z.date().transform((date) => date.toISOString())
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
	createdAt: z.date().transform((date) => date.toISOString()),
	updatedAt: z.date().transform((date) => date.toISOString())
});

// アラート情報スキーマ
const alertInfoSchema = z.object({
	hasActiveAlerts: z.boolean(),
	alertCount: z.number(),
	highestSeverity: z.enum(["high", "medium", "low"]).nullable()
});

const cattleSchema = z
	.object({
		cattleId: z.number(),
		ownerUserId: z.number(),
		identificationNumber: z.number().optional(),
		earTagNumber: z.number().nullable(),
		name: z.string().nullable(),
		gender: z.enum(GENDERS_TUPLE).nullable(),
		birthday: z
			.date()
			.nullable()
			.transform((date) => date?.toISOString() ?? null),
		growthStage: z.enum(GROWTH_STAGES_TUPLE).nullable(),
		breed: z.string().nullable(),
		status: z.enum(STATUSES_TUPLE).nullable(),
		producerName: z.string().nullable(),
		barn: z.string().nullable(),
		breedingValue: z.string().nullable(),
		notes: z.string().nullable(),
		weight: z.number().nullable(),
		score: z.number().nullable(),
		createdAt: z.date().transform((date) => date.toISOString()),
		updatedAt: z.date().transform((date) => date.toISOString()),
		alerts: alertInfoSchema
	})
	.transform((data) => {
		// 誕生日から年齢情報を計算して追加
		const ageInfo = data.birthday
			? calculateAgeInfo(new Date(data.birthday))
			: { age: null, monthsOld: null, daysOld: null };

		return {
			...data,
			...ageInfo
		};
	});

export const cattleListResponseSchema = z.object({
	results: z.array(cattleSchema),
	next_cursor: z.string().nullable(),
	has_next: z.boolean()
});

export const cattleStatusCountsResponseSchema = z.object({
	counts: z.record(z.number())
});

export const cattleDetailResponseSchema = z.object({
	cattle: cattleSchema,
	bloodline: bloodlineSchema.nullable(),
	motherInfo: motherInfoSchema.nullable(),
	breedingStatus: breedingStatusSchema.nullable(),
	breedingSummary: breedingSummarySchema.nullable(),
	events: z.array(eventSchema)
});

export const cattleDetailEnvelopeSchema = z.object({
	data: cattleDetailResponseSchema
});

export const cattleListEnvelopeSchema = z.object({
	data: cattleListResponseSchema
});

export const cattleEnvelopeSchema = z.object({
	data: cattleSchema
});

export const cattleStatusCountsEnvelopeSchema = z.object({
	data: cattleStatusCountsResponseSchema
});

// 牛の詳細レスポンス（イベント、血統、繁殖情報を含む）
export const cattleResponseSchema = z
	.object({
		cattleId: z.number(),
		ownerUserId: z.number(),
		identificationNumber: z.number().optional(),
		earTagNumber: z.number().nullable(),
		name: z.string().nullable(),
		gender: z.enum(GENDERS_TUPLE).nullable(),
		birthday: z
			.date()
			.nullable()
			.transform((date) => date?.toISOString() ?? null),
		growthStage: z.enum(GROWTH_STAGES_TUPLE).nullable(),
		breed: z.string().nullable(),
		status: z.enum(STATUSES_TUPLE).nullable(),
		producerName: z.string().nullable(),
		barn: z.string().nullable(),
		breedingValue: z.string().nullable(),
		notes: z.string().nullable(),
		weight: z.number().nullable(),
		score: z.number().nullable(),
		createdAt: z.date().transform((date) => date.toISOString()),
		updatedAt: z.date().transform((date) => date.toISOString()),
		alerts: alertInfoSchema.optional().default({
			hasActiveAlerts: false,
			alertCount: 0,
			highestSeverity: null
		}),
		events: z.array(eventSchema).optional(),
		bloodline: bloodlineSchema.nullable().optional(),
		motherInfo: motherInfoSchema.nullable().optional(),
		breedingStatus: breedingStatusSchema.nullable().optional(),
		breedingSummary: breedingSummarySchema.nullable().optional()
	})
	.transform((data) => {
		// 誕生日から年齢情報を計算して追加
		const ageInfo = data.birthday
			? calculateAgeInfo(new Date(data.birthday))
			: { age: null, monthsOld: null, daysOld: null };

		return {
			...data,
			...ageInfo
		};
	});

export const cattleStatusUpdateResponseSchema = cattleSchema;

export type CattleListResponse = z.infer<typeof cattleListResponseSchema>;
export type CattleDetailResponse = z.infer<typeof cattleDetailResponseSchema>;
export type CattleResponse = z.infer<typeof cattleSchema>;
export type CattleStatusCountsResponse = z.infer<
	typeof cattleStatusCountsResponseSchema
>;
export type CattleStatusUpdateResponse = z.infer<
	typeof cattleStatusUpdateResponseSchema
>;
