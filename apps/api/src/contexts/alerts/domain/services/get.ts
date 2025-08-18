import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AlertsRepoPort, RawAlertRow } from "../../ports";
import type { AlertsDomainError } from "../errors";
import { toUserId } from "../model";
import type { Alert } from "../model/alert";
import { generateAlerts } from "./alertGenerator";

// ============================================================================
// コマンドと依存関係
// ============================================================================

export type GetAlertsCmd = {
	ownerUserId: number;
	now: () => Date;
};

export type GetAlertsDeps = {
	repo: AlertsRepoPort;
	id: { uuid(): string };
	time: { nowSeconds(): number };
};

// ============================================================================
// 結果型
// ============================================================================

export type GetAlertsResult = {
	results: Alert[];
	total: number;
	summary: {
		high: number;
		medium: number;
		low: number;
		urgent: number;
	};
};

// ============================================================================
// ドメインサービス
// ============================================================================

/**
 * アラート取得のユースケース（後方互換性のため）
 */
export const getAlerts =
	(deps: GetAlertsDeps) =>
	async (
		cmd: GetAlertsCmd
	): Promise<Result<GetAlertsResult, AlertsDomainError>> => {
		try {
			// 新しいアラート生成サービスを使用
			const alertGenerator = generateAlerts(deps);
			const result = await alertGenerator({
				ownerUserId: toUserId(cmd.ownerUserId),
				now: cmd.now
			});

			if (!result.ok) {
				return result;
			}

			return ok({
				results: result.value.alerts,
				total: result.value.total,
				summary: result.value.summary
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "アラートの取得に失敗しました",
				cause
			});
		}
	};
