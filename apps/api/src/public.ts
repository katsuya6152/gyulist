/**
 * API公開インターフェース（テスト・フロントエンド用）
 *
 * 定数・型のみをエクスポートし、実行時の依存関係を含まない
 * 軽量なエクスポートファイルです。
 */

// ============================================================================
// 型定義のエクスポート
// ============================================================================

// Cattle関連の型
export type {
	CattleOutput,
	CattleListResponse,
	CattleStatusCountsResponse,
	CattleResponse,
	CattleStatusUpdateResponse
} from "./contexts/cattle/domain/codecs/output";

// Event関連の型
export type {
	EventOutput,
	EventsSearchResponse
} from "./contexts/events/domain/codecs/output";

// Alert関連の型
export type { AlertItem } from "./contexts/alerts/domain/codecs/output";

// ============================================================================
// Cattle関連の定数とラベル
// ============================================================================

// 性別関連
export {
	GENDERS,
	GENDERS_TUPLE,
	GENDER_LABELS,
	type Gender
} from "./contexts/cattle/domain/model/types";

// 成長段階関連
export {
	GROWTH_STAGES,
	GROWTH_STAGES_TUPLE,
	GROWTH_STAGE_LABELS,
	type GrowthStage
} from "./contexts/cattle/domain/model/types";

// 状態関連
export {
	STATUSES,
	STATUSES_TUPLE,
	STATUS_LABELS,
	type Status
} from "./contexts/cattle/domain/model/types";

// ============================================================================
// Event関連の定数とラベル
// ============================================================================

// イベントタイプ関連
export {
	EVENT_TYPES,
	EVENT_TYPE_LABELS,
	EVENT_TYPE_GROUPS,
	EVENT_GROUP_ORDER,
	EVENT_GROUP_LABELS,
	EVENT_PRIORITIES,
	type EventType
} from "./contexts/events/domain/model/constants";

// ============================================================================
// Alert関連の定数とラベル
// ============================================================================

// アラート関連
export {
	ALERT_TYPES,
	ALERT_TYPE_LABELS,
	ALERT_SEVERITIES,
	ALERT_SEVERITY_LABELS,
	ALERT_STATUSES,
	ALERT_STATUS_LABELS,
	STATUS_UPDATE_MESSAGES,
	type AlertType,
	type AlertSeverity,
	type AlertStatus
} from "./contexts/alerts/domain/constants";

// ============================================================================
// その他の共通型
// ============================================================================

// Brand型（ID型）
export type {
	CattleId,
	UserId,
	EventId,
	AlertId
} from "./shared/brand";
