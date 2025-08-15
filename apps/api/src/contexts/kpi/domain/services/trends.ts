import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../auth/domain/errors";
import type { KpiRepoPort } from "../../ports";

export type TrendDelta = {
	month: string; // YYYY-MM
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
};

export type TrendPoint = {
	month: string; // YYYY-MM
	metrics: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
	counts: Record<string, number>;
};

export const getBreedingKpiTrends =
	(repo: KpiRepoPort) =>
	async (
		ownerUserId: number,
		params: { fromMonth?: string; toMonth?: string; months?: number }
	): Promise<
		Result<{ series: TrendPoint[]; deltas: TrendDelta[] }, DomainError>
	> => {
		try {
			const res = await repo.getBreedingKpiTrends(ownerUserId, params);
			return ok(res);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to get KPI trends",
				cause
			});
		}
	};
