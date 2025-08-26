import type { cattleResponseSchema } from "@repo/api";
import {
	GENDERS,
	GENDER_LABELS,
	GROWTH_STAGES,
	GROWTH_STAGE_LABELS
} from "@repo/api";
import { z } from "zod";
import { statusOptions } from "../constants";

export type CattleListItem = typeof cattleResponseSchema._type;

export const filterOptions = [
	...GROWTH_STAGES.map((id) => ({
		id,
		label: GROWTH_STAGE_LABELS[id]
	})),
	...GENDERS.map((id) => ({ id, label: GENDER_LABELS[id] }))
] as const;

export const sortOptions = [
	{ id: "id", label: "ID" },
	{ id: "name", label: "名前" },
	{ id: "days_old", label: "日齢" },
	{ id: "days_open", label: "空胎日数" }
] as const;

export const FormSchema = z.object({
	growth_stage: z.array(z.string()),
	gender: z.array(z.string()),
	status: z.array(z.string()),
	has_alert: z.enum(["all", "true", "false"]).optional()
});

export type FilterFormData = z.infer<typeof FormSchema>;
export { statusOptions };
