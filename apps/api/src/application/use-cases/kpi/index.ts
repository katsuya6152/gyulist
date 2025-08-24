/**
 * KPI Use Cases
 *
 * KPI管理ドメインのユースケース群を集約
 */

// KPI use cases
export { calculateBreedingMetricsUseCase } from "./calculateBreedingMetrics";
export { getBreedingKpiUseCase } from "./getBreedingKpi";
export { getBreedingKpiDeltaUseCase } from "./getBreedingKpiDelta";
export { getBreedingTrendsUseCase } from "./getBreedingTrends";

// Types
export type {
	CalculateBreedingMetricsUseCase,
	CalculateBreedingMetricsDeps,
	CalculateBreedingMetricsInput,
	CalculateBreedingMetricsResult
} from "./calculateBreedingMetrics";
export type {
	GetBreedingKpiUseCase,
	GetBreedingKpiDeps,
	GetBreedingKpiInput,
	GetBreedingKpiResult
} from "./getBreedingKpi";
export type {
	GetBreedingKpiDeltaUseCase,
	GetBreedingKpiDeltaDeps,
	GetBreedingKpiDeltaInput,
	BreedingKpiDelta
} from "./getBreedingKpiDelta";
export type {
	GetBreedingTrendsUseCase,
	GetBreedingTrendsDeps,
	GetBreedingTrendsInput
} from "./getBreedingTrends";
