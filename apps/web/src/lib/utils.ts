import { GROWTH_STAGE_LABELS, type GrowthStage } from "@repo/api";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getGrowthStage = (growthStage: GrowthStage | null) => {
	if (growthStage === null) {
		return "不明";
	}
	return GROWTH_STAGE_LABELS[growthStage] || "不明";
};
