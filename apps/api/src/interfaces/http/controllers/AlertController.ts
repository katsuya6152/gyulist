/**
 * Alert HTTP Controller
 *
 * アラート管理のHTTPエンドポイントを処理するコントローラー
 */

import type { Context } from "hono";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import type { AlertId } from "../../../shared/brand";
import { executeUseCase } from "../../../shared/http/route-helpers";
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
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);

			const getAlertsUseCase = deps.useCases.getAlertsUseCase;
			const result = await getAlertsUseCase({ ownerUserId: userId });

			return result;
		});
	},

	/**
	 * アラートステータス更新
	 */
	async updateAlertStatus(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
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

			return result;
		});
	},

	/**
	 * アラートメモ更新
	 */
	async updateAlertMemo(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
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

			return result;
		});
	}
});
