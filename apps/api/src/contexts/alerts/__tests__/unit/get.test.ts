import { describe, expect, it } from "vitest";
import { getAlerts } from "../../domain/services/get";
import type { AlertsRepoPort } from "../../ports";

describe("Alerts domain - get", () => {
	it("aggregates and sorts alerts", async () => {
		const repo = {
			findOpenDaysOver60NoAI: async () => [
				{
					cattleId: 1,
					dueAt: null,
					cattleName: "Test",
					cattleEarTagNumber: 1001
				}
			],
			findCalvingWithin60: async () => [
				{
					cattleId: 2,
					dueAt: new Date().toISOString(),
					cattleName: "Test",
					cattleEarTagNumber: 1002
				}
			],
			findCalvingOverdue: async () => [
				{
					cattleId: 3,
					dueAt: new Date().toISOString(),
					cattleName: "Test",
					cattleEarTagNumber: 1003
				}
			],
			findEstrusOver20NotPregnant: async () => [
				{
					cattleId: 4,
					dueAt: null,
					cattleName: "Test",
					cattleEarTagNumber: 1004
				}
			]
		};
		const res = await getAlerts(repo as unknown as AlertsRepoPort)(
			1,
			() => new Date()
		);
		expect(res.ok).toBe(true);
		if (res.ok) expect(res.value.results.length).toBe(4);
	});
});
