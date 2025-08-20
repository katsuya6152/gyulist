import { describe, expect, it } from "vitest";
import {
	type AlertsDomainError,
	createAlertNotFoundError,
	createBusinessRuleError,
	createCattleNotFoundError,
	createInfraError,
	createPermissionError,
	createStatusTransitionError,
	createValidationError,
	getErrorDetails,
	getErrorMessage
} from "../../domain/errors";

describe("Alerts Domain Errors", () => {
	describe("createValidationError", () => {
		it("should create validation error with message", () => {
			const error = createValidationError("Invalid email format");
			expect(error).toEqual({
				type: "ValidationError",
				message: "Invalid email format",
				field: undefined
			});
		});

		it("should create validation error with message and field", () => {
			const error = createValidationError("Invalid email format", "email");
			expect(error).toEqual({
				type: "ValidationError",
				message: "Invalid email format",
				field: "email"
			});
		});
	});

	describe("createBusinessRuleError", () => {
		it("should create business rule error with message", () => {
			const error = createBusinessRuleError("Cannot delete active alert");
			expect(error).toEqual({
				type: "BusinessRuleError",
				message: "Cannot delete active alert",
				rule: undefined
			});
		});

		it("should create business rule error with message and rule", () => {
			const error = createBusinessRuleError(
				"Cannot delete active alert",
				"ALERT_DELETION_RULE"
			);
			expect(error).toEqual({
				type: "BusinessRuleError",
				message: "Cannot delete active alert",
				rule: "ALERT_DELETION_RULE"
			});
		});
	});

	describe("createAlertNotFoundError", () => {
		it("should create alert not found error without alertId", () => {
			const error = createAlertNotFoundError();
			expect(error).toEqual({
				type: "AlertNotFoundError",
				message: "アラートが見つかりません",
				alertId: undefined
			});
		});

		it("should create alert not found error with alertId", () => {
			const error = createAlertNotFoundError("alert-123");
			expect(error).toEqual({
				type: "AlertNotFoundError",
				message: "アラートが見つかりません: alert-123",
				alertId: "alert-123"
			});
		});
	});

	describe("createStatusTransitionError", () => {
		it("should create status transition error", () => {
			const error = createStatusTransitionError("active", "deleted");
			expect(error).toEqual({
				type: "StatusTransitionError",
				message: "ステータス active から deleted への変更は許可されていません",
				currentStatus: "active",
				newStatus: "deleted"
			});
		});
	});

	describe("createPermissionError", () => {
		it("should create permission error with message", () => {
			const error = createPermissionError("Access denied");
			expect(error).toEqual({
				type: "PermissionError",
				message: "Access denied",
				userId: undefined
			});
		});

		it("should create permission error with message and userId", () => {
			const error = createPermissionError("Access denied", 123);
			expect(error).toEqual({
				type: "PermissionError",
				message: "Access denied",
				userId: 123
			});
		});
	});

	describe("createCattleNotFoundError", () => {
		it("should create cattle not found error without cattleId", () => {
			const error = createCattleNotFoundError();
			expect(error).toEqual({
				type: "CattleNotFoundError",
				message: "牛が見つかりません",
				cattleId: undefined
			});
		});

		it("should create cattle not found error with cattleId", () => {
			const error = createCattleNotFoundError(456);
			expect(error).toEqual({
				type: "CattleNotFoundError",
				message: "牛が見つかりません: 456",
				cattleId: 456
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
			const error: AlertsDomainError = createValidationError(
				"Invalid input",
				"email"
			);
			expect(getErrorMessage(error)).toBe(
				"バリデーションエラー: Invalid input"
			);
		});

		it("should return correct message for BusinessRuleError", () => {
			const error: AlertsDomainError =
				createBusinessRuleError("Rule violation");
			expect(getErrorMessage(error)).toBe(
				"ビジネスルールエラー: Rule violation"
			);
		});

		it("should return correct message for AlertNotFoundError", () => {
			const error: AlertsDomainError = createAlertNotFoundError("alert-123");
			expect(getErrorMessage(error)).toBe(
				"アラートが見つかりません: alert-123"
			);
		});

		it("should return correct message for StatusTransitionError", () => {
			const error: AlertsDomainError = createStatusTransitionError(
				"active",
				"deleted"
			);
			expect(getErrorMessage(error)).toBe(
				"ステータス active から deleted への変更は許可されていません"
			);
		});

		it("should return correct message for PermissionError", () => {
			const error: AlertsDomainError = createPermissionError(
				"Access denied",
				123
			);
			expect(getErrorMessage(error)).toBe("権限エラー: Access denied");
		});

		it("should return correct message for CattleNotFoundError", () => {
			const error: AlertsDomainError = createCattleNotFoundError(456);
			expect(getErrorMessage(error)).toBe("牛が見つかりません: 456");
		});

		it("should return correct message for InfraError", () => {
			const error: AlertsDomainError = createInfraError("Database error");
			expect(getErrorMessage(error)).toBe("インフラエラー: Database error");
		});
	});

	describe("getErrorDetails", () => {
		it("should return correct details for ValidationError", () => {
			const error: AlertsDomainError = createValidationError(
				"Invalid input",
				"email"
			);
			expect(getErrorDetails(error)).toEqual({
				field: "email",
				message: "Invalid input"
			});
		});

		it("should return correct details for BusinessRuleError", () => {
			const error: AlertsDomainError = createBusinessRuleError(
				"Rule violation",
				"RULE_001"
			);
			expect(getErrorDetails(error)).toEqual({
				rule: "RULE_001",
				message: "Rule violation"
			});
		});

		it("should return correct details for AlertNotFoundError", () => {
			const error: AlertsDomainError = createAlertNotFoundError("alert-123");
			expect(getErrorDetails(error)).toEqual({
				alertId: "alert-123",
				message: "アラートが見つかりません: alert-123"
			});
		});

		it("should return correct details for StatusTransitionError", () => {
			const error: AlertsDomainError = createStatusTransitionError(
				"active",
				"deleted"
			);
			expect(getErrorDetails(error)).toEqual({
				currentStatus: "active",
				newStatus: "deleted",
				message: "ステータス active から deleted への変更は許可されていません"
			});
		});

		it("should return correct details for PermissionError", () => {
			const error: AlertsDomainError = createPermissionError(
				"Access denied",
				123
			);
			expect(getErrorDetails(error)).toEqual({
				userId: 123,
				message: "Access denied"
			});
		});

		it("should return correct details for CattleNotFoundError", () => {
			const error: AlertsDomainError = createCattleNotFoundError(456);
			expect(getErrorDetails(error)).toEqual({
				cattleId: 456,
				message: "牛が見つかりません: 456"
			});
		});

		it("should return correct details for InfraError", () => {
			const cause = new Error("Connection timeout");
			const error: AlertsDomainError = createInfraError(
				"Database error",
				cause
			);
			expect(getErrorDetails(error)).toEqual({
				cause,
				message: "Database error"
			});
		});
	});
});
