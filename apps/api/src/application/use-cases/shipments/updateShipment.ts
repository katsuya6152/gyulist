/**
 * 出荷実績更新のUse Case
 */

import type { ShipmentDomainError } from "../../../domain/errors/shipments/ShipmentErrors";
import {
	createInvalidShipmentDataError,
	createShipmentNotFoundError
} from "../../../domain/errors/shipments/ShipmentErrors";
import type { CattleRepository } from "../../../domain/ports/cattle";
import type { ShipmentRepository } from "../../../domain/ports/shipments";
import type {
	Buyer,
	Shipment,
	ShipmentAge,
	ShipmentDate,
	ShipmentId,
	ShipmentNotes,
	ShipmentPrice,
	ShipmentWeight
} from "../../../domain/types/shipments";
import type { UserId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err } from "../../../shared/result";

/**
 * 出荷実績更新の依存関係
 */
export type UpdateShipmentDeps = {
	shipmentRepo: ShipmentRepository;
	cattleRepo: CattleRepository;
};

/**
 * 出荷実績更新の入力
 */
export type UpdateShipmentInput = {
	shipmentId: string;
	userId: UserId;
	shipmentDate: string;
	price: number;
	weight: number | null;
	ageAtShipment: number | null;
	buyer: string | null;
	notes: string | null;
};

/**
 * 出荷実績更新のUse Case型
 */
export type UpdateShipmentUseCase = (
	deps: UpdateShipmentDeps
) => (
	input: UpdateShipmentInput
) => Promise<Result<Shipment, ShipmentDomainError>>;

/**
 * 出荷実績更新のUse Case実装
 */
export const updateShipmentUseCase: UpdateShipmentUseCase =
	(deps) =>
	async (input): Promise<Result<Shipment, ShipmentDomainError>> => {
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
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to find cattle: ${cattleResult.error.message}`,
				field: "cattleId"
			});
		}

		const cattle = cattleResult.value;
		if (!cattle) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: "Cattle not found",
				field: "cattleId"
			});
		}

		if (cattle.ownerUserId !== input.userId) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message:
					"Access denied: You can only update shipments for your own cattle",
				field: "userId"
			});
		}

		// 出荷実績を更新
		const updateData = {
			shipmentDate: input.shipmentDate as ShipmentDate,
			price: input.price as ShipmentPrice,
			weight: input.weight as ShipmentWeight,
			ageAtShipment: input.ageAtShipment as ShipmentAge,
			buyer: input.buyer as Buyer,
			notes: input.notes as ShipmentNotes
		};

		return await deps.shipmentRepo.update(input.shipmentId, updateData);
	};
