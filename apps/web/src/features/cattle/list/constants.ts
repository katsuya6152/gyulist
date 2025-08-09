import type { GetCattleListResType } from "@/services/cattleService";
import { z } from "zod";

export type CattleListItem = GetCattleListResType["results"][0];

export const filterOptions = [
	{
		id: "CALF",
		label: "仔牛",
	},
	{
		id: "GROWING",
		label: "育成牛",
	},
	{
		id: "FATTENING",
		label: "肥育牛",
	},
	{
		id: "FIRST_CALVED",
		label: "初産牛",
	},
	{
		id: "MULTI_PAROUS",
		label: "経産牛",
	},
	{
		id: "オス",
		label: "オス",
	},
	{
		id: "メス",
		label: "メス",
	},
] as const;

export const sortOptions = [
	{ id: "id", label: "ID" },
	{ id: "name", label: "名前" },
	{ id: "days_old", label: "日齢" },
] as const;

export const FormSchema = z.object({
	growth_stage: z.array(z.string()),
	gender: z.array(z.string()),
});

export type FilterFormData = z.infer<typeof FormSchema>;
