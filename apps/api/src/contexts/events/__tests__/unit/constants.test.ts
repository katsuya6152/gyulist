import { describe, expect, it } from "vitest";
import {
	EVENT_GROUP_LABELS,
	EVENT_GROUP_ORDER,
	EVENT_PRIORITIES,
	EVENT_TYPES,
	EVENT_TYPE_GROUPS,
	EVENT_TYPE_LABELS,
	EVENT_TYPE_PRIORITIES,
	type EventPriority,
	type EventType
} from "../../domain/model/constants";

describe("Events Domain Constants", () => {
	describe("EVENT_TYPES", () => {
		it("should contain all expected event types", () => {
			expect(EVENT_TYPES).toEqual([
				"ARRIVAL",
				"ESTRUS",
				"EXPECTED_ESTRUS",
				"INSEMINATION",
				"PREGNANCY_CHECK",
				"EXPECTED_CALVING",
				"CALVING",
				"ABORTION",
				"STILLBIRTH",
				"DEATH",
				"WEANING",
				"START_FATTENING",
				"WEIGHT_MEASURED",
				"VACCINATION",
				"DIAGNOSIS",
				"MEDICATION",
				"TREATMENT_STARTED",
				"TREATMENT_COMPLETED",
				"HOOF_TRIMMING",
				"SHIPMENT",
				"OTHER"
			]);
		});

		it("should have correct type", () => {
			const testType: EventType = "ARRIVAL";
			expect(EVENT_TYPES).toContain(testType);
		});
	});

	describe("EVENT_GROUP_ORDER", () => {
		it("should contain all expected event groups", () => {
			expect(EVENT_GROUP_ORDER).toEqual([
				"ARRIVAL",
				"BREEDING",
				"CALVING",
				"GROWTH",
				"MEASUREMENT",
				"HEALTH",
				"LOGISTICS",
				"OTHER"
			]);
		});

		it("should maintain correct order for UI display", () => {
			// Check that important groups come first
			expect(EVENT_GROUP_ORDER[0]).toBe("ARRIVAL");
			expect(EVENT_GROUP_ORDER[1]).toBe("BREEDING");
			expect(EVENT_GROUP_ORDER[2]).toBe("CALVING");
		});
	});

	describe("EVENT_GROUP_LABELS", () => {
		it("should contain labels for all event groups", () => {
			for (const group of EVENT_GROUP_ORDER) {
				expect(EVENT_GROUP_LABELS[group]).toBeDefined();
				expect(typeof EVENT_GROUP_LABELS[group]).toBe("string");
			}
		});

		it("should have correct Japanese labels", () => {
			expect(EVENT_GROUP_LABELS.ARRIVAL).toBe("導入");
			expect(EVENT_GROUP_LABELS.BREEDING).toBe("繁殖");
			expect(EVENT_GROUP_LABELS.CALVING).toBe("分娩・異常");
			expect(EVENT_GROUP_LABELS.GROWTH).toBe("成長遷移");
			expect(EVENT_GROUP_LABELS.MEASUREMENT).toBe("計測");
			expect(EVENT_GROUP_LABELS.HEALTH).toBe("健康・治療");
			expect(EVENT_GROUP_LABELS.LOGISTICS).toBe("ロジ");
			expect(EVENT_GROUP_LABELS.OTHER).toBe("その他");
		});
	});

	describe("EVENT_TYPE_GROUPS", () => {
		it("should group all event types correctly", () => {
			const allGroupedTypes = EVENT_GROUP_ORDER.flatMap(
				(group) => EVENT_TYPE_GROUPS[group]
			);
			expect(allGroupedTypes).toEqual(EVENT_TYPES);
		});

		it("should have correct breeding group", () => {
			expect(EVENT_TYPE_GROUPS.BREEDING).toEqual([
				"ESTRUS",
				"EXPECTED_ESTRUS",
				"INSEMINATION",
				"PREGNANCY_CHECK",
				"EXPECTED_CALVING"
			]);
		});

		it("should have correct calving group", () => {
			expect(EVENT_TYPE_GROUPS.CALVING).toEqual([
				"CALVING",
				"ABORTION",
				"STILLBIRTH",
				"DEATH"
			]);
		});

		it("should have correct health group", () => {
			expect(EVENT_TYPE_GROUPS.HEALTH).toEqual([
				"VACCINATION",
				"DIAGNOSIS",
				"MEDICATION",
				"TREATMENT_STARTED",
				"TREATMENT_COMPLETED",
				"HOOF_TRIMMING"
			]);
		});
	});

	describe("EVENT_TYPE_LABELS", () => {
		it("should contain labels for all event types", () => {
			for (const type of EVENT_TYPES) {
				expect(EVENT_TYPE_LABELS[type]).toBeDefined();
				expect(typeof EVENT_TYPE_LABELS[type]).toBe("string");
			}
		});

		it("should have correct Japanese labels for key events", () => {
			expect(EVENT_TYPE_LABELS.ARRIVAL).toBe("導入");
			expect(EVENT_TYPE_LABELS.ESTRUS).toBe("発情");
			expect(EVENT_TYPE_LABELS.INSEMINATION).toBe("人工授精");
			expect(EVENT_TYPE_LABELS.PREGNANCY_CHECK).toBe("妊娠鑑定");
			expect(EVENT_TYPE_LABELS.EXPECTED_CALVING).toBe("分娩予定日");
			expect(EVENT_TYPE_LABELS.CALVING).toBe("分娩");
			expect(EVENT_TYPE_LABELS.ABORTION).toBe("流産");
			expect(EVENT_TYPE_LABELS.STILLBIRTH).toBe("死産");
			expect(EVENT_TYPE_LABELS.DEATH).toBe("死亡");
			expect(EVENT_TYPE_LABELS.WEANING).toBe("断乳");
			expect(EVENT_TYPE_LABELS.START_FATTENING).toBe("肥育開始");
			expect(EVENT_TYPE_LABELS.WEIGHT_MEASURED).toBe("体重計測");
			expect(EVENT_TYPE_LABELS.VACCINATION).toBe("ワクチン接種");
			expect(EVENT_TYPE_LABELS.DIAGNOSIS).toBe("診断");
			expect(EVENT_TYPE_LABELS.MEDICATION).toBe("投薬");
			expect(EVENT_TYPE_LABELS.TREATMENT_STARTED).toBe("治療開始");
			expect(EVENT_TYPE_LABELS.TREATMENT_COMPLETED).toBe("治療完了");
			expect(EVENT_TYPE_LABELS.HOOF_TRIMMING).toBe("削蹄");
			expect(EVENT_TYPE_LABELS.SHIPMENT).toBe("出荷");
			expect(EVENT_TYPE_LABELS.OTHER).toBe("その他");
		});
	});

	describe("EVENT_PRIORITIES", () => {
		it("should contain all expected priorities", () => {
			expect(EVENT_PRIORITIES).toEqual({
				LOW: "LOW",
				MEDIUM: "MEDIUM",
				HIGH: "HIGH",
				CRITICAL: "CRITICAL"
			});
		});

		it("should have correct type", () => {
			const testPriority: EventPriority = "HIGH";
			expect(Object.values(EVENT_PRIORITIES)).toContain(testPriority);
		});
	});

	describe("EVENT_TYPE_PRIORITIES", () => {
		it("should assign priorities to all event types", () => {
			for (const type of EVENT_TYPES) {
				expect(EVENT_TYPE_PRIORITIES[type]).toBeDefined();
				expect(Object.values(EVENT_PRIORITIES)).toContain(
					EVENT_TYPE_PRIORITIES[type]
				);
			}
		});

		it("should assign correct critical priority to calving", () => {
			expect(EVENT_TYPE_PRIORITIES.CALVING).toBe("CRITICAL");
		});

		it("should assign correct critical priority to death", () => {
			expect(EVENT_TYPE_PRIORITIES.DEATH).toBe("CRITICAL");
		});

		it("should assign high priority to important breeding events", () => {
			expect(EVENT_TYPE_PRIORITIES.INSEMINATION).toBe("HIGH");
			expect(EVENT_TYPE_PRIORITIES.PREGNANCY_CHECK).toBe("HIGH");
			expect(EVENT_TYPE_PRIORITIES.ABORTION).toBe("HIGH");
			expect(EVENT_TYPE_PRIORITIES.STILLBIRTH).toBe("HIGH");
			expect(EVENT_TYPE_PRIORITIES.MEDICATION).toBe("HIGH");
			expect(EVENT_TYPE_PRIORITIES.TREATMENT_STARTED).toBe("HIGH");
			expect(EVENT_TYPE_PRIORITIES.SHIPMENT).toBe("HIGH");
		});

		it("should assign medium priority to standard events", () => {
			expect(EVENT_TYPE_PRIORITIES.ARRIVAL).toBe("MEDIUM");
			expect(EVENT_TYPE_PRIORITIES.ESTRUS).toBe("MEDIUM");
			expect(EVENT_TYPE_PRIORITIES.WEANING).toBe("MEDIUM");
			expect(EVENT_TYPE_PRIORITIES.START_FATTENING).toBe("MEDIUM");
			expect(EVENT_TYPE_PRIORITIES.VACCINATION).toBe("MEDIUM");
			expect(EVENT_TYPE_PRIORITIES.DIAGNOSIS).toBe("MEDIUM");
			expect(EVENT_TYPE_PRIORITIES.TREATMENT_COMPLETED).toBe("MEDIUM");
		});

		it("should assign low priority to routine events", () => {
			expect(EVENT_TYPE_PRIORITIES.WEIGHT_MEASURED).toBe("LOW");
			expect(EVENT_TYPE_PRIORITIES.HOOF_TRIMMING).toBe("LOW");
			expect(EVENT_TYPE_PRIORITIES.OTHER).toBe("LOW");
		});
	});

	describe("Type safety", () => {
		it("should ensure all event types have corresponding labels", () => {
			for (const type of EVENT_TYPES) {
				expect(EVENT_TYPE_LABELS).toHaveProperty(type);
			}
		});

		it("should ensure all event types have corresponding priorities", () => {
			for (const type of EVENT_TYPES) {
				expect(EVENT_TYPE_PRIORITIES).toHaveProperty(type);
			}
		});

		it("should ensure all event groups have corresponding labels", () => {
			for (const group of EVENT_GROUP_ORDER) {
				expect(EVENT_GROUP_LABELS).toHaveProperty(group);
			}
		});

		it("should ensure all event groups have corresponding type groups", () => {
			for (const group of EVENT_GROUP_ORDER) {
				expect(EVENT_TYPE_GROUPS).toHaveProperty(group);
			}
		});
	});

	describe("Business logic validation", () => {
		it("should ensure critical events are properly categorized", () => {
			// Calving should be in CALVING group with CRITICAL priority
			expect(EVENT_TYPE_GROUPS.CALVING).toContain("CALVING");
			expect(EVENT_TYPE_PRIORITIES.CALVING).toBe("CRITICAL");

			// Death should be in CALVING group with CRITICAL priority
			expect(EVENT_TYPE_GROUPS.CALVING).toContain("DEATH");
			expect(EVENT_TYPE_PRIORITIES.DEATH).toBe("CRITICAL");
		});

		it("should ensure breeding events are properly grouped", () => {
			// Breeding events should be in BREEDING group
			expect(EVENT_TYPE_GROUPS.BREEDING).toContain("ESTRUS");
			expect(EVENT_TYPE_GROUPS.BREEDING).toContain("EXPECTED_ESTRUS");
			expect(EVENT_TYPE_GROUPS.BREEDING).toContain("INSEMINATION");
			expect(EVENT_TYPE_GROUPS.BREEDING).toContain("PREGNANCY_CHECK");
			expect(EVENT_TYPE_GROUPS.BREEDING).toContain("EXPECTED_CALVING");
		});

		it("should ensure health events are properly grouped", () => {
			// Health events should be in HEALTH group
			expect(EVENT_TYPE_GROUPS.HEALTH).toContain("VACCINATION");
			expect(EVENT_TYPE_GROUPS.HEALTH).toContain("DIAGNOSIS");
			expect(EVENT_TYPE_GROUPS.HEALTH).toContain("MEDICATION");
		});
	});
});
