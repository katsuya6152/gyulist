// Cattle statuses
export const CATTLE_STATUS = [
	"HEALTHY",
	"PREGNANT",
	"RESTING",
	"TREATING",
	"SHIPPED",
	"DEAD"
] as const;

export const CATTLE_STATUS_TUPLE = CATTLE_STATUS as unknown as [
	string,
	...string[]
];

export type CattleStatus = (typeof CATTLE_STATUS)[number];

export const CATTLE_STATUS_LABELS: Record<CattleStatus, string> = {
	HEALTHY: "健康",
	PREGNANT: "妊娠中",
	RESTING: "休息中",
	TREATING: "治療中",
	SHIPPED: "出荷済",
	DEAD: "死亡"
};

// Growth stages
export const CATTLE_GROWTH_STAGES = [
	"CALF",
	"GROWING",
	"FATTENING",
	"FIRST_CALVED",
	"MULTI_PAROUS"
] as const;

export const CATTLE_GROWTH_STAGES_TUPLE = CATTLE_GROWTH_STAGES as unknown as [
	string,
	...string[]
];

export type CattleGrowthStage = (typeof CATTLE_GROWTH_STAGES)[number];

export const CATTLE_GROWTH_STAGE_LABELS: Record<CattleGrowthStage, string> = {
	CALF: "仔牛",
	GROWING: "育成牛",
	FATTENING: "肥育牛",
	FIRST_CALVED: "初産牛",
	MULTI_PAROUS: "経産牛"
};

// Genders (kept as-ja values to match current DB)
export const CATTLE_GENDERS = ["オス", "メス"] as const;
export const CATTLE_GENDERS_TUPLE = CATTLE_GENDERS as unknown as [
	string,
	...string[]
];
export type CattleGender = (typeof CATTLE_GENDERS)[number];
export const CATTLE_GENDER_LABELS: Record<CattleGender, string> = {
	オス: "オス",
	メス: "メス"
};

// Sort fields used across API/Web
export const CATTLE_SORT_FIELDS = ["id", "name", "days_old"] as const;
export const CATTLE_SORT_FIELDS_TUPLE = CATTLE_SORT_FIELDS as unknown as [
	string,
	...string[]
];
export type CattleSortField = (typeof CATTLE_SORT_FIELDS)[number];
