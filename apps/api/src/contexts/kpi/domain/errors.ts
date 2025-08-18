/**
 * KPIコンテキスト - ドメインエラー
 *
 * KPI計算・分析に関連するドメインエラーを定義します。
 */

/**
 * KPIドメインエラーの種類
 */
export type KpiDomainError =
	| { type: "ValidationError"; message: string; field?: string }
	| { type: "CalculationError"; message: string; cause?: string }
	| { type: "DataInsufficientError"; message: string; requiredData?: string[] }
	| { type: "PeriodError"; message: string; invalidPeriod?: string }
	| {
			type: "MetricError";
			message: string;
			metricType?: string;
			value?: number;
	  }
	| { type: "InfraError"; message: string; cause?: unknown };

/**
 * バリデーションエラーの作成
 */
export function createValidationError(
	message: string,
	field?: string
): KpiDomainError {
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
): KpiDomainError {
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
): KpiDomainError {
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
): KpiDomainError {
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
): KpiDomainError {
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
export function createInfraError(
	message: string,
	cause?: unknown
): KpiDomainError {
	return {
		type: "InfraError",
		message,
		cause
	};
}

/**
 * エラーメッセージの取得
 */
export function getErrorMessage(error: KpiDomainError): string {
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
export function getErrorDetails(
	error: KpiDomainError
): Record<string, unknown> {
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
