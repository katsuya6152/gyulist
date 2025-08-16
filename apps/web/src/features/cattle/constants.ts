import {
	CATTLE_STATUS,
	CATTLE_STATUS_LABELS,
	type CattleStatus
} from "@repo/api";

export const statusOptions = CATTLE_STATUS.map((value) => ({
	value: value as CattleStatus,
	label: CATTLE_STATUS_LABELS[value as CattleStatus]
}));

export const statusLabelMap: Record<CattleStatus, string> =
	CATTLE_STATUS_LABELS;

export type { CattleStatus } from "@repo/api";
