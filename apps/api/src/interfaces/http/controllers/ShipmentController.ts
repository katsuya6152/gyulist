/**
 * Shipment HTTP Controller
 *
 * 出荷管理のHTTPエンドポイントを処理するコントローラー
 */

import type { Context } from "hono";
import type {
	NewShipmentPlanProps,
	NewShipmentProps,
	ShipmentId,
	ShipmentPlanId
} from "../../../domain/types/shipments";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import type { CattleId, UserId } from "../../../shared/brand";
import { executeUseCase } from "../../../shared/http/route-helpers";
import { err } from "../../../shared/result";
import { toUserId } from "../../../shared/types/safe-cast";

/**
 * コントローラーの依存関係
 */
export type ShipmentControllerDeps = Dependencies;

/**
 * 出荷管理コントローラー
 */
export const makeShipmentController = (deps: ShipmentControllerDeps) => ({
	/**
	 * 出荷実績の作成
	 */
	async createShipment(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const body = await c.req.json();

			const input: NewShipmentProps = {
				cattleId: body.cattleId as CattleId,
				shipmentDate: body.shipmentDate,
				price: body.price,
				weight: body.weight || null,
				ageAtShipment: body.ageAtShipment || null,
				buyer: body.buyer || null,
				notes: body.notes || null
			};

			const createShipmentUseCase = deps.useCases.createShipmentUseCase;
			return await createShipmentUseCase(input);
		});
	},

	/**
	 * 出荷実績の更新
	 */
	async updateShipment(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const shipmentId = c.req.param("shipmentId");
			const body = await c.req.json();

			const input = {
				shipmentId,
				userId,
				shipmentDate: body.shipmentDate,
				price: body.price,
				weight: body.weight || null,
				ageAtShipment: body.ageAtShipment || null,
				buyer: body.buyer || null,
				notes: body.notes || null
			};

			const updateShipmentUseCase = deps.useCases.updateShipmentUseCase;
			return await updateShipmentUseCase(input);
		});
	},

	/**
	 * 出荷実績の削除
	 */
	async deleteShipment(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const shipmentId = c.req.param("shipmentId");

			const input = {
				shipmentId,
				userId
			};

			const deleteShipmentUseCase = deps.useCases.deleteShipmentUseCase;
			await deleteShipmentUseCase(input);
			return { ok: true, value: {} as Record<string, never> };
		});
	},

	/**
	 * 母牛別出荷実績一覧の取得
	 */
	async getMotherShipmentsList(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const query = c.req.query();

			const input = {
				userId,
				page: query.page ? Number.parseInt(query.page, 10) : 1,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 50,
				sortBy: query.sortBy as
					| "motherName"
					| "totalRevenue"
					| "averagePrice"
					| "shipmentCount"
					| undefined,
				sortOrder: query.sortOrder as "asc" | "desc" | undefined,
				filterBy: query.filterBy as
					| "year"
					| "motherName"
					| "priceRange"
					| undefined,
				filterValue: query.filterValue || undefined
			};

			const getMotherShipmentsListUseCase =
				deps.useCases.getMotherShipmentsListUseCase;
			return await getMotherShipmentsListUseCase(input);
		});
	},

	/**
	 * 出荷予定の作成
	 */
	async createShipmentPlan(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const body = await c.req.json();

			const input: NewShipmentPlanProps = {
				cattleId: body.cattleId as CattleId,
				plannedShipmentMonth: body.plannedShipmentMonth
			};

			const createShipmentPlanUseCase = deps.useCases.createShipmentPlanUseCase;
			return await createShipmentPlanUseCase(input);
		});
	},

	/**
	 * 出荷予定一覧の取得
	 */
	async getShipmentPlans(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const query = c.req.query();

			const input = {
				userId,
				month: query.month || undefined,
				page: query.page ? Number.parseInt(query.page, 10) : 1,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 50
			};

			const getShipmentPlansUseCase = deps.useCases.getShipmentPlansUseCase;
			return await getShipmentPlansUseCase(input);
		});
	},

	/**
	 * 出荷予定の更新
	 */
	async updateShipmentPlan(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const cattleId = Number.parseInt(c.req.param("cattleId"), 10) as CattleId;
			const body = await c.req.json();

			// まず既存の出荷予定を取得
			const existingPlan =
				await deps.repositories.shipmentPlanRepo.findByCattleId(
					cattleId,
					userId
				);
			if (!existingPlan.ok || !existingPlan.value) {
				return err({
					type: "SHIPMENT_PLAN_NOT_FOUND" as const,
					message: `Shipment plan for cattle ${cattleId} not found`,
					cattleId
				});
			}

			// 更新
			const updatedPlan = {
				...existingPlan.value,
				plannedShipmentMonth: body.plannedShipmentMonth,
				updatedAt: new Date()
			};

			return await deps.repositories.shipmentPlanRepo.update(updatedPlan);
		});
	},

	/**
	 * 出荷予定の削除
	 */
	async deleteShipmentPlan(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const cattleId = Number.parseInt(c.req.param("cattleId"), 10) as CattleId;

			const result = await deps.repositories.shipmentPlanRepo.deleteByCattleId(
				cattleId,
				userId
			);
			if (!result.ok) {
				return result;
			}
			return { ok: true, value: {} as Record<string, never> };
		});
	},

	/**
	 * 出荷実績一覧の取得
	 */
	async getShipments(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const query = c.req.query();

			const input = {
				userId,
				from: query.from || undefined,
				to: query.to || undefined,
				cattleId: query.cattleId
					? (Number.parseInt(query.cattleId, 10) as CattleId)
					: undefined,
				page: query.page ? Number.parseInt(query.page, 10) : 1,
				limit: query.limit ? Number.parseInt(query.limit, 10) : 50
			};

			return await deps.repositories.shipmentRepo.search(input);
		});
	},

	/**
	 * 価格統計の取得
	 */
	async getPriceStats(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const query = c.req.query();

			// 出荷実績を取得
			const shipmentsResult = await deps.repositories.shipmentRepo.search({
				userId,
				from: query.from || undefined,
				to: query.to || undefined
			});

			if (!shipmentsResult.ok) {
				return shipmentsResult;
			}

			// 統計計算（簡易版）
			const shipments = shipmentsResult.value.data;
			const totalRevenue = shipments.reduce((sum, s) => sum + s.price, 0);
			const averagePrice =
				shipments.length > 0 ? Math.round(totalRevenue / shipments.length) : 0;
			const maxPrice =
				shipments.length > 0 ? Math.max(...shipments.map((s) => s.price)) : 0;
			const minPrice =
				shipments.length > 0 ? Math.min(...shipments.map((s) => s.price)) : 0;

			return {
				ok: true,
				value: {
					totalShipments: shipments.length,
					totalRevenue,
					averagePrice,
					maxPrice,
					minPrice,
					monthlyStats: {} // 月別統計は後で実装
				}
			};
		});
	}
});
