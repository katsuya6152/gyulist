import type { GetCattleListResType } from "@/services/cattleService";
import { z } from "zod";

export type CattleListItem = GetCattleListResType["results"][0];

export const growthStageOptions = [
	{ id: "CALF", label: "仔牛" },
	{ id: "GROWING", label: "育成牛" },
	{ id: "FATTENING", label: "肥育牛" },
	{ id: "FIRST_CALVED", label: "初産牛" },
	{ id: "MULTI_PAROUS", label: "経産牛" },
] as const;

export const genderOptions = [
	{ id: "オス", label: "オス" },
	{ id: "メス", label: "メス" },
] as const;

export const statusOptions = [
	{ id: "HEALTHY", label: "健康" },
	{ id: "PREGNANT", label: "妊娠中" },
	{ id: "RESTING", label: "休息中" },
	{ id: "TREATING", label: "治療中" },
] as const;

export const sortOptions = [
	{ id: "id", label: "ID" },
	{ id: "name", label: "名前" },
	{ id: "days_old", label: "日齢" },
] as const;

export const FormSchema = z.object({
	growth_stage: z.array(z.string()),
	gender: z.array(z.string()),
	status: z.array(z.string()),
});

export type FilterFormData = z.infer<typeof FormSchema>;
