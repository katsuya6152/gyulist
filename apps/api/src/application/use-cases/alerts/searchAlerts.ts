/**
 * Search Alerts Use Case
 *
 * アラートの検索・フィルタリングユースケース
 */

import type { AlertError } from "../../../domain/errors/alerts/AlertErrors";
import type { AlertRepository } from "../../../domain/ports/alerts";
import type {
	AlertSearchCriteria,
	AlertSearchResult
} from "../../../domain/types/alerts";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type SearchAlertsDeps = {
	alertRepo: AlertRepository;
};

/**
 * 検索コマンドの型
 */
export type SearchAlertsInput = AlertSearchCriteria;

/**
 * アラート検索ユースケースの関数型定義
 */
export type SearchAlertsUseCase = (
	deps: SearchAlertsDeps
) => (
	input: SearchAlertsInput
) => Promise<Result<AlertSearchResult, AlertError>>;

/**
 * アラートの検索・フィルタリングユースケース
 *
 * 指定された条件でアラートを検索し、ページング対応の結果を返します。
 * 複数の条件での絞り込みに対応しています。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const searchAlertsUseCase: SearchAlertsUseCase =
	(deps: SearchAlertsDeps) =>
	async (
		input: SearchAlertsInput
	): Promise<Result<AlertSearchResult, AlertError>> => {
		try {
			// 検索条件の正規化
			const normalizedCriteria: AlertSearchCriteria = {
				...input,
				limit: Math.min(100, Math.max(1, input.limit || 20)) // 1-100の範囲で制限
			};

			const result = await deps.alertRepo.search(normalizedCriteria);
			return result;
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to search alerts",
				cause
			});
		}
	};
