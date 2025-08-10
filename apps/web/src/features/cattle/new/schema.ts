import { z } from "zod";

export const bloodlineSchema = z.object({
	fatherCattleName: z.string().optional(),
	motherFatherCattleName: z.string().optional(),
	motherGrandFatherCattleName: z.string().optional(),
	motherGreatGrandFatherCattleName: z.string().optional(),
});

export const motherInfoSchema = z.object({
	motherCattleId: z.coerce.number().min(1, "母牛IDは必須です"),
	motherName: z.string().optional(),
	motherIdentificationNumber: z.string().optional(),
	motherScore: z.coerce.number().optional(),
});

export const breedingStatusSchema = z.object({
	expectedCalvingDate: z.string().optional(),
	scheduledPregnancyCheckDate: z.string().optional(),
	breedingMemo: z.string().optional(),
	isDifficultBirth: z.coerce.boolean().optional(),
});

const baseSchema = z.object({
	identificationNumber: z.coerce.number().min(1, "個体識別番号は必須です"),
	earTagNumber: z.coerce.number().min(1, "耳標番号は必須です"),
	name: z.string().min(1, "名号は必須です"),
	gender: z.string().min(1, "性別は必須です"),
	birthday: z.string().min(1, "生年月日は必須です"),
	breed: z.string().optional(),
	notes: z.string().optional(),
	bloodline: bloodlineSchema.optional(),
});

export const createCalfSchema = baseSchema.extend({
	growthStage: z.enum(["CALF", "GROWING", "FATTENING"], {
		required_error: "成長段階は必須です",
	}),
	motherInfo: motherInfoSchema,
});

export const createBreedingCowSchema = baseSchema.extend({
	growthStage: z.enum(["FIRST_CALVED", "MULTI_PAROUS"], {
		required_error: "成長段階は必須です",
	}),
	breedingStatus: breedingStatusSchema.optional(),
});

export const createCattleSchema = z.discriminatedUnion("growthStage", [
	createCalfSchema,
	createBreedingCowSchema,
]);
