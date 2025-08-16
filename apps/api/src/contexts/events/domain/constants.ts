/**
 * Events ドメイン定数定義
 * イベントタイプ、グループ分類等のドメイン固有定数
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

export type EventType = (typeof EVENT_TYPES)[number];

// イベントの分類グループ（順序付き）
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
