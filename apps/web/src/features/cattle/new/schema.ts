import { z } from "zod";

export const createCattleSchema = z.object({
	identificationNumber: z.number({
		required_error: "個体識別番号を入力してください",
		invalid_type_error: "個体識別番号は数字のみで入力してください",
	}),
	earTagNumber: z.number({
		required_error: "耳標番号を入力してください",
		invalid_type_error: "耳標番号は数字のみで入力してください",
	}),
	name: z.string({ required_error: "名号を入力してください" }),
	gender: z.enum(["オス", "メス"], {
		required_error: "性別を選択してください",
	}),
	birthDate: z.string({ required_error: "出生日を入力してください" }).date(),
	growthStage: z.enum(
		["CALF", "GROWING", "FATTENING", "FIRST_CALVED", "MULTI_PAROUS"],
		{
			required_error: "成長段階を選択してください",
		},
	),
	breed: z.string().optional(),
	notes: z.string().optional(),
});
