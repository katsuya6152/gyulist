import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getGrowthStage = (
	growthStage:
		| "CALF"
		| "GROWING"
		| "FATTENING"
		| "FIRST_CALVED"
		| "MULTI_PAROUS"
		| null
) => {
	switch (growthStage) {
		case "CALF":
			return "仔牛";
		case "GROWING":
			return "育成牛";
		case "FATTENING":
			return "肥育牛";
		case "FIRST_CALVED":
			return "初産牛";
		case "MULTI_PAROUS":
			return "経産牛";
		default:
			return "不明";
	}
};
