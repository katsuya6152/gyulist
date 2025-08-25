import type { Brand } from "../../../shared/brand";

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
 * UI表示やバリデーション処理で使用します。
 * 性別選択のドロップダウンリストなどに利用されます。
 */
export const GENDERS: readonly Gender[] = ["雄", "去勢", "雌"] as const;

/**
 * 成長段階の定数配列
 *
 * 各成長段階の選択肢として使用します。
 * 牛の年齢や状況に応じて適切な段階を選択できます。
 */
export const GROWTH_STAGES: readonly GrowthStage[] = [
	"CALF",
	"GROWING",
	"FATTENING",
	"FIRST_CALVED",
	"MULTI_PAROUS"
] as const;

/**
 * ステータスの定数配列
 *
 * 牛の現在の状態選択に使用します。
 * 管理画面や状態変更時の選択肢として利用されます。
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
// Brand型による型安全性の強化
// ============================================================================

/**
 * 牛の名前（愛称）
 *
 * 空文字列でない文字列を保証します。
 * 牛の識別や愛着形成に使用される重要な属性です。
 */
export type CattleName = Brand<string, "CattleName">;

/**
 * 個体識別番号
 *
 * 農場内で牛を一意に識別するための番号です。
 * 正の整数値であることを型レベルで保証します。
 */
export type IdentificationNumber = Brand<number, "IdentificationNumber">;

/**
 * 耳標番号
 *
 * 牛の耳に取り付けられる識別タグの番号です。
 * 個体識別番号と併用して確実な識別を行います。
 */
export type EarTagNumber = Brand<string, "EarTagNumber">;

/**
 * 品種
 *
 * 牛の品種名を表現します。
 * 繁殖計画や品質管理において重要な情報です。
 */
export type Breed = Brand<string, "Breed">;

/**
 * 生産者名
 *
 * 牛を生産・飼育している生産者の名前です。
 * トレーサビリティや品質管理に使用されます。
 */
export type ProducerName = Brand<string, "ProducerName">;

/**
 * 牛舎
 *
 * 牛が飼育されている牛舎や区画の識別子です。
 * 飼育管理や移動履歴の追跡に使用されます。
 */
export type Barn = Brand<string, "Barn">;

/**
 * 育種価
 *
 * 牛の遺伝的能力を数値化した指標です。
 * 繁殖計画や品種改良において重要な指標となります。
 */
export type BreedingValue = Brand<string, "BreedingValue">;

/**
 * 備考・特記事項
 *
 * 牛に関する追加情報や特別な注意事項を記録します。
 * 健康状態や行動特性などの重要な情報を含みます。
 */
export type Notes = Brand<string, "Notes">;

/**
 * 体重（kg）
 *
 * 牛の体重を表現します。
 * 正の数値であることを型レベルで保証し、
 * 成長管理や健康管理に使用されます。
 */
export type Weight = Brand<number, "Weight">;

/**
 * 評価スコア（0-100）
 *
 * 牛の総合的な評価を0-100の範囲で表現します。
 * 繁殖価値や経済価値の評価に使用されます。
 */
export type Score = Brand<number, "Score">;
