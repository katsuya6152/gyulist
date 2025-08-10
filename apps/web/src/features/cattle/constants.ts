export const statusOptions = [
	{ value: "HEALTHY", label: "健康" },
	{ value: "PREGNANT", label: "妊娠中" },
	{ value: "RESTING", label: "休息中" },
	{ value: "TREATING", label: "治療中" },
	{ value: "SHIPPED", label: "出荷済" },
	{ value: "DEAD", label: "死亡" },
] as const;

export type CattleStatus = (typeof statusOptions)[number]["value"];

export const statusLabelMap: Record<CattleStatus, string> =
	statusOptions.reduce(
		(acc, cur) => {
			acc[cur.value] = cur.label;
			return acc;
		},
		{} as Record<CattleStatus, string>,
	);
