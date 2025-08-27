/**
 * Get Mother Shipments List Use Case
 *
 * 母牛別出荷実績一覧取得ユースケース
 */

import type { ShipmentDomainError } from "../../../domain/errors/shipments/ShipmentErrors";
import type {
	SearchMotherShipmentsParams,
	ShipmentRepository
} from "../../../domain/ports/shipments";
import type { MotherShipmentListResponse } from "../../../domain/types/shipments";
import type { Result } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type GetMotherShipmentsListDeps = {
	shipmentRepo: ShipmentRepository;
};

/**
 * 検索パラメータの型
 */
export type GetMotherShipmentsListInput = SearchMotherShipmentsParams;

/**
 * 母牛別出荷実績一覧取得ユースケースの関数型定義
 */
export type GetMotherShipmentsListUseCase = (
	deps: GetMotherShipmentsListDeps
) => (
	input: GetMotherShipmentsListInput
) => Promise<Result<MotherShipmentListResponse, ShipmentDomainError>>;

/**
 * 母牛別出荷実績一覧取得ユースケース
 *
 * ページネーション、ソート、フィルタリング機能を含む
 * 母牛別出荷実績一覧を取得します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は `MotherShipmentListResponse`、失敗時は `ShipmentDomainError` を含む `Result`
 */
export const getMotherShipmentsListUseCase: GetMotherShipmentsListUseCase =
	(deps) =>
	async (
		input
	): Promise<Result<MotherShipmentListResponse, ShipmentDomainError>> => {
		// リポジトリから母牛別出荷実績一覧を取得
		return await deps.shipmentRepo.findMotherShipmentsList(input);
	};
