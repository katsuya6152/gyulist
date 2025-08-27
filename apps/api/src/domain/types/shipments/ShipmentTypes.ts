/**
 * 出荷管理ドメイン - 基本型定義
 *
 * 出荷管理で使用される基本的な値オブジェクトを定義しています。
 */

import type { Brand } from "../../../shared/brand";

// 出荷ID
export type ShipmentId = Brand<string, "ShipmentId">;

// 出荷予定ID
export type ShipmentPlanId = Brand<string, "ShipmentPlanId">;

// 出荷価格（円）
export type ShipmentPrice = Brand<number, "ShipmentPrice">;

// 出荷時体重（kg）
export type ShipmentWeight = Brand<number, "ShipmentWeight">;

// 出荷時日齢
export type ShipmentAge = Brand<number, "ShipmentAge">;

// 購買者
export type Buyer = Brand<string, "Buyer">;

// 出荷予定月（YYYY-MM形式）
export type PlannedShipmentMonth = Brand<string, "PlannedShipmentMonth">;

// 出荷日
export type ShipmentDate = Brand<string, "ShipmentDate">;

// 出荷備考
export type ShipmentNotes = Brand<string, "ShipmentNotes">;
