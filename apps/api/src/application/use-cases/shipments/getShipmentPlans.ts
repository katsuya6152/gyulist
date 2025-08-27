/**
 * Get Shipment Plans Use Case
 *
 * 出荷予定一覧取得ユースケース
 */

import type { ShipmentDomainError } from "../../../domain/errors/shipments/ShipmentErrors";
import type {
	SearchShipmentPlansParams,
	ShipmentPlanRepository
} from "../../../domain/ports/shipments";
import type {
	ShipmentPlan,
	ShipmentPlanListResponse
} from "../../../domain/types/shipments";
import type { Result } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetShipmentPlansDeps = {
	shipmentPlanRepo: ShipmentPlanRepository;
};

/**
 * 検索パラメータの型
 */
export type GetShipmentPlansInput = SearchShipmentPlansParams;

/**
 * 出荷予定一覧取得ユースケースの関数型定義
 */
export type GetShipmentPlansUseCase = (
	deps: GetShipmentPlansDeps
) => (
	input: GetShipmentPlansInput
) => Promise<Result<ShipmentPlanListResponse, ShipmentDomainError>>;

/**
 * 出荷予定一覧取得ユースケース
 *
 * 月別フィルタリング機能を含む出荷予定一覧を取得します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は `ShipmentPlanListResponse`、失敗時は `ShipmentDomainError` を含む `Result`
 */
export const getShipmentPlansUseCase: GetShipmentPlansUseCase =
	(deps) =>
	async (
		input
	): Promise<Result<ShipmentPlanListResponse, ShipmentDomainError>> => {
		// リポジトリから出荷予定一覧を取得
		const result = await deps.shipmentPlanRepo.search(input);

		if (!result.ok) {
			return result;
		}

		// ページネーション情報を構築
		const page = input.page || 1;
		const limit = input.limit || 50;
		const total = result.value.length; // 簡易実装：実際は検索条件を考慮した総件数が必要
		const totalPages = Math.ceil(total / limit);

		// レスポンス形式に変換
		const response: ShipmentPlanListResponse = {
			data: result.value,
			pagination: {
				page,
				limit,
				total,
				totalPages
			}
		};

		return { ok: true, value: response };
	};
