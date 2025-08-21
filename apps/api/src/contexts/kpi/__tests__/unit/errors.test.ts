import { describe, expect, it } from "vitest";
import {
	type KpiDomainError,
	createCalculationError,
	createDataInsufficientError,
	createInfraError,
	createMetricError,
	createPeriodError,
	createValidationError,
	getErrorDetails,
	getErrorMessage
} from "../../domain/errors";

describe("KPI Domain Errors", () => {
	describe("createValidationError", () => {
		it("should create validation error with message", () => {
			const error = createValidationError("Invalid date format");
			expect(error).toEqual({
				type: "ValidationError",
				message: "Invalid date format",
				field: undefined
			});
		});

		it("should create validation error with message and field", () => {
			const error = createValidationError("Invalid date format", "startDate");
			expect(error).toEqual({
				type: "ValidationError",
				message: "Invalid date format",
				field: "startDate"
			});
		});
	});

	describe("createCalculationError", () => {
		it("should create calculation error with message", () => {
			const error = createCalculationError("Division by zero");
			expect(error).toEqual({
				type: "CalculationError",
				message: "Division by zero",
				cause: undefined
			});
		});

		it("should create calculation error with message and cause", () => {
			const error = createCalculationError(
				"Division by zero",
				"Zero value in denominator"
			);
			expect(error).toEqual({
				type: "CalculationError",
				message: "Division by zero",
				cause: "Zero value in denominator"
			});
		});
	});

	describe("createDataInsufficientError", () => {
		it("should create data insufficient error with message", () => {
			const error = createDataInsufficientError(
				"Insufficient data for calculation"
			);
			expect(error).toEqual({
				type: "DataInsufficientError",
				message: "Insufficient data for calculation",
				requiredData: undefined
			});
		});

		it("should create data insufficient error with message and required data", () => {
			const error = createDataInsufficientError(
				"Insufficient data for calculation",
				["breeding_records", "calving_records"]
			);
			expect(error).toEqual({
				type: "DataInsufficientError",
				message: "Insufficient data for calculation",
				requiredData: ["breeding_records", "calving_records"]
			});
		});
	});

	describe("createPeriodError", () => {
		it("should create period error with message", () => {
			const error = createPeriodError("Invalid period range");
			expect(error).toEqual({
				type: "PeriodError",
				message: "Invalid period range",
				invalidPeriod: undefined
			});
		});

		it("should create period error with message and invalid period", () => {
			const error = createPeriodError(
				"Invalid period range",
				"2024-13-01 to 2024-12-31"
			);
			expect(error).toEqual({
				type: "PeriodError",
				message: "Invalid period range",
				invalidPeriod: "2024-13-01 to 2024-12-31"
			});
		});
	});

	describe("createMetricError", () => {
		it("should create metric error with message", () => {
			const error = createMetricError("Invalid metric value");
			expect(error).toEqual({
				type: "MetricError",
				message: "Invalid metric value",
				metricType: undefined,
				value: undefined
			});
		});

		it("should create metric error with message and metric type", () => {
			const error = createMetricError(
				"Invalid metric value",
				"conception_rate"
			);
			expect(error).toEqual({
				type: "MetricError",
				message: "Invalid metric value",
				metricType: "conception_rate",
				value: undefined
			});
		});

		it("should create metric error with message, metric type, and value", () => {
			const error = createMetricError(
				"Invalid metric value",
				"conception_rate",
				150
			);
			expect(error).toEqual({
				type: "MetricError",
				message: "Invalid metric value",
				metricType: "conception_rate",
				value: 150
			});
		});
	});

	describe("createInfraError", () => {
		it("should create infra error with message", () => {
			const error = createInfraError("Database connection failed");
			expect(error).toEqual({
				type: "InfraError",
				message: "Database connection failed",
				cause: undefined
			});
		});

		it("should create infra error with message and cause", () => {
			const cause = new Error("Connection timeout");
			const error = createInfraError("Database connection failed", cause);
			expect(error).toEqual({
				type: "InfraError",
				message: "Database connection failed",
				cause
			});
		});
	});

	describe("getErrorMessage", () => {
		it("should return correct message for ValidationError", () => {
			const error: KpiDomainError = createValidationError(
				"Invalid date format",
				"startDate"
			);
			expect(getErrorMessage(error)).toBe(
				"バリデーションエラー: Invalid date format (フィールド: startDate)"
			);
		});

		it("should return correct message for ValidationError without field", () => {
			const error: KpiDomainError = createValidationError(
				"Invalid date format"
			);
			expect(getErrorMessage(error)).toBe(
				"バリデーションエラー: Invalid date format"
			);
		});

		it("should return correct message for CalculationError", () => {
			const error: KpiDomainError = createCalculationError(
				"Division by zero",
				"Zero value"
			);
			expect(getErrorMessage(error)).toBe(
				"計算エラー: Division by zero (原因: Zero value)"
			);
		});

		it("should return correct message for CalculationError without cause", () => {
			const error: KpiDomainError = createCalculationError("Division by zero");
			expect(getErrorMessage(error)).toBe("計算エラー: Division by zero");
		});

		it("should return correct message for DataInsufficientError", () => {
			const error: KpiDomainError = createDataInsufficientError(
				"Insufficient data",
				["breeding_records"]
			);
			expect(getErrorMessage(error)).toBe(
				"データ不足エラー: Insufficient data (必要なデータ: breeding_records)"
			);
		});

		it("should return correct message for DataInsufficientError without required data", () => {
			const error: KpiDomainError =
				createDataInsufficientError("Insufficient data");
			expect(getErrorMessage(error)).toBe(
				"データ不足エラー: Insufficient data"
			);
		});

		it("should return correct message for PeriodError", () => {
			const error: KpiDomainError = createPeriodError(
				"Invalid period",
				"2024-13-01"
			);
			expect(getErrorMessage(error)).toBe(
				"期間エラー: Invalid period (無効な期間: 2024-13-01)"
			);
		});

		it("should return correct message for PeriodError without invalid period", () => {
			const error: KpiDomainError = createPeriodError("Invalid period");
			expect(getErrorMessage(error)).toBe("期間エラー: Invalid period");
		});

		it("should return correct message for MetricError", () => {
			const error: KpiDomainError = createMetricError(
				"Invalid value",
				"conception_rate",
				150
			);
			expect(getErrorMessage(error)).toBe(
				"指標エラー: Invalid value (指標: conception_rate) (値: 150)"
			);
		});

		it("should return correct message for MetricError without metric type and value", () => {
			const error: KpiDomainError = createMetricError("Invalid value");
			expect(getErrorMessage(error)).toBe("指標エラー: Invalid value");
		});

		it("should return correct message for InfraError", () => {
			const error: KpiDomainError = createInfraError("Database error");
			expect(getErrorMessage(error)).toBe("インフラエラー: Database error");
		});
	});

	describe("getErrorDetails", () => {
		it("should return correct details for ValidationError", () => {
			const error: KpiDomainError = createValidationError(
				"Invalid date format",
				"startDate"
			);
			const details = getErrorDetails(error);

			expect(details.type).toBe("ValidationError");
			expect(details.message).toBe("Invalid date format");
			expect(details.field).toBe("startDate");
			expect(details.timestamp).toBeDefined();
		});

		it("should return correct details for CalculationError", () => {
			const error: KpiDomainError = createCalculationError(
				"Division by zero",
				"Zero value"
			);
			const details = getErrorDetails(error);

			expect(details.type).toBe("CalculationError");
			expect(details.message).toBe("Division by zero");
			expect(details.cause).toBe("Zero value");
			expect(details.timestamp).toBeDefined();
		});

		it("should return correct details for DataInsufficientError", () => {
			const error: KpiDomainError = createDataInsufficientError(
				"Insufficient data",
				["breeding_records"]
			);
			const details = getErrorDetails(error);

			expect(details.type).toBe("DataInsufficientError");
			expect(details.message).toBe("Insufficient data");
			expect(details.requiredData).toEqual(["breeding_records"]);
			expect(details.timestamp).toBeDefined();
		});

		it("should return correct details for PeriodError", () => {
			const error: KpiDomainError = createPeriodError(
				"Invalid period",
				"2024-13-01"
			);
			const details = getErrorDetails(error);

			expect(details.type).toBe("PeriodError");
			expect(details.message).toBe("Invalid period");
			expect(details.invalidPeriod).toBe("2024-13-01");
			expect(details.timestamp).toBeDefined();
		});

		it("should return correct details for MetricError", () => {
			const error: KpiDomainError = createMetricError(
				"Invalid value",
				"conception_rate",
				150
			);
			const details = getErrorDetails(error);

			expect(details.type).toBe("MetricError");
			expect(details.message).toBe("Invalid value");
			expect(details.metricType).toBe("conception_rate");
			expect(details.value).toBe(150);
			expect(details.timestamp).toBeDefined();
		});

		it("should return correct details for InfraError", () => {
			const cause = new Error("Connection timeout");
			const error: KpiDomainError = createInfraError("Database error", cause);
			const details = getErrorDetails(error);

			expect(details.type).toBe("InfraError");
			expect(details.message).toBe("Database error");
			expect(details.cause).toBe(cause);
			expect(details.timestamp).toBeDefined();
		});

		it("should include timestamp in all error details", () => {
			const error: KpiDomainError = createValidationError("Test error");
			const details = getErrorDetails(error);

			expect(details.timestamp).toBeDefined();
			expect(typeof details.timestamp).toBe("string");
			expect(new Date(details.timestamp as string)).toBeInstanceOf(Date);
		});
	});

	describe("Type safety", () => {
		it("should ensure all error types are properly typed", () => {
			const errors: KpiDomainError[] = [
				createValidationError("Validation error"),
				createCalculationError("Calculation error"),
				createDataInsufficientError("Data insufficient"),
				createPeriodError("Period error"),
				createMetricError("Metric error"),
				createInfraError("Infra error")
			];

			expect(errors).toHaveLength(6);
			expect(errors[0].type).toBe("ValidationError");
			expect(errors[1].type).toBe("CalculationError");
			expect(errors[2].type).toBe("DataInsufficientError");
			expect(errors[3].type).toBe("PeriodError");
			expect(errors[4].type).toBe("MetricError");
			expect(errors[5].type).toBe("InfraError");
		});

		it("should handle optional fields correctly", () => {
			const validationError = createValidationError("Error");
			const calculationError = createCalculationError("Error");
			const dataError = createDataInsufficientError("Error");
			const periodError = createPeriodError("Error");
			const metricError = createMetricError("Error");
			const infraError = createInfraError("Error");

			if (validationError.type === "ValidationError") {
				expect(validationError.field).toBeUndefined();
			}
			if (calculationError.type === "CalculationError") {
				expect(calculationError.cause).toBeUndefined();
			}
			if (dataError.type === "DataInsufficientError") {
				expect(dataError.requiredData).toBeUndefined();
			}
			if (periodError.type === "PeriodError") {
				expect(periodError.invalidPeriod).toBeUndefined();
			}
			if (metricError.type === "MetricError") {
				expect(metricError.metricType).toBeUndefined();
				expect(metricError.value).toBeUndefined();
			}
			if (infraError.type === "InfraError") {
				expect(infraError.cause).toBeUndefined();
			}
		});
	});
});
