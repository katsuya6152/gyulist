/**
 * Shipment Database Mapper
 *
 * 出荷ドメインエンティティとデータベースレコード間の変換を行うマッパー
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
	shipmentPlans as ShipmentPlansTable,
	shipments as ShipmentsTable
} from "../../../db/schema";
import type { Shipment, ShipmentPlan } from "../../../domain/types/shipments";
import type {
	Buyer,
	PlannedShipmentMonth,
	ShipmentAge,
	ShipmentDate,
	ShipmentId,
	ShipmentNotes,
	ShipmentPlanId,
	ShipmentPrice,
	ShipmentWeight
} from "../../../domain/types/shipments/ShipmentTypes";
import type { CattleId } from "../../../shared/brand";

/**
 * 出荷データベースマッパー
 */
export const shipmentDbMapper = {
	/**
	 * データベースレコードからドメインエンティティへの変換
	 */
	fromDb(row: InferSelectModel<typeof ShipmentsTable>): Shipment {
		return {
			shipmentId: row.shipmentId as ShipmentId,
			cattleId: row.cattleId as unknown as CattleId,
			shipmentDate: row.shipmentDate as ShipmentDate,
			price: row.price as ShipmentPrice,
			weight: row.weight as ShipmentWeight | null,
			ageAtShipment: row.ageAtShipment as ShipmentAge | null,
			buyer: row.buyer as Buyer | null,
			notes: row.notes as ShipmentNotes | null,
			createdAt: new Date(row.createdAt || new Date()),
			updatedAt: new Date(row.updatedAt || new Date())
		};
	},

	/**
	 * ドメインエンティティからデータベースレコードへの変換
	 */
	toDb(shipment: Shipment): InferInsertModel<typeof ShipmentsTable> {
		return {
			shipmentId: shipment.shipmentId,
			cattleId: shipment.cattleId as unknown as number,
			shipmentDate: shipment.shipmentDate,
			price: shipment.price as unknown as number,
			weight: shipment.weight as unknown as number | null,
			ageAtShipment: shipment.ageAtShipment as unknown as number | null,
			buyer: shipment.buyer as string | null,
			notes: shipment.notes as string | null,
			createdAt: shipment.createdAt.toISOString(),
			updatedAt: shipment.updatedAt.toISOString()
		};
	}
};

/**
 * 出荷予定データベースマッパー
 */
export const shipmentPlanDbMapper = {
	/**
	 * データベースレコードからドメインエンティティへの変換
	 */
	fromDb(row: InferSelectModel<typeof ShipmentPlansTable>): ShipmentPlan {
		return {
			planId: row.planId as ShipmentPlanId,
			cattleId: row.cattleId as unknown as CattleId,
			plannedShipmentMonth: row.plannedShipmentMonth as PlannedShipmentMonth,
			createdAt: new Date(row.createdAt || new Date()),
			updatedAt: new Date(row.updatedAt || new Date())
		};
	},

	/**
	 * ドメインエンティティからデータベースレコードへの変換
	 */
	toDb(plan: ShipmentPlan): InferInsertModel<typeof ShipmentPlansTable> {
		return {
			planId: plan.planId,
			cattleId: plan.cattleId as unknown as number,
			plannedShipmentMonth: plan.plannedShipmentMonth,
			createdAt: plan.createdAt.toISOString(),
			updatedAt: plan.updatedAt.toISOString()
		};
	}
};
