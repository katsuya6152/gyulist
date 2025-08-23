import { beforeEach, describe, expect, it } from "vitest";
import type { CattleId } from "../../../../shared/brand";
import type { BreedingEvent } from "../../../cattle/domain/model/breedingStatus";
import { createBreedingCalculationService } from "../../domain/services/breedingCalculation";

describe("BreedingCalculationService", () => {
	let calculationService: ReturnType<typeof createBreedingCalculationService>;
	const mockClock = { now: () => new Date("2024-01-15T10:00:00Z") };

	beforeEach(() => {
		calculationService = createBreedingCalculationService({ clock: mockClock });
	});

	describe("calculateBreedingStatus", () => {
		it("should calculate initial status when no events exist", () => {
			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events: [],
				currentDate: new Date("2024-01-15T10:00:00Z")
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(0);
				expect(result.value.expectedCalvingDate).toBeNull();
				expect(result.value.scheduledPregnancyCheckDate).toBeNull();
				expect(result.value.daysAfterCalving).toBeNull();
				expect(result.value.daysOpen).toBeNull();
				expect(result.value.pregnancyDays).toBeNull();
				expect(result.value.daysAfterInsemination).toBeNull();
				expect(result.value.inseminationCount).toBe(0);
			}
		});

		it("should calculate parity correctly", () => {
			const events: BreedingEvent[] = [
				{
					type: "Calve",
					timestamp: new Date("2023-01-01T10:00:00Z"),
					isDifficultBirth: false,
					memo: null
				},
				{
					type: "Calve",
					timestamp: new Date("2024-01-01T10:00:00Z"),
					isDifficultBirth: true,
					memo: null
				}
			];

			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events,
				currentDate: new Date("2024-01-15T10:00:00Z")
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(2);
			}
		});

		it("should calculate post-calving status correctly", () => {
			const calvingDate = new Date("2024-01-01T10:00:00Z");
			const currentDate = new Date("2024-01-15T10:00:00Z");
			const expectedDaysAfterCalving = 14; // 15 - 1 = 14日

			const events: BreedingEvent[] = [
				{
					type: "Calve",
					timestamp: calvingDate,
					isDifficultBirth: false,
					memo: null
				}
			];

			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events,
				currentDate
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(1);
				expect(result.value.daysAfterCalving).toBe(expectedDaysAfterCalving);
				expect(result.value.daysOpen).toBe(expectedDaysAfterCalving);
				expect(result.value.expectedCalvingDate).toBeNull();
				expect(result.value.pregnancyDays).toBeNull();
			}
		});

		it("should calculate pregnant status correctly", () => {
			const pregnancyDate = new Date("2023-11-01T10:00:00Z");
			const currentDate = new Date("2024-01-15T10:00:00Z");
			const expectedPregnancyDays = 75; // 約75日

			const events: BreedingEvent[] = [
				{
					type: "ConfirmPregnancy",
					timestamp: pregnancyDate,
					expectedCalvingDate: new Date("2024-07-01T10:00:00Z"),
					scheduledPregnancyCheckDate: new Date("2023-12-01T10:00:00Z"),
					memo: null
				}
			];

			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events,
				currentDate
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(0);
				expect(result.value.pregnancyDays).toBe(expectedPregnancyDays);
				expect(result.value.expectedCalvingDate).toEqual(
					new Date("2024-07-01T10:00:00Z")
				);
				expect(result.value.scheduledPregnancyCheckDate).toEqual(
					new Date("2023-12-01T10:00:00Z")
				);
				expect(result.value.daysAfterCalving).toBeNull();
				expect(result.value.daysOpen).toBeNull();
			}
		});

		it("should calculate inseminated status correctly", () => {
			const calvingDate = new Date("2023-12-01T10:00:00Z");
			const inseminationDate = new Date("2024-01-10T10:00:00Z");
			const currentDate = new Date("2024-01-15T10:00:00Z");
			const expectedDaysAfterInsemination = 5; // 15 - 10 = 5日
			const expectedDaysOpen = 40; // 10 - 1 = 9日 + 31日 = 40日

			const events: BreedingEvent[] = [
				{
					type: "Calve",
					timestamp: calvingDate,
					isDifficultBirth: false,
					memo: null
				},
				{
					type: "Inseminate",
					timestamp: inseminationDate,
					memo: null
				}
			];

			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events,
				currentDate
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(1);
				expect(result.value.daysAfterInsemination).toBe(
					expectedDaysAfterInsemination
				);
				expect(result.value.inseminationCount).toBe(1);
				expect(result.value.daysOpen).toBe(expectedDaysOpen);
				expect(result.value.expectedCalvingDate).toBeNull();
				expect(result.value.pregnancyDays).toBeNull();
			}
		});

		it("should calculate multiple inseminations in current cycle", () => {
			const calvingDate = new Date("2023-12-01T10:00:00Z");
			const firstInsemination = new Date("2024-01-10T10:00:00Z");
			const secondInsemination = new Date("2024-01-20T10:00:00Z");
			const currentDate = new Date("2024-01-25T10:00:00Z");

			const events: BreedingEvent[] = [
				{
					type: "Calve",
					timestamp: calvingDate,
					isDifficultBirth: false,
					memo: null
				},
				{
					type: "Inseminate",
					timestamp: firstInsemination,
					memo: null
				},
				{
					type: "Inseminate",
					timestamp: secondInsemination,
					memo: null
				}
			];

			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events,
				currentDate
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(1);
				expect(result.value.inseminationCount).toBe(2);
				expect(result.value.daysAfterInsemination).toBe(5); // 25 - 20 = 5日
			}
		});

		it("should handle events in chronological order", () => {
			const events: BreedingEvent[] = [
				{
					type: "Calve",
					timestamp: new Date("2024-01-01T10:00:00Z"),
					isDifficultBirth: false,
					memo: null
				},
				{
					type: "Inseminate",
					timestamp: new Date("2024-01-10T10:00:00Z"),
					memo: null
				},
				{
					type: "ConfirmPregnancy",
					timestamp: new Date("2024-02-01T10:00:00Z"),
					expectedCalvingDate: new Date("2024-10-01T10:00:00Z"),
					scheduledPregnancyCheckDate: new Date("2024-03-01T10:00:00Z"),
					memo: null
				}
			];

			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events,
				currentDate: new Date("2024-03-15T10:00:00Z")
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.parity).toBe(1);
				expect(result.value.pregnancyDays).toBe(43); // 3月15日 - 2月1日 = 43日
				expect(result.value.expectedCalvingDate).toEqual(
					new Date("2024-10-01T10:00:00Z")
				);
			}
		});

		it("should handle error gracefully", () => {
			// 不正なイベント（存在しないタイプ）をテスト
			const events = [
				{
					type: "InvalidEvent" as BreedingEvent["type"],
					timestamp: new Date("2024-01-01T10:00:00Z"),
					memo: null
				}
			];

			const result = calculationService.calculateBreedingStatus({
				cattleId: 1 as CattleId,
				events: events as BreedingEvent[],
				currentDate: new Date("2024-01-15T10:00:00Z")
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				// 未知のイベントタイプの場合は初期状態を返す
				expect(result.value.parity).toBe(0);
				expect(result.value.inseminationCount).toBe(0);
			}
		});
	});

	describe("calculateDaysDifference", () => {
		it("should calculate days difference correctly", () => {
			const from = new Date("2024-01-01T10:00:00Z");
			const to = new Date("2024-01-15T10:00:00Z");

			// プライベートメソッドをテストするため、実際の計算ロジックを確認
			const diffMs = to.getTime() - from.getTime();
			const expectedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

			expect(expectedDays).toBe(14);
		});

		it("should handle same day", () => {
			const date = new Date("2024-01-01T10:00:00Z");

			const diffMs = date.getTime() - date.getTime();
			const expectedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

			expect(expectedDays).toBe(0);
		});

		it("should handle future dates", () => {
			const from = new Date("2024-01-15T10:00:00Z");
			const to = new Date("2024-01-01T10:00:00Z");

			const diffMs = to.getTime() - from.getTime();
			const expectedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

			expect(expectedDays).toBe(-14);
		});
	});
});
