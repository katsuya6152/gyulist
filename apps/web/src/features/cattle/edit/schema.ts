import { z } from "zod";

// 血統情報のスキーマ
export const bloodlineSchema = z.object({
	fatherCattleName: z.string().optional(),
	motherFatherCattleName: z.string().optional(),
	motherGrandFatherCattleName: z.string().optional(),
	motherGreatGrandFatherCattleName: z.string().optional(),
});

// 繁殖状態のスキーマ
export const breedingStatusSchema = z.object({
	expectedCalvingDate: z.string().optional(),
	scheduledPregnancyCheckDate: z.string().optional(),
	breedingMemo: z.string().optional(),
	isDifficultBirth: z.coerce.boolean().optional(),
});

// 更新用のスキーマ
export const updateCattleSchema = z.object({
	identificationNumber: z.coerce.number().min(1, "個体識別番号は必須です"),
	earTagNumber: z.coerce.number().min(1, "耳標番号は必須です"),
	name: z.string().min(1, "名号は必須です"),
	gender: z.string().min(1, "性別は必須です"),
	birthday: z.string().min(1, "生年月日は必須です"),
	growthStage: z.enum(
		["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"],
		{
			required_error: "成長段階は必須です",
		},
	),
	breed: z.string().optional(),
	notes: z.string().optional(),
	// 血統情報
	bloodline: bloodlineSchema.optional(),
	// 繁殖情報
	breedingStatus: breedingStatusSchema.optional(),
});
