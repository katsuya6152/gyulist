/**
 * Events ドメインモデル - 定数と型定義
 *
 * イベントタイプ、グループ分類、重要度などの
 * ドメイン固有の定数と型定義を統合管理します。
 *
 * このファイルは以下の要素を含みます：
 * - イベントタイプの定数と型
 * - イベントグループの分類
 * - イベントの重要度
 * - 表示用ラベル
 */

/**
 * イベントタイプの定数配列。
 * 牛のライフサイクルにおける各種イベントを定義します。
 */
export const EVENT_TYPES = [
	"ARRIVAL", // 導入
	"ESTRUS", // 発情
	"INSEMINATION", // 受精（人工授精）
	"PREGNANCY_CHECK", // 妊娠鑑定
	"CALVING", // 分娩
	"ABORTION", // 流産
	"STILLBIRTH", // 死産
	"WEANING", // 断乳
	"START_FATTENING", // 肥育開始
	"WEIGHT_MEASURED", // 体重計測
	"VACCINATION", // ワクチン接種
	"DIAGNOSIS", // 診断
	"MEDICATION", // 投薬
	"TREATMENT_STARTED", // 治療開始
	"TREATMENT_COMPLETED", // 治療完了
	"HOOF_TRIMMING", // 削蹄
	"SHIPMENT", // 出荷
	"OTHER" // その他
] as const;

/**
 * イベントタイプの型。
 * 定数配列から生成される型安全なイベントタイプです。
 */
export type EventType = (typeof EVENT_TYPES)[number];

/**
 * イベントカテゴリの型
 */
export type EventCategory = (typeof EVENT_GROUP_ORDER)[number];

/**
 * イベントの分類グループ（順序付き）。
 * UI表示時のグループ化に使用されます。
 */
export const EVENT_GROUP_ORDER = [
	"ARRIVAL",
	"BREEDING",
	"CALVING",
	"GROWTH",
	"MEASUREMENT",
	"HEALTH",
	"LOGISTICS",
	"OTHER"
] as const;

/**
 * イベントグループの表示ラベル。
 * 日本語での表示名を定義します。
 */
export const EVENT_GROUP_LABELS: Record<
	(typeof EVENT_GROUP_ORDER)[number],
	string
> = {
	ARRIVAL: "導入",
	BREEDING: "繁殖",
	CALVING: "分娩・異常",
	GROWTH: "成長遷移",
	MEASUREMENT: "計測",
	HEALTH: "健康・治療",
	LOGISTICS: "ロジ",
	OTHER: "その他"
};

/**
 * イベントタイプとグループのマッピング。
 * 各イベントタイプがどのグループに属するかを定義します。
 */
export const EVENT_TYPE_GROUPS: Record<
	(typeof EVENT_GROUP_ORDER)[number],
	readonly EventType[]
> = {
	ARRIVAL: ["ARRIVAL"],
	BREEDING: ["ESTRUS", "INSEMINATION", "PREGNANCY_CHECK"],
	CALVING: ["CALVING", "ABORTION", "STILLBIRTH"],
	GROWTH: ["WEANING", "START_FATTENING"],
	MEASUREMENT: ["WEIGHT_MEASURED"],
	HEALTH: [
		"VACCINATION",
		"DIAGNOSIS",
		"MEDICATION",
		"TREATMENT_STARTED",
		"TREATMENT_COMPLETED",
		"HOOF_TRIMMING"
	],
	LOGISTICS: ["SHIPMENT"],
	OTHER: ["OTHER"]
};

/**
 * イベントタイプの表示ラベル。
 * 日本語での表示名を定義します。
 */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
	ARRIVAL: "導入",
	ESTRUS: "発情",
	INSEMINATION: "人工授精",
	PREGNANCY_CHECK: "妊娠鑑定",
	CALVING: "分娩",
	ABORTION: "流産",
	STILLBIRTH: "死産",
	WEANING: "断乳",
	START_FATTENING: "肥育開始",
	WEIGHT_MEASURED: "体重計測",
	VACCINATION: "ワクチン接種",
	DIAGNOSIS: "診断",
	MEDICATION: "投薬",
	TREATMENT_STARTED: "治療開始",
	TREATMENT_COMPLETED: "治療完了",
	HOOF_TRIMMING: "削蹄",
	SHIPMENT: "出荷",
	OTHER: "その他"
};

/**
 * イベントの重要度
 */
export const EVENT_PRIORITIES = {
	LOW: "LOW",
	MEDIUM: "MEDIUM",
	HIGH: "HIGH",
	CRITICAL: "CRITICAL"
} as const;

export type EventPriority =
	(typeof EVENT_PRIORITIES)[keyof typeof EVENT_PRIORITIES];

/**
 * イベントタイプ別の重要度マッピング
 */
export const EVENT_TYPE_PRIORITIES: Record<EventType, EventPriority> = {
	ARRIVAL: EVENT_PRIORITIES.MEDIUM,
	ESTRUS: EVENT_PRIORITIES.MEDIUM,
	INSEMINATION: EVENT_PRIORITIES.HIGH,
	PREGNANCY_CHECK: EVENT_PRIORITIES.HIGH,
	CALVING: EVENT_PRIORITIES.CRITICAL,
	ABORTION: EVENT_PRIORITIES.HIGH,
	STILLBIRTH: EVENT_PRIORITIES.HIGH,
	WEANING: EVENT_PRIORITIES.MEDIUM,
	START_FATTENING: EVENT_PRIORITIES.MEDIUM,
	WEIGHT_MEASURED: EVENT_PRIORITIES.LOW,
	VACCINATION: EVENT_PRIORITIES.MEDIUM,
	DIAGNOSIS: EVENT_PRIORITIES.MEDIUM,
	MEDICATION: EVENT_PRIORITIES.HIGH,
	TREATMENT_STARTED: EVENT_PRIORITIES.HIGH,
	TREATMENT_COMPLETED: EVENT_PRIORITIES.MEDIUM,
	HOOF_TRIMMING: EVENT_PRIORITIES.LOW,
	SHIPMENT: EVENT_PRIORITIES.HIGH,
	OTHER: EVENT_PRIORITIES.LOW
};
