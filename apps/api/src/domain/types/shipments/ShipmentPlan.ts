/**
 * 出荷管理ドメイン - 出荷予定エンティティの定義
 *
 * 出荷予定における中心的なエンティティを定義しています。
 * 出荷予定の基本情報を管理し、
 * ドメインルールに基づくバリデーションとビジネスロジックを提供します。
 */

import type { CattleId } from "../../../shared/brand";
import type { PlannedShipmentMonth, ShipmentPlanId } from "./ShipmentTypes";

/**
 * 出荷予定エンティティ
 *
 * 牛の出荷予定における中心的なエンティティです。
 * 以下の特徴を持ちます：
 *
 * - 不変性（Immutability）: すべてのプロパティがreadonly
 * - ドメインルール: ビジネスルールに基づくバリデーション
 * - 集約の一部: 牛（Cattle）集約に属する
 */
export type ShipmentPlan = Readonly<{
	// 識別子
	planId: ShipmentPlanId; // 出荷予定の一意識別子
	cattleId: CattleId; // 出荷予定の牛ID

	// 出荷予定情報
	plannedShipmentMonth: PlannedShipmentMonth; // 出荷予定月（YYYY-MM形式）

	// 牛の詳細情報（表示用）
	cattleName?: string; // 牛名
	identificationNumber?: string; // 個体識別番号
	gender?: string; // 性別
	growthStage?: string; // 成長段階

	// システム管理情報
	createdAt: Date; // 作成日時
	updatedAt: Date; // 更新日時
}>;

/**
 * 新規出荷予定作成時のプロパティ
 */
export type NewShipmentPlanProps = {
	cattleId: CattleId;
	plannedShipmentMonth: PlannedShipmentMonth;
};

/**
 * 出荷予定更新時のプロパティ
 */
export type UpdateShipmentPlanProps = {
	plannedShipmentMonth: PlannedShipmentMonth;
};
