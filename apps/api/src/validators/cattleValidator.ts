import { z } from "zod";

// 基本フィールドのスキーマ（入力用）
const cattleBaseSchema = {
	ownerUserId: z.number(),
	identificationNumber: z.number(),
	earTagNumber: z.number().nullable(),
	name: z.string().nullable(),
	growthStage: z
		.enum(["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"])
		.nullable(),
	birthday: z.string().nullable(),
	gender: z.string().nullable(),
	score: z.number().nullable(),
	healthStatus: z.string().nullable(),
	producerName: z.string().nullable(),
	barn: z.string().nullable(),
	breedingValue: z.string().nullable(),
	notes: z.string().nullable(),
};

// 年齢関連フィールドのスキーマ
const ageFieldsSchema = {
	age: z.number().nullable(),
	monthsOld: z.number().nullable(),
	daysOld: z.number().nullable(),
};

// 入力用のスキーマ（年齢関連フィールドを含まない）
export const createCattleSchema = z.object(cattleBaseSchema);

// 更新用のスキーマ（年齢関連フィールドを含まない）
export const updateCattleSchema = z.object(cattleBaseSchema).partial();

// データベース用のスキーマ（年齢関連フィールドを含む）
export const cattleSchema = z.object({
	...cattleBaseSchema,
	...ageFieldsSchema,
});

export type CreateCattleInput = z.infer<typeof createCattleSchema>;
export type UpdateCattleInput = z.infer<typeof updateCattleSchema>;
export type Cattle = z.infer<typeof cattleSchema>;
