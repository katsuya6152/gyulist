import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../auth/domain/errors";

import type { KpiRepoPort } from "../../ports";

export type TrendPoint = {
	month: string;
	metrics: Record<string, number | null>;
	counts: Record<string, number>;
};
export type TrendDelta = {
	month: string;
	metrics: Record<string, number | null>;
};

export type Repo = KpiRepoPort;

export const getBreedingKpiDelta =
	(repo: Repo) =>
	async (
		ownerUserId: number,
		params: { month?: string }
	): Promise<
		Result<
			{ month: string | null; delta: Record<string, number | null> },
			DomainError
		>
	> => {
		try {
			const toMonth = params.month;
			const trends = await repo.getBreedingKpiTrends(ownerUserId, {
				toMonth,
				months: 2
			});
			const last = trends.deltas.at(-1);
			if (!last) {
				return ok({
					month: null,
					delta: {
						conceptionRate: null,
						avgDaysOpen: null,
						avgCalvingInterval: null,
						aiPerConception: null
					}
				});
			}
			return ok({ month: last.month, delta: last.metrics });
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to get KPI delta",
				cause
			});
		}
	};
