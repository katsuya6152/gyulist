/**
 * KPI HTTP Controller
 *
 * KPI管理のHTTPエンドポイントを処理
 */

import type { Context } from "hono";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import type { UserId } from "../../../shared/brand";
import { isErr } from "../../../shared/result";

/**
 * KPI Controller Class
 *
 * KPI関連のHTTPリクエストを処理し、適切なユースケースに委譲します
 */
export class KpiController {
	constructor(private deps: Dependencies) {}

	/**
	 * 繁殖KPIを取得
	 * GET /kpi/breeding
	 */
	async getBreedingKpi(c: Context) {
		try {
			const userId = c.get("jwtPayload")?.userId as UserId;
			if (!userId) {
				return c.json({ error: "Unauthorized" }, 401);
			}

			// 簡易実装 - 実際にはクエリパラメータから期間を取得
			const result = await this.deps.useCases.getBreedingKpiUseCase({
				ownerUserId: userId,
				fromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
				toDate: new Date()
			});

			if (isErr(result)) {
				return c.json({ error: result.error.message }, 500);
			}

			return c.json(result.value);
		} catch (error) {
			console.error("Error in getBreedingKpi:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}

	/**
	 * 繁殖KPIトレンドを取得
	 * GET /kpi/breeding/trends
	 */
	async getBreedingTrends(c: Context) {
		try {
			const userId = c.get("jwtPayload")?.userId as UserId;
			if (!userId) {
				return c.json({ error: "Unauthorized" }, 401);
			}

			// 簡易実装 - 実際にはクエリパラメータから期間を取得
			const result = await this.deps.useCases.getBreedingTrendsUseCase({
				ownerUserId: userId,
				fromMonth: "2024-01",
				toMonth: "2024-12",
				months: 12
			});

			if (isErr(result)) {
				return c.json({ error: result.error.message }, 500);
			}

			return c.json(result.value);
		} catch (error) {
			console.error("Error in getBreedingTrends:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}

	/**
	 * 繁殖メトリクスを計算
	 * POST /kpi/breeding/calculate
	 */
	async calculateBreedingMetrics(c: Context) {
		try {
			const userId = c.get("jwtPayload")?.userId as UserId;
			if (!userId) {
				return c.json({ error: "Unauthorized" }, 401);
			}

			// 簡易実装 - 実際にはリクエストボディから期間を取得
			const result = await this.deps.useCases.calculateBreedingMetricsUseCase({
				ownerUserId: userId,
				fromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
				toDate: new Date()
			});

			if (isErr(result)) {
				return c.json({ error: result.error.message }, 500);
			}

			return c.json(result.value);
		} catch (error) {
			console.error("Error in calculateBreedingMetrics:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
}
