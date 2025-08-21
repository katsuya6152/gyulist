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

/**
 * アラート取得コマンド。
 *
 * アラートを取得する際に必要な情報を定義します。
 */
export type GetAlertsCmd = {
	/** 所有者ユーザーID */ ownerUserId: number;
	/** 現在時刻取得関数 */ now: () => Date;
};

/**
 * アラート取得の依存関係。
 */
export type GetAlertsDeps = {
	/** アラートリポジトリ */ repo: AlertsRepoPort;
	/** ID生成器 */ id: { uuid(): string };
	/** 時刻取得器 */ time: { nowSeconds(): number };
};

// ============================================================================
// 結果型
// ============================================================================

/**
 * アラート取得結果。
 *
 * アラート一覧と統計情報を含む結果を定義します。
 */
export type GetAlertsResult = {
	/** アラート一覧 */ results: Alert[];
	/** 総件数 */ total: number;
	/** 重要度別統計 */ summary: {
		/** 高重要度 */ high: number;
		/** 中重要度 */ medium: number;
		/** 低重要度 */ low: number;
		/** 緊急 */ urgent: number;
	};
};

// ============================================================================
// ドメインサービス
// ============================================================================

/**
 * アラート取得のユースケース（後方互換性のため）。
 *
 * アラート生成サービスを使用してアラートを取得します。
 * 新しいアラート生成ロジックに委譲し、結果を整形して返します。
 *
 * @param deps - 依存関係
 * @param cmd - アラート取得コマンド
 * @returns 成功時はアラート取得結果、失敗時はドメインエラー
 */
export const getAlerts =
	(deps: GetAlertsDeps) =>
	async (
		cmd: GetAlertsCmd
	): Promise<Result<GetAlertsResult, AlertsDomainError>> => {
		try {
			// 既存のデータベースからアラートを取得
			const existingAlerts = await deps.repo.findActiveAlertsByUserId(
				cmd.ownerUserId
			);

			// 重要度別の統計を計算
			const summary = {
				high: existingAlerts.filter((a) => a.severity === "high").length,
				medium: existingAlerts.filter((a) => a.severity === "medium").length,
				low: existingAlerts.filter((a) => a.severity === "low").length,
				urgent: 0 // 現在は緊急レベルなし
			};

			return ok({
				results: existingAlerts,
				total: existingAlerts.length,
				summary
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "アラートの取得に失敗しました",
				cause
			});
		}
	};
