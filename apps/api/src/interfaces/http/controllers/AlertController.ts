/**
 * Alert HTTP Controller
 *
 * アラート管理のHTTPエンドポイントを処理するコントローラー
 */

import type { Context } from "hono";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import type { AlertId } from "../../../shared/brand";
import { toUserId } from "../../../shared/types/safe-cast";

/**
 * コントローラーの依存関係
 */
export type AlertControllerDeps = Dependencies;

/**
 * アラート管理コントローラー
 */
export const makeAlertController = (deps: AlertControllerDeps) => ({
	/**
	 * アラート一覧取得
	 */
	async getAlerts(c: Context): Promise<Response> {
		try {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);

			const getAlertsUseCase = deps.useCases.getAlertsUseCase;
			const result = await getAlertsUseCase({ ownerUserId: userId });

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			return c.json({
				data: {
					results: result.value.results,
					total: result.value.total,
					summary: result.value.summary
				}
			});
		} catch (error) {
			console.error("Get alerts error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	},

	/**
	 * アラートステータス更新
	 */
	async updateAlertStatus(c: Context): Promise<Response> {
		try {
			const alertId = Number.parseInt(
				c.req.param("alertId"),
				10
			) as unknown as AlertId;
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const input = (await c.req.json()) as Record<string, unknown>;

			const updateAlertStatusUseCase = deps.useCases.updateAlertStatusUseCase;
			const result = await updateAlertStatusUseCase({
				alertId,
				newStatus:
					(input.status as
						| "active"
						| "acknowledged"
						| "resolved"
						| "dismissed") || "active",
				requestingUserId: userId
			});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json({
				data: {
					id: result.value.id,
					status: result.value.status,
					memo: result.value.memo || null
				}
			});
		} catch (error) {
			console.error("Update alert status error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	},

	/**
	 * アラートメモ更新
	 */
	async updateAlertMemo(c: Context): Promise<Response> {
		try {
			const alertId = Number.parseInt(
				c.req.param("alertId"),
				10
			) as unknown as AlertId;
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const input = (await c.req.json()) as Record<string, unknown>;

			const updateAlertMemoUseCase = deps.useCases.updateAlertMemoUseCase;
			const result = await updateAlertMemoUseCase({
				alertId,
				memo: input.memo as string,
				requestingUserId: userId
			});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json({
				data: {
					id: alertId,
					memo: input.memo as string
				}
			});
		} catch (error) {
			console.error("Update alert memo error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
});
