import { GROWTH_STAGES_TUPLE } from "@repo/api";
import { z } from "zod";

const preprocessOptional = (v: unknown) =>
	v === "" || v == null ? undefined : v;

// 血統情報のスキーマ
export const bloodlineSchema = z.object({
	fatherCattleName: z.string().optional(),
	motherFatherCattleName: z.string().optional(),
	motherGrandFatherCattleName: z.string().optional(),
	motherGreatGrandFatherCattleName: z.string().optional()
});

// 繁殖状態のスキーマ
export const breedingStatusSchema = z.object({
	expectedCalvingDate: z.string().optional(),
	scheduledPregnancyCheckDate: z.string().optional(),
	breedingMemo: z.string().optional(),
	isDifficultBirth: z.coerce.boolean().optional()
});

// 更新用のスキーマ（UI前処理 -> API仕様にパイプ）
const uiUpdateCattleSchema = z.object({
	identificationNumber: z.coerce.number().min(1, "個体識別番号は必須です"),
	earTagNumber: z.coerce.number().min(1, "耳標番号は必須です"),
	name: z.string().min(1, "名号は必須です"),
	gender: z.string().min(1, "性別は必須です"),
	birthday: z.string().min(1, "生年月日は必須です"),
	growthStage: z.enum(GROWTH_STAGES_TUPLE, {
		required_error: "成長段階は必須です"
	}),
	weight: z.preprocess(preprocessOptional, z.coerce.number().min(0).optional()),
	breed: z.string().optional(),
	score: z.preprocess(preprocessOptional, z.coerce.number().optional()),
	producerName: z.preprocess(preprocessOptional, z.string().optional()),
	barn: z.preprocess(preprocessOptional, z.string().optional()),
	breedingValue: z.preprocess(preprocessOptional, z.string().optional()),
	notes: z.string().optional(),
	bloodline: bloodlineSchema.optional(),
	breedingStatus: breedingStatusSchema.optional()
});

export const updateCattleSchema = uiUpdateCattleSchema;
