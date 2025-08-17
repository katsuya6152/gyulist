import { describe, expect, it } from "vitest";
import type { UserId } from "../../../../shared/brand";
import { createCattle } from "../../domain/model/cattle";
import type { IdentificationNumber } from "../../domain/model/cattle";

describe("Cattle model", () => {
	it("rejects future birthday", () => {
		const r = createCattle({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 123 as unknown as IdentificationNumber,
			earTagNumber: null,
			name: "test",
			gender: "メス",
			birthday: new Date(Date.now() + 86400000),
			growthStage: "CALF",
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null
		});
		expect(r.ok).toBe(false);
	});

	it("creates with derived ages when birthday is in the past", () => {
		const r = createCattle({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 123 as unknown as IdentificationNumber,
			earTagNumber: null,
			name: "test",
			gender: "メス",
			birthday: new Date(Date.now() - 10 * 24 * 3600 * 1000),
			growthStage: "CALF",
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.daysOld).toBeGreaterThanOrEqual(9);
		}
	});
});
