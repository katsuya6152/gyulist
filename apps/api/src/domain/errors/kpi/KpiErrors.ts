/**
 * KPI Domain Errors
 *
 * KPI管理ドメインで発生するエラーの型定義
 */

/**
 * バリデーションエラー
 */
export type ValidationError = {
	type: "ValidationError";
	message: string;
	field?: string;
};

/**
 * 計算エラー
 */
export type CalculationError = {
	type: "CalculationError";
	message: string;
	cause?: string;
};

/**
 * データ不足エラー
 */
export type DataInsufficientError = {
	type: "DataInsufficientError";
	message: string;
	requiredData?: string[];
};

/**
 * 期間エラー
 */
export type PeriodError = {
	type: "PeriodError";
	message: string;
	invalidPeriod?: string;
};

/**
 * 指標エラー
 */
export type MetricError = {
	type: "MetricError";
	message: string;
	metricType?: string;
	value?: number;
};

/**
 * インフラエラー
 */
export type InfraError = {
	type: "InfraError";
	message: string;
	cause?: unknown;
};

/**
 * KPI管理ドメインで発生する可能性のあるエラーの統合型
 */
export type KpiError =
	| ValidationError
	| CalculationError
	| DataInsufficientError
	| PeriodError
	| MetricError
	| InfraError;

// 互換性のための別名エクスポート
export type KpiDomainError = KpiError;

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * バリデーションエラーの作成
 */
export function createValidationError(
	message: string,
	field?: string
): ValidationError {
	return {
		type: "ValidationError",
		message,
		field
	};
}

/**
 * 計算エラーの作成
 */
export function createCalculationError(
	message: string,
	cause?: string
): CalculationError {
	return {
		type: "CalculationError",
		message,
		cause
	};
}

/**
 * データ不足エラーの作成
 */
export function createDataInsufficientError(
	message: string,
	requiredData?: string[]
): DataInsufficientError {
	return {
		type: "DataInsufficientError",
		message,
		requiredData
	};
}

/**
 * 期間エラーの作成
 */
export function createPeriodError(
	message: string,
	invalidPeriod?: string
): PeriodError {
	return {
		type: "PeriodError",
		message,
		invalidPeriod
	};
}

/**
 * 指標エラーの作成
 */
export function createMetricError(
	message: string,
	metricType?: string,
	value?: number
): MetricError {
	return {
		type: "MetricError",
		message,
		metricType,
		value
	};
}

/**
 * インフラエラーの作成
 */
export function createInfraError(message: string, cause?: unknown): InfraError {
	return {
		type: "InfraError",
		message,
		cause
	};
}

// ============================================================================
// Error Utility Functions
// ============================================================================

/**
 * エラーメッセージの取得
 */
export function getErrorMessage(error: KpiError): string {
	switch (error.type) {
		case "ValidationError":
			return `バリデーションエラー: ${error.message}${error.field ? ` (フィールド: ${error.field})` : ""}`;

		case "CalculationError":
			return `計算エラー: ${error.message}${error.cause ? ` (原因: ${error.cause})` : ""}`;

		case "DataInsufficientError":
			return `データ不足エラー: ${error.message}${error.requiredData ? ` (必要なデータ: ${error.requiredData.join(", ")})` : ""}`;

		case "PeriodError":
			return `期間エラー: ${error.message}${error.invalidPeriod ? ` (無効な期間: ${error.invalidPeriod})` : ""}`;

		case "MetricError":
			return `指標エラー: ${error.message}${error.metricType ? ` (指標: ${error.metricType})` : ""}${error.value !== undefined ? ` (値: ${error.value})` : ""}`;

		case "InfraError":
			return `インフラエラー: ${error.message}`;

		default: {
			const _exhaustive: never = error;
			return "不明なエラー";
		}
	}
}

/**
 * エラーの詳細情報を取得
 */
export function getErrorDetails(error: KpiError): Record<string, unknown> {
	const base = {
		type: error.type,
		message: error.message,
		timestamp: new Date().toISOString()
	};

	switch (error.type) {
		case "ValidationError":
			return { ...base, field: error.field };

		case "CalculationError":
			return { ...base, cause: error.cause };

		case "DataInsufficientError":
			return { ...base, requiredData: error.requiredData };

		case "PeriodError":
			return { ...base, invalidPeriod: error.invalidPeriod };

		case "MetricError":
			return { ...base, metricType: error.metricType, value: error.value };

		case "InfraError":
			return { ...base, cause: error.cause };

		default:
			return base;
	}
}
