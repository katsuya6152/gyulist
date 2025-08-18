import type { CattleOutput } from "@repo/api";
import {
	GENDERS,
	GENDER_LABELS,
	GROWTH_STAGES,
	GROWTH_STAGE_LABELS
} from "@repo/api";
import { z } from "zod";
import { statusOptions } from "../constants";

export type CattleListItem = CattleOutput;

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
	{ id: "days_old", label: "日齢" }
] as const;

export const FormSchema = z.object({
	growth_stage: z.array(z.string()),
	gender: z.array(z.string()),
	status: z.array(z.string())
});

export type FilterFormData = z.infer<typeof FormSchema>;
export { statusOptions };
