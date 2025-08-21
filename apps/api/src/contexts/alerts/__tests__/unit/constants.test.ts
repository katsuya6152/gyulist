import { describe, expect, it } from "vitest";
import {
	ALERT_SEVERITIES,
	ALERT_SEVERITY_LABELS,
	ALERT_TYPES,
	ALERT_TYPE_LABELS,
	type AlertSeverity,
	type AlertType
} from "../../domain/constants";

describe("Alerts Domain Constants", () => {
	describe("ALERT_TYPES", () => {
		it("should contain all expected alert types", () => {
			expect(ALERT_TYPES).toEqual([
				"OPEN_DAYS_OVER60_NO_AI",
				"CALVING_WITHIN_60",
				"CALVING_OVERDUE",
				"ESTRUS_OVER20_NOT_PREGNANT"
			]);
		});

		it("should have correct type", () => {
			const testType: AlertType = "OPEN_DAYS_OVER60_NO_AI";
			expect(ALERT_TYPES).toContain(testType);
		});
	});

	describe("ALERT_TYPE_LABELS", () => {
		it("should contain labels for all alert types", () => {
			for (const type of ALERT_TYPES) {
				expect(ALERT_TYPE_LABELS[type]).toBeDefined();
				expect(typeof ALERT_TYPE_LABELS[type]).toBe("string");
			}
		});

		it("should have correct Japanese labels", () => {
			expect(ALERT_TYPE_LABELS.OPEN_DAYS_OVER60_NO_AI).toBe(
				"空胎60日以上（AI未実施）"
			);
			expect(ALERT_TYPE_LABELS.CALVING_WITHIN_60).toBe("60日以内分娩予定");
			expect(ALERT_TYPE_LABELS.CALVING_OVERDUE).toBe("分娩予定日超過");
			expect(ALERT_TYPE_LABELS.ESTRUS_OVER20_NOT_PREGNANT).toBe(
				"発情から20日以上未妊娠"
			);
		});
	});

	describe("ALERT_SEVERITIES", () => {
		it("should contain all expected severities", () => {
			expect(ALERT_SEVERITIES).toEqual(["high", "medium", "low"]);
		});

		it("should have correct type", () => {
			const testSeverity: AlertSeverity = "high";
			expect(ALERT_SEVERITIES).toContain(testSeverity);
		});
	});

	describe("ALERT_SEVERITY_LABELS", () => {
		it("should contain labels for all severities", () => {
			for (const severity of ALERT_SEVERITIES) {
				expect(ALERT_SEVERITY_LABELS[severity]).toBeDefined();
				expect(typeof ALERT_SEVERITY_LABELS[severity]).toBe("string");
			}
		});

		it("should have correct Japanese labels", () => {
			expect(ALERT_SEVERITY_LABELS.high).toBe("高");
			expect(ALERT_SEVERITY_LABELS.medium).toBe("中");
			expect(ALERT_SEVERITY_LABELS.low).toBe("低");
		});
	});

	describe("Type safety", () => {
		it("should ensure all alert types have corresponding labels", () => {
			for (const type of ALERT_TYPES) {
				expect(ALERT_TYPE_LABELS).toHaveProperty(type);
			}
		});

		it("should ensure all severities have corresponding labels", () => {
			for (const severity of ALERT_SEVERITIES) {
				expect(ALERT_SEVERITY_LABELS).toHaveProperty(severity);
			}
		});
	});
});
