import type { Brand } from "../../../../shared/brand";

// ============================================================================
// ドメイン固有の型定義
// ============================================================================

/**
 * 牛の性別
 *
 * 繁殖管理や飼育管理において重要な属性です。
 * 性別によって管理方針や飼育方法が異なります。
 * 去勢牛は繁殖目的ではなく、肉質向上や行動制御が目的です。
 */
export type Gender = "雄" | "去勢" | "雌";

/**
 * 牛の成長段階
 *
 * 牛のライフサイクルにおける成長段階を表現します。
 * 各段階で異なる管理方針や飼育方法が適用されます。
 */
export type GrowthStage =
	| "CALF" // 繁殖・哺乳期（0〜8ヶ月）
	| "GROWING" // 育成期（約8か月～12か月）
	| "FATTENING" // 肥育期（12か月～30か月）
	| "FIRST_CALVED" // 初産牛（初回分娩）
	| "MULTI_PAROUS"; // 経産牛（1回以上の分娩）

/**
 * 牛の健康・繁殖状態
 *
 * 牛の現在の状態を表現し、適切な管理方針の決定に使用されます。
 * 各状態に応じて異なるケアや管理が必要です。
 */
export type Status =
	| "HEALTHY" // 健康：通常の飼育管理
	| "PREGNANT" // 妊娠中：繁殖管理の重点化
	| "RESTING" // 休養中：繁殖休止期間
	| "TREATING" // 治療中：獣医による治療
	| "SCHEDULED_FOR_SHIPMENT" // 出荷予定：出荷準備中
	| "SHIPPED" // 出荷済み：市場への出荷完了
	| "DEAD"; // 死亡：記録保持のため

// ============================================================================
// 定数配列（UI表示・バリデーション用）
// ============================================================================

/**
 * 性別の定数配列
 *
 * フロントエンドのセレクトボックスやバリデーションで使用
 */
export const GENDERS: readonly Gender[] = ["雄", "去勢", "雌"] as const;

/**
 * 成長段階の定数配列
 *
 * フロントエンドのセレクトボックスやバリデーションで使用
 */
export const GROWTH_STAGES: readonly GrowthStage[] = [
	"CALF",
	"GROWING",
	"FATTENING",
	"FIRST_CALVED",
	"MULTI_PAROUS"
] as const;

/**
 * 状態の定数配列
 *
 * フロントエンドのセレクトボックスやバリデーションで使用
 */
export const STATUSES: readonly Status[] = [
	"HEALTHY",
	"PREGNANT",
	"RESTING",
	"TREATING",
	"SCHEDULED_FOR_SHIPMENT",
	"SHIPPED",
	"DEAD"
] as const;

// ============================================================================
// Zod用タプル定数
// ============================================================================

/**
 * 性別のタプル形式（Zodスキーマ用）
 *
 * z.enum()で使用するためのタプル形式
 */
export const GENDERS_TUPLE = ["雄", "去勢", "雌"] as const;

/**
 * 成長段階のタプル形式（Zodスキーマ用）
 *
 * z.enum()で使用するためのタプル形式
 */
export const GROWTH_STAGES_TUPLE = [
	"CALF",
	"GROWING",
	"FATTENING",
	"FIRST_CALVED",
	"MULTI_PAROUS"
] as const;

/**
 * 状態のタプル形式（Zodスキーマ用）
 *
 * z.enum()で使用するためのタプル形式
 */
export const STATUSES_TUPLE = [
	"HEALTHY",
	"PREGNANT",
	"RESTING",
	"TREATING",
	"SCHEDULED_FOR_SHIPMENT",
	"SHIPPED",
	"DEAD"
] as const;

// ============================================================================
// 表示用ラベル
// ============================================================================

/**
 * 性別の表示用ラベル
 */
export const GENDER_LABELS: Record<Gender, string> = {
	雄: "雄",
	去勢: "去勢",
	雌: "雌"
};

/**
 * 成長段階の表示用ラベル
 */
export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
	CALF: "仔牛",
	GROWING: "育成牛",
	FATTENING: "肥育牛",
	FIRST_CALVED: "初産牛",
	MULTI_PAROUS: "経産牛"
};

/**
 * 状態の表示用ラベル
 */
export const STATUS_LABELS: Record<Status, string> = {
	HEALTHY: "健康",
	PREGNANT: "妊娠中",
	RESTING: "休養中",
	TREATING: "治療中",
	SCHEDULED_FOR_SHIPMENT: "出荷予定",
	SHIPPED: "出荷済み",
	DEAD: "死亡"
};

// ============================================================================
// Brand型定義（値オブジェクト）
// ============================================================================

export type Weight = Brand<number, "Weight">;
export type Score = Brand<number, "Score">;
export type CattleName = Brand<string, "CattleName">;
export type Breed = Brand<string, "Breed">;
export type ProducerName = Brand<string, "ProducerName">;
export type Barn = Brand<string, "Barn">;
export type BreedingValue = Brand<string, "BreedingValue">;
export type Notes = Brand<string, "Notes">;
export type IdentificationNumber = Brand<number, "IdentificationNumber">;
export type EarTagNumber = Brand<number, "EarTagNumber">;

// 繁殖管理ドメイン固有の値型
export type Parity = Brand<number, "Parity">;
export type DaysAfterCalving = Brand<number, "DaysAfterCalving">;
export type DaysOpen = Brand<number, "DaysOpen">;
export type PregnancyDays = Brand<number, "PregnancyDays">;
export type DaysAfterInsemination = Brand<number, "DaysAfterInsemination">;
export type InseminationCount = Brand<number, "InseminationCount">;
export type BreedingMemo = Brand<string, "BreedingMemo">;
export type DaysCount = Brand<number, "DaysCount">;
export type PregnancyRate = Brand<number, "PregnancyRate">;

// 血統管理ドメイン固有の値型
export type FatherName = Brand<string, "FatherName">;
export type MotherFatherName = Brand<string, "MotherFatherName">;
export type MotherGrandFatherName = Brand<string, "MotherGrandFatherName">;
export type MotherGreatGrandFatherName = Brand<
	string,
	"MotherGreatGrandFatherName"
>;

// 母情報ドメイン固有の値型
export type MotherName = Brand<string, "MotherName">;
export type MotherIdentificationNumber = Brand<
	string,
	"MotherIdentificationNumber"
>;
export type MotherScore = Brand<number, "MotherScore">;

// 繁殖統計ドメイン固有の値型
export type TotalInseminationCount = Brand<number, "TotalInseminationCount">;
export type AverageDaysOpen = Brand<number, "AverageDaysOpen">;
export type AveragePregnancyPeriod = Brand<number, "AveragePregnancyPeriod">;
export type AverageCalvingInterval = Brand<number, "AverageCalvingInterval">;
export type DifficultBirthCount = Brand<number, "DifficultBirthCount">;
export type PregnancyHeadCount = Brand<number, "PregnancyHeadCount">;
export type PregnancySuccessRate = Brand<number, "PregnancySuccessRate">;
