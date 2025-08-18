import { describe, expect, it } from "vitest";
import { getAlerts } from "../../domain/services/get";
import type { AlertRecord, AlertsRepoPort } from "../../ports";

describe("Alerts domain - get", () => {
	it("aggregates and sorts alerts", async () => {
		const repo = {
			findOpenDaysOver60NoAI: async () => [
				{
					cattleId: 1,
					dueAt: null,
					cattleName: "Test",
					cattleEarTagNumber: "1001"
				}
			],
			findCalvingWithin60: async () => [
				{
					cattleId: 2,
					dueAt: new Date().toISOString(),
					cattleName: "Test",
					cattleEarTagNumber: "1002"
				}
			],
			findCalvingOverdue: async () => [
				{
					cattleId: 3,
					dueAt: new Date().toISOString(),
					cattleName: "Test",
					cattleEarTagNumber: "1003"
				}
			],
			findEstrusOver20NotPregnant: async () => [
				{
					cattleId: 4,
					dueAt: null,
					cattleName: "Test",
					cattleEarTagNumber: "1004"
				}
			],
			search: async () => ({ items: [], total: 0 }),
			findById: async () => null,
			create: async () => {},
			update: async (): Promise<AlertRecord> => ({
				id: "x",
				type: "CALVING_WITHIN_60",
				severity: "low",
				status: "active",
				cattleId: 0,
				cattleName: null,
				cattleEarTagNumber: null,
				dueAt: null,
				message: "",
				ownerUserId: 0,
				createdAt: 0,
				updatedAt: 0,
				acknowledgedAt: null,
				resolvedAt: null
			}),
			delete: async () => {},
			updateStatus: async (): Promise<AlertRecord> => ({
				id: "x",
				type: "CALVING_WITHIN_60",
				severity: "low",
				status: "active",
				cattleId: 0,
				cattleName: null,
				cattleEarTagNumber: null,
				dueAt: null,
				message: "",
				ownerUserId: 0,
				createdAt: 0,
				updatedAt: 0,
				acknowledgedAt: null,
				resolvedAt: null
			}),
			updateSeverity: async (): Promise<AlertRecord> => ({
				id: "x",
				type: "CALVING_WITHIN_60",
				severity: "low",
				status: "active",
				cattleId: 0,
				cattleName: null,
				cattleEarTagNumber: null,
				dueAt: null,
				message: "",
				ownerUserId: 0,
				createdAt: 0,
				updatedAt: 0,
				acknowledgedAt: null,
				resolvedAt: null
			})
		};

		const deps = {
			repo: repo as unknown as AlertsRepoPort,
			id: { uuid: () => "test-id" },
			time: { nowSeconds: () => Math.floor(Date.now() / 1000) }
		};

		const res = await getAlerts(deps)({
			ownerUserId: 1,
			now: () => new Date()
		});

		expect(res.ok).toBe(true);
		if (res.ok) {
			expect(res.value.results.length).toBe(4);
			expect(res.value.total).toBe(4);
			expect(res.value.summary).toBeDefined();
		}
	});
});
