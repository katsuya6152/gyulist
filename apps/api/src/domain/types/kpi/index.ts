/**
 * KPI Domain Types
 *
 * KPI管理ドメインの型定義を集約するインデックスファイル
 */

// KPI Event Types
export type {
	KpiEvent,
	NewKpiEventProps,
	UpdateKpiEventProps,
	KpiEventMetadata,
	KpiEventStats,
	KpiEventSearchCriteria
} from "./KpiEvent";

// KPI Types and Constants
export type {
	BreedingEventType,
	MetricType,
	PeriodType,
	MonthPeriod,
	DateRange,
	TrendDirection,
	OverallTrendDirection,
	ConfidenceLevel,
	KpiEventId,
	MetricValue,
	ConceptionRate,
	AverageDaysOpen,
	AverageCalvingInterval,
	AIPerConception,
	BreedingMetrics,
	BreedingEventCounts,
	TrendCounts
} from "./KpiTypes";

// Functions only (constants not exported to avoid Cloudflare Workers type conflicts)
export {
	isValidMetricValue,
	roundMetricValue,
	isValidMonthPeriod,
	isValidDateRange,
	formatMonthPeriod,
	formatDateRange,
	parseMonthPeriod,
	createDateRange,
	createMonthPeriod
} from "./KpiTypes";

// Constants available in KpiTypes.ts: BREEDING_EVENT_TYPES, METRIC_TYPES, etc.

// Trend Analysis Types
export type {
	TrendPoint,
	MetricChanges,
	TrendDelta,
	OverallTrend,
	TrendAnalysis,
	TrendAnalysisSearchCriteria,
	TrendAnalysisResult
} from "./TrendAnalysis";
