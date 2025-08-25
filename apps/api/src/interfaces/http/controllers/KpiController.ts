/**
 * KPI HTTP Controller
 *
 * KPI管理のHTTPエンドポイントを処理するコントローラー
 */

import type { Context } from "hono";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import { executeUseCase } from "../../../shared/http/route-helpers";
import { toUserId } from "../../../shared/types/safe-cast";

/**
 * コントローラーの依存関係
 */
export type KpiControllerDeps = Dependencies;

/**
 * KPI管理コントローラー
 */
export const makeKpiController = (deps: KpiControllerDeps) => ({
	/**
	 * 繁殖KPIを取得
	 */
	async getBreedingKpi(c: Context): Promise<Response> {
		return executeUseCase(
			c,
			async () => {
				const jwtPayload = c.get("jwtPayload");
				const userId = toUserId(jwtPayload.userId);

				// クエリパラメータから日付を取得
				const fromQuery = c.req.query("from");
				const toQuery = c.req.query("to");

				const fromDate = fromQuery
					? new Date(fromQuery)
					: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
				const toDate = toQuery ? new Date(toQuery) : new Date();

				const getBreedingKpiUseCase = deps.useCases.getBreedingKpiUseCase;
				const result = await getBreedingKpiUseCase({
					ownerUserId: userId,
					fromDate,
					toDate
				});

				return result;
			},
			{ envelope: "data" }
		);
	},

	/**
	 * 繁殖KPIトレンドを取得
	 */
	async getBreedingTrends(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);

			const getBreedingTrendsUseCase = deps.useCases.getBreedingTrendsUseCase;
			const result = await getBreedingTrendsUseCase({
				ownerUserId: userId,
				fromMonth: "2024-01",
				toMonth: "2024-12",
				months: 12
			});

			return result;
		});
	},

	/**
	 * 繁殖KPIデルタを取得
	 */
	async getBreedingKpiDelta(c: Context): Promise<Response> {
		return executeUseCase(
			c,
			async () => {
				const jwtPayload = c.get("jwtPayload");
				const userId = toUserId(jwtPayload.userId);

				const getBreedingKpiDeltaUseCase =
					deps.useCases.getBreedingKpiDeltaUseCase;
				const result = await getBreedingKpiDeltaUseCase({
					ownerUserId: userId,
					fromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
					toDate: new Date()
				});

				return result;
			},
			{ envelope: "data" }
		);
	},

	/**
	 * 繁殖メトリクスを計算
	 */
	async calculateBreedingMetrics(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);

			const calculateBreedingMetricsUseCase =
				deps.useCases.calculateBreedingMetricsUseCase;
			const result = await calculateBreedingMetricsUseCase({
				ownerUserId: userId,
				fromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
				toDate: new Date()
			});

			return result;
		});
	}
});
