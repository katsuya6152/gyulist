import { CATTLE_GROWTH_STAGE_LABELS, type CattleGrowthStage } from "@repo/api";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getGrowthStage = (growthStage: CattleGrowthStage | null) => {
	if (growthStage === null) {
		return "不明";
	}
	return CATTLE_GROWTH_STAGE_LABELS[growthStage] || "不明";
};
