import { STATUSES, STATUS_LABELS, type Status } from "@repo/api";

export const statusOptions = STATUSES.map((value) => ({
	value: value as Status,
	label: STATUS_LABELS[value as Status]
}));

export const statusLabelMap: Record<Status, string> = STATUS_LABELS;

export type { Status } from "@repo/api";
