/**
 * KPI Use Cases
 *
 * KPI管理ドメインのユースケース群を集約
 */

// Use case functions
export { getBreedingKpiUseCase } from "./getBreedingKpi";
export { getBreedingTrendsUseCase } from "./getBreedingTrends";
export { calculateBreedingMetricsUseCase } from "./calculateBreedingMetrics";

// Types
export type {
	GetBreedingKpiUseCase,
	GetBreedingKpiDeps,
	GetBreedingKpiInput,
	GetBreedingKpiResult
} from "./getBreedingKpi";
export type {
	GetBreedingTrendsUseCase,
	GetBreedingTrendsDeps,
	GetBreedingTrendsInput
} from "./getBreedingTrends";
export type {
	CalculateBreedingMetricsUseCase,
	CalculateBreedingMetricsDeps,
	CalculateBreedingMetricsInput,
	CalculateBreedingMetricsResult
} from "./calculateBreedingMetrics";
