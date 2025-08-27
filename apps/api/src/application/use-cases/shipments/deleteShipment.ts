/**
 * 出荷実績削除のUse Case
 */

import type { ShipmentDomainError } from "../../../domain/errors/shipments/ShipmentErrors";
import {
	createInvalidShipmentDataError,
	createShipmentNotFoundError
} from "../../../domain/errors/shipments/ShipmentErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { ShipmentRepository } from "../../../domain/ports/shipments";
import type { ShipmentId } from "../../../domain/types/shipments";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err } from "../../../shared/result";

/**
 * 出荷実績削除の依存関係
 */
export type DeleteShipmentDeps = {
	shipmentRepo: ShipmentRepository;
	cattleRepo: CattleRepository;
};

/**
 * 出荷実績削除の入力
 */
export type DeleteShipmentInput = {
	shipmentId: string;
	userId: UserId;
};

/**
 * 出荷実績削除のUse Case型
 */
export type DeleteShipmentUseCase = (
	deps: DeleteShipmentDeps
) => (input: DeleteShipmentInput) => Promise<Result<void, ShipmentDomainError>>;

/**
 * 出荷実績削除のUse Case実装
 */
export const deleteShipmentUseCase: DeleteShipmentUseCase =
	(deps) =>
	async (input): Promise<Result<void, ShipmentDomainError>> => {
		// 既存の出荷実績を取得して所有者確認
		const existingResult = await deps.shipmentRepo.findById(input.shipmentId);
		if (!existingResult.ok) {
			return existingResult;
		}

		const existingShipment = existingResult.value;
		if (!existingShipment) {
			return err(createShipmentNotFoundError(input.shipmentId as ShipmentId));
		}

		// 牛の所有者確認（セキュリティ）
		const cattleResult = await deps.cattleRepo.findById(
			existingShipment.cattleId
		);
		if (!cattleResult.ok) {
			return err(
				createInvalidShipmentDataError(
					"cattleId",
					`Failed to find cattle: ${cattleResult.error.message}`,
					existingShipment.cattleId
				)
			);
		}

		const cattle = cattleResult.value;
		if (!cattle) {
			return err(
				createInvalidShipmentDataError(
					"cattleId",
					"Cattle not found",
					existingShipment.cattleId
				)
			);
		}

		if (cattle.ownerUserId !== input.userId) {
			return err(
				createInvalidShipmentDataError(
					"userId",
					"Access denied: You can only delete shipments for your own cattle",
					input.userId
				)
			);
		}

		// 出荷実績を削除
		return await deps.shipmentRepo.delete(input.shipmentId);
	};
