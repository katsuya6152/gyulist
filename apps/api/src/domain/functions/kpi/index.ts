/**
 * KPI Domain Functions
 *
 * KPI管理ドメインの関数群を集約するインデックスファイル
 */

// KPI Event Factory functions
export {
	createKpiEvent,
	updateKpiEvent,
	validateKpiEventProps,
	compareKpiEvents,
	isKpiEventInPeriod,
	filterKpiEventsByType,
	groupKpiEventsByCattle,
	calculateKpiEventStats
} from "./kpiEventFactory";

// Breeding Metrics Calculator functions
export {
	createConceptionRate,
	createAverageDaysOpen,
	createAverageCalvingInterval,
	createAIPerConception,
	createBreedingMetrics,
	calculateBreedingEventCounts,
	validateBreedingMetrics
} from "./breedingMetricsCalculator";

// Trend Analysis Calculator functions
export {
	createTrendPoint,
	createTrendDelta,
	createTrendAnalysis,
	compareBreedingMetrics,
	trendAnalysisToJson
} from "./trendAnalysisCalculator";
