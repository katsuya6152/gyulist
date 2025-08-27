/**
 * 出荷実績一覧取得のUse Case
 */

import type { ShipmentDomainError } from "../../../domain/errors/shipments/ShipmentErrors";
import type { ShipmentRepository } from "../../../domain/ports/shipments";
import type { UserId } from "../../../shared/brand";
import type { CattleId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";

/**
 * 出荷実績一覧取得の依存関係
 */
export type GetShipmentsDeps = {
	shipmentRepo: ShipmentRepository;
};

/**
 * 出荷実績一覧取得の入力
 */
export type GetShipmentsInput = {
	userId: UserId;
	from?: string;
	to?: string;
	cattleId?: CattleId;
	page?: number;
	limit?: number;
};

/**
 * 出荷実績一覧取得のUse Case型
 */
export type GetShipmentsUseCase = (deps: GetShipmentsDeps) => (
	input: GetShipmentsInput
) => Promise<
	Result<
		{
			data: {
				shipmentId: string;
				cattleId: number;
				cattleName: string | null;
				shipmentDate: string;
				price: number;
				weight: number | null;
				ageAtShipment: number | null;
				buyer: string | null;
				notes: string | null;
			}[];
			pagination: {
				page: number;
				limit: number;
				total: number;
				totalPages: number;
			};
			summary: {
				totalShipments: number;
				totalRevenue: number;
				averagePrice: number;
				averageWeight: number;
				averageAge: number;
			};
		},
		ShipmentDomainError
	>
>;

/**
 * 出荷実績一覧取得のUse Case実装
 */
export const getShipmentsUseCase: GetShipmentsUseCase =
	(deps) =>
	async (
		input
	): Promise<
		Result<
			{
				data: {
					shipmentId: string;
					cattleId: number;
					cattleName: string | null;
					shipmentDate: string;
					price: number;
					weight: number | null;
					ageAtShipment: number | null;
					buyer: string | null;
					notes: string | null;
				}[];
				pagination: {
					page: number;
					limit: number;
					total: number;
					totalPages: number;
				};
				summary: {
					totalShipments: number;
					totalRevenue: number;
					averagePrice: number;
					averageWeight: number;
					averageAge: number;
				};
			},
			ShipmentDomainError
		>
	> => {
		const searchParams = {
			userId: input.userId,
			from: input.from,
			to: input.to,
			cattleId: input.cattleId,
			page: input.page || 1,
			limit: input.limit || 50
		};

		return await deps.shipmentRepo.search(searchParams);
	};
