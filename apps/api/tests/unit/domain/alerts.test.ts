/**
 * Alerts Domain Unit Tests - New Architecture
 *
 * アラート管理ドメインロジックのユニットテスト
 */

import { describe, expect, it } from "vitest";
import {
	createAlert,
	createAlertSeverity,
	createAlertStatus,
	createAlertType,
	updateAlert,
	updateAlertSeverity,
	updateAlertStatus
} from "../../../src/domain/functions/alerts/alertFactory";
import {
	validateNewAlertProps,
	validateStatusTransition,
	validateUpdateAlertProps
} from "../../../src/domain/functions/alerts/alertValidation";
import type {
	Alert,
	NewAlertProps,
	UpdateAlertProps
} from "../../../src/domain/types/alerts";
import type {
	AlertId,
	AlertMessage,
	AlertSeverity,
	AlertStatus,
	AlertType,
	DueDate
} from "../../../src/domain/types/alerts/AlertTypes";
import type { CattleId, UserId } from "../../../src/shared/brand";

describe("Alerts Domain Functions - New Architecture", () => {
	const mockCurrentTime = new Date("2024-01-01T00:00:00Z");
	const mockUserId = 1 as UserId;
	const mockCattleId = 1 as CattleId;

	describe("createAlert", () => {
		it("should create alert with valid data", () => {
			const props: NewAlertProps = {
				type: "OPEN_DAYS_OVER60_NO_AI",
				severity: "medium",
				cattleId: mockCattleId,
				cattleName: "テスト牛001",
				cattleEarTagNumber: 12345,
				dueAt: new Date("2024-01-15T00:00:00Z"),
				message: "空胎60日以上経過しています",
				memo: "早めの対応が必要",
				ownerUserId: mockUserId
			};

			const result = createAlert(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const alert = result.value;
				expect(alert.type).toBe("OPEN_DAYS_OVER60_NO_AI");
				expect(alert.severity).toBe("medium");
				expect(alert.status).toBe("active");
				expect(alert.cattleId).toBe(mockCattleId);
				expect(alert.cattleName).toBe("テスト牛001");
				expect(alert.message).toBe("空胎60日以上経過しています");
				expect(alert.ownerUserId).toBe(mockUserId);
				expect(alert.createdAt).toBe(mockCurrentTime);
				expect(alert.updatedAt).toBe(mockCurrentTime);
				expect(alert.acknowledgedAt).toBe(null);
				expect(alert.resolvedAt).toBe(null);
			}
		});

		it("should normalize string inputs", () => {
			const props: NewAlertProps = {
				type: "OPEN_DAYS_OVER60_NO_AI",
				severity: "medium",
				cattleId: mockCattleId,
				cattleName: "  テスト牛001  ",
				cattleEarTagNumber: 12345,
				dueAt: null,
				message: "  空胎60日以上経過しています  ",
				memo: "  早めの対応が必要  ",
				ownerUserId: mockUserId
			};

			const result = createAlert(props, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.cattleName).toBe("テスト牛001");
				expect(result.value.message).toBe("空胎60日以上経過しています");
				expect(result.value.memo).toBe("早めの対応が必要");
			}
		});

		it("should reject invalid alert type", () => {
			const props: NewAlertProps = {
				type: "INVALID_TYPE" as AlertType,
				severity: "medium",
				cattleId: mockCattleId,
				cattleName: "テスト牛001",
				cattleEarTagNumber: 12345,
				dueAt: null,
				message: "テストメッセージ",
				memo: null,
				ownerUserId: mockUserId
			};

			const result = createAlert(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("type");
			}
		});

		it("should reject empty message", () => {
			const props: NewAlertProps = {
				type: "OPEN_DAYS_OVER60_NO_AI",
				severity: "medium",
				cattleId: mockCattleId,
				cattleName: "テスト牛001",
				cattleEarTagNumber: 12345,
				dueAt: null,
				message: "",
				memo: null,
				ownerUserId: mockUserId
			};

			const result = createAlert(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("message");
			}
		});
	});

	describe("updateAlert", () => {
		const baseAlert: Alert = {
			id: 1 as AlertId,
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			status: "active",
			cattleId: mockCattleId,
			cattleName: "テスト牛001",
			cattleEarTagNumber: 12345,
			dueAt: new Date("2024-01-15T00:00:00Z") as DueDate,
			message: "空胎60日以上経過しています" as AlertMessage,
			memo: "早めの対応が必要",
			ownerUserId: mockUserId,
			createdAt: mockCurrentTime,
			updatedAt: mockCurrentTime,
			acknowledgedAt: null,
			resolvedAt: null
		};

		it("should update alert with valid data", () => {
			const updates: UpdateAlertProps = {
				status: "acknowledged",
				severity: "high",
				message: "更新されたメッセージ",
				memo: "更新されたメモ"
			};

			const result = updateAlert(baseAlert, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				const updatedAlert = result.value;
				expect(updatedAlert.status).toBe("acknowledged");
				expect(updatedAlert.severity).toBe("high");
				expect(updatedAlert.message).toBe("更新されたメッセージ");
				expect(updatedAlert.memo).toBe("更新されたメモ");
				expect(updatedAlert.updatedAt).toBe(mockCurrentTime);
			}
		});

		it("should reject invalid status transition", () => {
			const updates: UpdateAlertProps = {
				status: "resolved" // active -> resolved は無効
			};

			const result = updateAlert(baseAlert, updates, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "StatusTransitionError") {
				expect(result.error.currentStatus).toBe("active");
				expect(result.error.targetStatus).toBe("resolved");
			}
		});

		it("should allow valid status transition", () => {
			const acknowledgedAlert = {
				...baseAlert,
				status: "acknowledged" as AlertStatus
			};
			const updates: UpdateAlertProps = {
				status: "resolved"
			};

			const result = updateAlert(acknowledgedAlert, updates, mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.status).toBe("resolved");
			}
		});
	});

	describe("updateAlertStatus", () => {
		const baseAlert: Alert = {
			id: 1 as AlertId,
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			status: "active",
			cattleId: mockCattleId,
			cattleName: "テスト牛001",
			cattleEarTagNumber: 12345,
			dueAt: new Date("2024-01-15T00:00:00Z") as DueDate,
			message: "空胎60日以上経過しています" as AlertMessage,
			memo: "早めの対応が必要",
			ownerUserId: mockUserId,
			createdAt: mockCurrentTime,
			updatedAt: mockCurrentTime,
			acknowledgedAt: null,
			resolvedAt: null
		};

		it("should update status to acknowledged and set acknowledgedAt", () => {
			const result = updateAlertStatus(
				baseAlert,
				"acknowledged",
				mockCurrentTime
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.status).toBe("acknowledged");
				expect(result.value.acknowledgedAt).toBe(mockCurrentTime);
				expect(result.value.resolvedAt).toBe(null);
			}
		});

		it("should update status to resolved and set resolvedAt", () => {
			const acknowledgedAlert = {
				...baseAlert,
				status: "acknowledged" as AlertStatus
			};
			const result = updateAlertStatus(
				acknowledgedAlert,
				"resolved",
				mockCurrentTime
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.status).toBe("resolved");
				expect(result.value.resolvedAt).toBe(mockCurrentTime);
			}
		});

		it("should reject invalid status transition", () => {
			const result = updateAlertStatus(baseAlert, "resolved", mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("status");
			}
		});
	});

	describe("updateAlertSeverity", () => {
		const baseAlert: Alert = {
			id: 1 as AlertId,
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			status: "active",
			cattleId: mockCattleId,
			cattleName: "テスト牛001",
			cattleEarTagNumber: 12345,
			dueAt: new Date("2024-01-15T00:00:00Z") as DueDate,
			message: "空胎60日以上経過しています" as AlertMessage,
			memo: "早めの対応が必要",
			ownerUserId: mockUserId,
			createdAt: mockCurrentTime,
			updatedAt: mockCurrentTime,
			acknowledgedAt: null,
			resolvedAt: null
		};

		it("should update severity", () => {
			const result = updateAlertSeverity(baseAlert, "high", mockCurrentTime);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.severity).toBe("high");
				expect(result.value.updatedAt).toBe(mockCurrentTime);
			}
		});
	});

	describe("Alert Type/Severity/Status Creation", () => {
		it("should create alert type", () => {
			const alertType = createAlertType("OPEN_DAYS_OVER60_NO_AI");

			expect(alertType.value).toBe("OPEN_DAYS_OVER60_NO_AI");
			expect(alertType.displayName).toBe("空胎60日以上（AI未実施）");
			expect(alertType.category).toBe("breeding");
			expect(alertType.defaultSeverity).toBe("medium");
			expect(alertType.requiresAction).toBe(true);
		});

		it("should create alert severity", () => {
			const severity = createAlertSeverity("high");

			expect(severity.value).toBe("high");
			expect(severity.displayName).toBe("高");
			expect(severity.color).toBe("red");
		});

		it("should create alert status", () => {
			const status = createAlertStatus("active");

			expect(status.value).toBe("active");
			expect(status.displayName).toBe("アクティブ");
			expect(status.isActive).toBe(true);
		});
	});

	describe("validateNewAlertProps", () => {
		it("should validate valid alert props", () => {
			const props: NewAlertProps = {
				type: "OPEN_DAYS_OVER60_NO_AI",
				severity: "medium",
				cattleId: mockCattleId,
				cattleName: "テスト牛001",
				cattleEarTagNumber: 12345,
				dueAt: new Date("2024-01-15T00:00:00Z"),
				message: "テストメッセージ",
				memo: "テストメモ",
				ownerUserId: mockUserId
			};

			const result = validateNewAlertProps(props, mockCurrentTime);

			expect(result.ok).toBe(true);
		});

		it("should reject empty message", () => {
			const props: NewAlertProps = {
				type: "OPEN_DAYS_OVER60_NO_AI",
				severity: "medium",
				cattleId: mockCattleId,
				cattleName: "テスト牛001",
				cattleEarTagNumber: 12345,
				dueAt: null,
				message: "",
				memo: null,
				ownerUserId: mockUserId
			};

			const result = validateNewAlertProps(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("message");
			}
		});

		it("should reject invalid alert type", () => {
			const props: NewAlertProps = {
				type: "INVALID_TYPE" as AlertType,
				severity: "medium",
				cattleId: mockCattleId,
				cattleName: "テスト牛001",
				cattleEarTagNumber: 12345,
				dueAt: null,
				message: "テストメッセージ",
				memo: null,
				ownerUserId: mockUserId
			};

			const result = validateNewAlertProps(props, mockCurrentTime);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("type");
			}
		});
	});

	describe("validateUpdateAlertProps", () => {
		it("should validate valid update props", () => {
			const updates: UpdateAlertProps = {
				status: "acknowledged",
				severity: "high",
				message: "更新されたメッセージ",
				memo: "更新されたメモ"
			};

			const result = validateUpdateAlertProps(updates);

			expect(result.ok).toBe(true);
		});

		it("should reject empty message in updates", () => {
			const updates: UpdateAlertProps = {
				message: ""
			};

			const result = validateUpdateAlertProps(updates);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("message");
			}
		});
	});

	describe("validateStatusTransition", () => {
		it("should allow active to acknowledged", () => {
			const result = validateStatusTransition("active", "acknowledged");

			expect(result.ok).toBe(true);
		});

		it("should allow acknowledged to resolved", () => {
			const result = validateStatusTransition("acknowledged", "resolved");

			expect(result.ok).toBe(true);
		});

		it("should allow acknowledged to dismissed", () => {
			const result = validateStatusTransition("acknowledged", "dismissed");

			expect(result.ok).toBe(true);
		});

		it("should reject active to resolved", () => {
			const result = validateStatusTransition("active", "resolved");

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("status");
			}
		});

		it("should reject resolved to active", () => {
			const result = validateStatusTransition("resolved", "active");

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "ValidationError") {
				expect(result.error.field).toBe("status");
			}
		});
	});
});
