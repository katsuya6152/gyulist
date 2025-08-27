/**
 * Shipment Repository Implementation
 *
 * 出荷管理リポジトリのDrizzle ORM実装
 */

import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
	events,
	bloodline,
	breedingStatus,
	cattle,
	motherInfo,
	shipmentPlans,
	shipments,
	users
} from "../../../db/schema";
import type { ShipmentResult } from "../../../domain/errors/shipments/ShipmentErrors";
import {
	createCattleNotFoundError,
	createShipmentNotFoundError,
	createShipmentPlanNotFoundError
} from "../../../domain/errors/shipments/ShipmentErrors";
import { calculateShipmentStatistics } from "../../../domain/functions/shipments";
import type {
	SearchMotherShipmentsParams,
	SearchShipmentPlansParams,
	SearchShipmentsParams,
	ShipmentPlanRepository,
	ShipmentRepository
} from "../../../domain/ports/shipments";
import type {
	MotherShipmentDetail,
	MotherShipmentListResponse,
	MotherShipmentSummary,
	PlannedShipmentMonth,
	Shipment,
	ShipmentId,
	ShipmentPlan,
	ShipmentPlanId
} from "../../../domain/types/shipments";
import type { CattleId, UserId } from "../../../shared/brand";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";
import { err, ok } from "../../../shared/result";
import {
	shipmentDbMapper,
	shipmentPlanDbMapper
} from "../mappers/shipmentDbMapper";

/**
 * Shipment Repository Implementation using Drizzle ORM
 */
export class ShipmentRepositoryImpl implements ShipmentRepository {
	private readonly db: D1DatabasePort;

	constructor(db: D1DatabasePort) {
		this.db = db;
	}

