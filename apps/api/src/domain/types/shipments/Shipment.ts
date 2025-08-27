/**
 * 出荷管理ドメイン - 出荷エンティティの定義
 *
 * 出荷実績における中心的なエンティティを定義しています。
 * 出荷の基本情報、価格、体重などの属性を管理し、
 * ドメインルールに基づくバリデーションとビジネスロジックを提供します。
 */

import type { CattleId } from "../../../shared/brand";
import type {
	Buyer,
	ShipmentAge,
	ShipmentDate,
	ShipmentId,
	ShipmentNotes,
	ShipmentPrice,
	ShipmentWeight
} from "./ShipmentTypes";

/**
 * 出荷エンティティ
 *
 * 牛の出荷実績における中心的なエンティティです。
 * 以下の特徴を持ちます：
 *
 * - 不変性（Immutability）: すべてのプロパティがreadonly
 * - ドメインルール: ビジネスルールに基づくバリデーション
 * - 集約の一部: 牛（Cattle）集約に属する
 */
export type Shipment = Readonly<{
	// 識別子
	shipmentId: ShipmentId; // 出荷の一意識別子
	cattleId: CattleId; // 出荷対象の牛ID

	// 出荷情報
	shipmentDate: ShipmentDate; // 出荷日
	price: ShipmentPrice; // 出荷価格（円）
	weight: ShipmentWeight | null; // 出荷時体重（kg）
	ageAtShipment: ShipmentAge | null; // 出荷時日齢
	buyer: Buyer | null; // 購買者
	notes: ShipmentNotes | null; // 備考

	// システム管理情報
	createdAt: Date; // 作成日時
	updatedAt: Date; // 更新日時
}>;

/**
 * 新規出荷作成時のプロパティ
 */
export type NewShipmentProps = {
	cattleId: CattleId;
	shipmentDate: ShipmentDate;
	price: ShipmentPrice;
	weight?: ShipmentWeight | null;
	ageAtShipment?: ShipmentAge | null;
	buyer?: Buyer | null;
	notes?: ShipmentNotes | null;
};

/**
 * 出荷更新時のプロパティ
 */
export type UpdateShipmentProps = {
	shipmentDate?: ShipmentDate;
	price?: ShipmentPrice;
	weight?: ShipmentWeight | null;
	ageAtShipment?: ShipmentAge | null;
	buyer?: Buyer | null;
	notes?: ShipmentNotes | null;
};
