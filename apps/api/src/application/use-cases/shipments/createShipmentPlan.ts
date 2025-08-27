/**
 * Create Shipment Plan Use Case
 *
 * 出荷予定作成ユースケース
 */

import type { ShipmentDomainError } from "../../../domain/errors/shipments/ShipmentErrors";
import { createShipmentPlan } from "../../../domain/functions/shipments";
import type { ShipmentPlanRepository } from "../../../domain/ports/shipments";
import type {
	NewShipmentPlanProps,
	ShipmentPlan
} from "../../../domain/types/shipments";
import type { UserId } from "../../../shared/brand";
import type { ClockPort } from "../../../shared/ports/clock";
import type { Result } from "../../../shared/result";

/**
 * 依存関係（ポート）の束
 */
export type CreateShipmentPlanDeps = {
	shipmentPlanRepo: ShipmentPlanRepository;
	clock: ClockPort;
};

/**
 * 新規作成コマンドの型
 */
export type CreateShipmentPlanInput = NewShipmentPlanProps & {
	userId: UserId;
};

/**
 * 出荷予定作成ユースケースの関数型定義
 */
export type CreateShipmentPlanUseCase = (
	deps: CreateShipmentPlanDeps
) => (
	input: CreateShipmentPlanInput
) => Promise<Result<ShipmentPlan, ShipmentDomainError>>;

/**
 * 出荷予定の新規作成ユースケース
 *
 * 入力コマンドの検証（ドメインファクトリ内のバリデーションを含む）を行い、
 * リポジトリへ保存して作成結果を返します。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 成功時は作成された `ShipmentPlan`、失敗時は `ShipmentDomainError` を含む `Result`
 */
export const createShipmentPlanUseCase: CreateShipmentPlanUseCase =
	(deps) =>
	async (input): Promise<Result<ShipmentPlan, ShipmentDomainError>> => {
		// 既存の出荷予定があるかチェック
		const existingPlan = await deps.shipmentPlanRepo.findByCattleId(
			input.cattleId,
			input.userId
		);
		if (existingPlan.ok && existingPlan.value) {
			return {
				ok: false,
				error: {
					type: "DUPLICATE_SHIPMENT_PLAN",
					message: `Shipment plan for cattle ${input.cattleId} already exists`,
					cattleId: input.cattleId
				}
			};
		}

		// ドメインファクトリで出荷予定エンティティを作成
		const planResult = createShipmentPlan(input);
		if (!planResult.ok) {
			return planResult;
		}

		// リポジトリに保存
		const saveResult = await deps.shipmentPlanRepo.save(planResult.value);
		return saveResult;
	};