	async save(shipment: Shipment): Promise<ShipmentResult<Shipment>> {
		try {
			const dbData = shipmentDbMapper.toDb(shipment);
			const drizzle = this.db.getDrizzle();
			await drizzle.insert(shipments).values(dbData).execute();
			return ok(shipment);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to save shipment: ${error}`,
				field: "shipment"
			});
		}
	}

	async findById(shipmentId: string): Promise<ShipmentResult<Shipment | null>> {
		try {
			const drizzle = this.db.getDrizzle();
			const result = await drizzle
				.select()
				.from(shipments)
				.where(eq(shipments.shipmentId, shipmentId))
				.limit(1)
				.execute();

			if (result.length === 0) {
				return ok(null);
			}

			const shipment = shipmentDbMapper.fromDb(result[0]);
			return ok(shipment);
		} catch (error) {
			return err(createShipmentNotFoundError(shipmentId as ShipmentId));
		}
	}

	async search(params: SearchShipmentsParams): Promise<
		ShipmentResult<{
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
		}>
	> {
		try {
			const drizzle = this.db.getDrizzle();

			// 基本クエリ構築
			const query = drizzle
				.select({
					shipmentId: shipments.shipmentId,
					cattleId: shipments.cattleId,
					cattleName: cattle.name,
					shipmentDate: shipments.shipmentDate,
					price: shipments.price,
					weight: shipments.weight,
					ageAtShipment: shipments.ageAtShipment,
					buyer: shipments.buyer,
					notes: shipments.notes
				})
				.from(shipments)
				.innerJoin(cattle, eq(shipments.cattleId, cattle.cattleId))
				.where(
					and(
						eq(cattle.ownerUserId, params.userId),
						...(params.cattleId
							? [eq(shipments.cattleId, params.cattleId)]
							: []),
						...(params.from ? [gte(shipments.shipmentDate, params.from)] : []),
						...(params.to ? [lte(shipments.shipmentDate, params.to)] : [])
					)
				)
				.orderBy(desc(shipments.shipmentDate))
				.limit(params.limit || 50)
				.offset(((params.page || 1) - 1) * (params.limit || 50));

			// ページネーション変数を後で使用するために定義
			const page = params.page || 1;
			const limit = params.limit || 50;

			const result = await query.execute();

			// 統計情報の計算
			const statsQuery = drizzle
				.select({
					totalShipments: count(),
					totalRevenue: sql<number>`COALESCE(SUM(${shipments.price}), 0)`,
					averagePrice: sql<number>`COALESCE(AVG(${shipments.price}), 0)`,
					averageWeight: sql<number>`COALESCE(AVG(${shipments.weight}), 0)`,
					averageAge: sql<number>`COALESCE(AVG(${shipments.ageAtShipment}), 0)`
				})
				.from(shipments)
				.innerJoin(cattle, eq(shipments.cattleId, cattle.cattleId))
				.where(eq(cattle.ownerUserId, params.userId));

			const statsResult = await statsQuery.execute();
			const stats = statsResult[0];

			// レスポンス構築
			const response = {
				data: result,
				pagination: {
					page,
					limit,
					total: stats.totalShipments,
					totalPages: Math.ceil(stats.totalShipments / limit)
				},
				summary: {
					totalShipments: stats.totalShipments,
					totalRevenue: stats.totalRevenue,
					averagePrice: stats.averagePrice,
					averageWeight: stats.averageWeight,
					averageAge: stats.averageAge
				}
			};

			return ok(response);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to search shipments: ${error}`,
				field: "search"
			});
		}
	}

	async update(
		shipmentId: string,
		updateData: Partial<Shipment>
	): Promise<ShipmentResult<Shipment>> {
		try {
			const drizzle = this.db.getDrizzle();

			// 既存の出荷実績を取得
			const existingResult = await this.findById(shipmentId);
			if (!existingResult.ok) {
				return existingResult;
			}

			const existing = existingResult.value;
			if (!existing) {
				return err(createShipmentNotFoundError(shipmentId as ShipmentId));
			}

			// 更新データをマージ
			const updatedShipment = {
				...existing,
				...updateData,
				shipmentId: shipmentId as ShipmentId, // IDは変更不可
				updatedAt: new Date()
			};

			const result = await drizzle
				.update(shipments)
				.set({
					shipmentDate: updatedShipment.shipmentDate,
					price: updatedShipment.price,
					weight: updatedShipment.weight,
					ageAtShipment: updatedShipment.ageAtShipment,
					buyer: updatedShipment.buyer,
					notes: updatedShipment.notes,
					updatedAt: sql`(datetime('now', 'utc'))`
				})
				.where(eq(shipments.shipmentId, shipmentId))
				.execute();

			if (result.changes === 0) {
				return err(createShipmentNotFoundError(shipmentId as ShipmentId));
			}

			return ok(updatedShipment);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to update shipment: ${error}`,
				field: "shipment"
			});
		}
	}

	async delete(shipmentId: string): Promise<ShipmentResult<void>> {
		try {
			const drizzle = this.db.getDrizzle();
			const result = await drizzle
				.delete(shipments)
				.where(eq(shipments.shipmentId, shipmentId))
				.execute();

			if (result.changes === 0) {
				return err(createShipmentNotFoundError(shipmentId as ShipmentId));
			}

			return ok(void 0);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to delete shipment: ${error}`,
				field: "shipmentId"
			});
		}
	}

	async findMotherShipmentsList(
		params: SearchMotherShipmentsParams
	): Promise<ShipmentResult<MotherShipmentListResponse>> {
		try {
			const drizzle = this.db.getDrizzle();

			// 各子牛の種付年月日を取得するサブクエリ
			const inseminationSubquery = drizzle
				.select({
					cattleId: events.cattleId,
					breedingDate: sql<string>`MAX(${events.eventDatetime})`.as(
						"breedingDate"
					)
				})
				.from(events)
				.where(eq(events.eventType, "INSEMINATION"))
				.groupBy(events.cattleId)
				.as("insemination_events");

			// 基本的なクエリ: 出荷データと関連する牛情報、血統情報、母牛情報、繁殖情報を取得
			const baseQuery = drizzle
				.select({
					// 出荷情報
					shipmentId: shipments.shipmentId,
					shipmentDate: shipments.shipmentDate,
					price: shipments.price,
					weight: shipments.weight,
					ageAtShipment: shipments.ageAtShipment,
					buyer: shipments.buyer,
					notes: shipments.notes,
					// 子牛情報
					calfId: cattle.cattleId,
					calfName: cattle.name,
					calfGender: cattle.gender,
					calfBirthday: cattle.birthday,
					// 血統情報
					father: bloodline.fatherCattleName,
					motherFather: bloodline.motherFatherCattleName,
					motherGrandfather: bloodline.motherGrandFatherCattleName,
					motherMotherGrandfather: bloodline.motherGreatGrandFatherCattleName,
					// 母牛情報
					motherId: motherInfo.motherCattleId,
					motherName: motherInfo.motherName,
					motherEarTag: sql<string>`mother_cattle.earTagNumber`.as(
						"motherEarTag"
					),
					// 繁殖情報
					expectedCalvingDate: breedingStatus.expectedCalvingDate,
					breedingDate: sql<string>`insemination_events.breedingDate`.as(
						"breedingDate"
					)
				})
				.from(shipments)
				.innerJoin(cattle, eq(shipments.cattleId, cattle.cattleId))
				.leftJoin(bloodline, eq(bloodline.cattleId, cattle.cattleId))
				.leftJoin(motherInfo, eq(motherInfo.cattleId, cattle.cattleId))
				.leftJoin(
					sql`cattle mother_cattle`,
					eq(sql`mother_cattle.cattleId`, motherInfo.motherCattleId)
				)
				.leftJoin(breedingStatus, eq(breedingStatus.cattleId, cattle.cattleId))
				.leftJoin(
					inseminationSubquery,
					eq(sql`insemination_events.cattleId`, cattle.cattleId)
				)
				.where(eq(cattle.ownerUserId, params.userId));

			const results = await baseQuery;

			// データをMotherShipmentDetailに変換
			const details: MotherShipmentDetail[] = results.map((row) => ({
				motherId: (row.motherId || 0) as CattleId,
				motherName: row.motherName || "不明",
				motherEarTag: row.motherEarTag || null,
				calfId: row.calfId as CattleId,
				calfName: row.calfName || null,
				sex: row.calfGender || null,
				pedigree: {
					father: row.father || null,
					motherFather: row.motherFather || null,
					motherGrandfather: row.motherGrandfather || null,
					motherMotherGrandfather: row.motherMotherGrandfather || null
				},
				breedingDate: row.breedingDate ? row.breedingDate.split("T")[0] : null, // 日付部分のみ抽出
				expectedBirthDate: row.expectedCalvingDate || null,
				birthDate: row.calfBirthday || null,
				shipmentDate: row.shipmentDate || null,
				shipmentWeight: row.weight || null,
				ageAtShipment: row.ageAtShipment || null,
				price: row.price || null,
				buyer: row.buyer || null,
				notes: row.notes || null
			}));

			// フィルタリング
			let filteredDetails = details;
			if (params.filterBy && params.filterValue) {
				switch (params.filterBy) {
					case "year":
						filteredDetails = details.filter(
							(d) =>
								d.shipmentDate?.startsWith(params.filterValue || "") || false
						);
						break;
					case "motherName":
						filteredDetails = details.filter((d) =>
							d.motherName
								.toLowerCase()
								.includes((params.filterValue || "").toLowerCase())
						);
						break;
				}
			}

			// ソート
			if (params.sortBy) {
				filteredDetails.sort((a, b) => {
					let aVal: string | number;
					let bVal: string | number;
					switch (params.sortBy) {
						case "motherName":
							aVal = a.motherName;
							bVal = b.motherName;
							break;
						case "totalRevenue":
							aVal = a.price || 0;
							bVal = b.price || 0;
							break;
						case "averagePrice":
							aVal = a.price || 0;
							bVal = b.price || 0;
							break;
						case "shipmentDate":
							aVal = a.shipmentDate || "0000-00-00";
							bVal = b.shipmentDate || "0000-00-00";
							break;
						default:
							return 0;
					}

					if (params.sortOrder === "desc") {
						return bVal > aVal ? 1 : -1;
					}
					return aVal > bVal ? 1 : -1;
				});
			}

			// ページネーション
			const page = params.page || 1;
			const limit = params.limit || 50;
			const total = filteredDetails.length;
			const totalPages = Math.ceil(total / limit);
			const offset = (page - 1) * limit;
			const paginatedDetails = filteredDetails.slice(offset, offset + limit);

			// 統計計算は既にMotherShipmentDetail形式のfilteredDetailsを直接使用
			const summary = calculateShipmentStatistics(filteredDetails);

			const response: MotherShipmentListResponse = {
				data: paginatedDetails,
				pagination: {
					page,
					limit,
					total,
					totalPages
				},
				summary
			};

			return ok(response);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to get mother shipments list: ${error}`,
				field: "search"
			});
		}
	}

	async findMotherShipmentDetails(
		motherId: CattleId,
		userId: UserId
	): Promise<ShipmentResult<MotherShipmentSummary | null>> {
		try {
			// 実装は省略（複雑なクエリが必要）
			// 実際の実装では、母牛の詳細情報と子牛の出荷実績を取得
			return ok(null);
		} catch (error) {
			return err(createCattleNotFoundError(motherId));
		}
	}
}

/**
 * Shipment Plan Repository Implementation using Drizzle ORM
 */
export class ShipmentPlanRepositoryImpl implements ShipmentPlanRepository {
	private readonly db: D1DatabasePort;

	constructor(db: D1DatabasePort) {
		this.db = db;
	}

	async save(plan: ShipmentPlan): Promise<ShipmentResult<ShipmentPlan>> {
		try {
			const dbData = shipmentPlanDbMapper.toDb(plan);
			const drizzle = this.db.getDrizzle();
			await drizzle.insert(shipmentPlans).values(dbData).execute();
			return ok(plan);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to save shipment plan: ${error}`,
				field: "shipmentPlan"
			});
		}
	}

	async findById(
		planId: ShipmentPlanId,
		userId: UserId
	): Promise<ShipmentResult<ShipmentPlan | null>> {
		try {
			const drizzle = this.db.getDrizzle();
			const result = await drizzle
				.select()
				.from(shipmentPlans)
				.innerJoin(cattle, eq(shipmentPlans.cattleId, cattle.cattleId))
				.where(
					and(eq(shipmentPlans.planId, planId), eq(cattle.ownerUserId, userId))
				)
				.limit(1)
				.execute();

			if (result.length === 0) {
				return ok(null);
			}

			const plan = shipmentPlanDbMapper.fromDb(result[0].shipment_plans);
			return ok(plan);
		} catch (error) {
			return err(createShipmentPlanNotFoundError(planId));
		}
	}

	async findByCattleId(
		cattleId: CattleId,
		userId: UserId
	): Promise<ShipmentResult<ShipmentPlan | null>> {
		try {
			const drizzle = this.db.getDrizzle();
			const result = await drizzle
				.select()
				.from(shipmentPlans)
				.innerJoin(cattle, eq(shipmentPlans.cattleId, cattle.cattleId))
				.where(
					and(
						eq(shipmentPlans.cattleId, cattleId),
						eq(cattle.ownerUserId, userId)
					)
				)
				.limit(1)
				.execute();

			if (result.length === 0) {
				return ok(null);
			}

			const plan = shipmentPlanDbMapper.fromDb(result[0].shipment_plans);
			return ok(plan);
		} catch (error) {
			return err(createCattleNotFoundError(cattleId));
		}
	}

	async search(
		params: SearchShipmentPlansParams
	): Promise<ShipmentResult<ShipmentPlan[]>> {
		try {
			const drizzle = this.db.getDrizzle();
			const query = drizzle
				.select({
					planId: shipmentPlans.planId,
					cattleId: shipmentPlans.cattleId,
					plannedShipmentMonth: shipmentPlans.plannedShipmentMonth,
					createdAt: shipmentPlans.createdAt,
					updatedAt: shipmentPlans.updatedAt,
					cattleName: cattle.name,
					identificationNumber: cattle.identificationNumber,
					gender: cattle.gender,
					growthStage: cattle.growthStage
				})
				.from(shipmentPlans)
				.innerJoin(cattle, eq(shipmentPlans.cattleId, cattle.cattleId))
				.where(eq(cattle.ownerUserId, params.userId));

			const result = await query.execute();
			const plansData = result.map((row) => ({
				planId: row.planId as ShipmentPlanId,
				cattleId: row.cattleId as CattleId,
				plannedShipmentMonth: row.plannedShipmentMonth as PlannedShipmentMonth,
				cattleName: row.cattleName ?? undefined,
				identificationNumber: row.identificationNumber?.toString() ?? undefined,
				gender: row.gender ?? undefined,
				growthStage: row.growthStage ?? undefined,
				createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
				updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
			}));

			return ok(plansData);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to search shipment plans: ${error}`,
				field: "search"
			});
		}
	}

	async update(plan: ShipmentPlan): Promise<ShipmentResult<ShipmentPlan>> {
		try {
			const dbData = shipmentPlanDbMapper.toDb(plan);
			const drizzle = this.db.getDrizzle();
			const result = await drizzle
				.update(shipmentPlans)
				.set({
					...dbData,
					updatedAt: sql`(datetime('now', 'utc'))`
				})
				.where(eq(shipmentPlans.planId, plan.planId))
				.execute();

			if (result.changes === 0) {
				return err(createShipmentPlanNotFoundError(plan.planId));
			}

			return ok(plan);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to update shipment plan: ${error}`,
				field: "shipmentPlan"
			});
		}
	}

	async deleteByCattleId(
		cattleId: CattleId,
		userId: UserId
	): Promise<ShipmentResult<void>> {
		try {
			const drizzle = this.db.getDrizzle();
			const result = await drizzle
				.delete(shipmentPlans)
				.where(
					and(
						eq(shipmentPlans.cattleId, cattleId),
						eq(
							shipmentPlans.cattleId,
							sql`(SELECT cattle_id FROM cattle WHERE owner_user_id = ${userId})`
						)
					)
				)
				.execute();

			if (result.changes === 0) {
				return err(createCattleNotFoundError(cattleId));
			}

			return ok(void 0);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to delete shipment plan: ${error}`,
				field: "cattleId"
			});
		}
	}

	async delete(planId: ShipmentPlanId): Promise<ShipmentResult<void>> {
		try {
			const drizzle = this.db.getDrizzle();
			const result = await drizzle
				.delete(shipmentPlans)
				.where(eq(shipmentPlans.planId, planId))
				.execute();

			if (result.changes === 0) {
				return err(createShipmentPlanNotFoundError(planId));
			}

			return ok(void 0);
		} catch (error) {
			return err({
				type: "INVALID_SHIPMENT_DATA" as const,
				message: `Failed to delete shipment plan: ${error}`,
				field: "planId"
			});
		}
	}
}
