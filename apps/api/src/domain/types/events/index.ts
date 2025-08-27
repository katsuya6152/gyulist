/**
 * Events Domain Types
 *
 * イベント管理ドメインの型定義を集約するインデックスファイル
 */

// Core entity types
export type {
	Event,
	NewEventProps,
	UpdateEventProps,
	EventSearchCriteria,
	EventSearchResult
} from "./Event";

// Value object types and constants
export type {
	EventType,
	EventPriority,
	EventGroup
} from "./EventTypes";

// Constants (not exported to avoid Cloudflare Workers type conflicts)
// Available in EventTypes.ts: EVENT_TYPES, EVENT_PRIORITIES, EVENT_GROUP_ORDER, etc.
