/**
 * Create Shipment Use Case
 *
 * 出荷実績作成ユースケース
 */

import type { ShipmentDomainError } from "../../../domain/errors/shipments/ShipmentErrors";
import { createShipment } from "../../../domain/functions/shipments";
import type { ShipmentRepository } from "../../../domain/ports/shipments";
import type {
	NewShipmentProps,
	Shipment
} from "../../../domain/types/shipments";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type CreateShipmentDeps = {
	shipmentRepo: ShipmentRepository;
	clock: ClockPort;
};

/**
 * 新規作成コマンドの型
 */
export type CreateShipmentInput = NewShipmentProps;

/**
 * 出荷作成ユースケースの関数型定義
 */
export type CreateShipmentUseCase = (
	deps: CreateShipmentDeps
) => (
	input: CreateShipmentInput
) => Promise<Result<Shipment, ShipmentDomainError>>;

/**
 * 出荷実績の新規作成ユースケース
 *
 * 入力コマンドの検証（ドメインファクトリ内のバリデーションを含む）を行い、
 * リポジトリへ保存して作成結果を返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は作成された `Shipment`、失敗時は `ShipmentDomainError` を含む `Result`
 */
export const createShipmentUseCase: CreateShipmentUseCase =
	(deps) =>
	async (input): Promise<Result<Shipment, ShipmentDomainError>> => {
		// ドメインファクトリで出荷エンティティを作成
		const shipmentResult = createShipment(input);
		if (!shipmentResult.ok) {
			return shipmentResult;
		}

		// リポジトリに保存
		const saveResult = await deps.shipmentRepo.save(shipmentResult.value);
		return saveResult;
	};
