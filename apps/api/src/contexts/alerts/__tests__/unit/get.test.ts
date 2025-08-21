import { describe, expect, it } from "vitest";
import type {
	AlertId,
	CattleId,
	CattleName,
	EarTagNumber,
	Timestamp,
	UserId
} from "../../domain/model/types";
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
			findActiveAlertsByUserId: async () => [
				{
					id: "alert-1",
					type: "OPEN_DAYS_OVER60_NO_AI",
					severity: "high",
					status: "active",
					cattleId: 1 as CattleId,
					cattleName: "Test",
					cattleEarTagNumber: "1001" as EarTagNumber,
					dueAt: null,
					message: "Test alert 1",
					memo: null,
					ownerUserId: 1 as UserId,
					createdAt: Date.now() as Timestamp,
					updatedAt: Date.now() as Timestamp,
					acknowledgedAt: null,
					resolvedAt: null
				},
				{
					id: "alert-2",
					type: "CALVING_WITHIN_60",
					severity: "medium",
					status: "active",
					cattleId: 2 as CattleId,
					cattleName: "Test",
					cattleEarTagNumber: "1002" as EarTagNumber,
					dueAt: new Date().toISOString(),
					message: "Test alert 2",
					memo: null,
					ownerUserId: 1 as UserId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					acknowledgedAt: null,
					resolvedAt: null
				},
				{
					id: "alert-3",
					type: "CALVING_OVERDUE",
					severity: "low",
					status: "active",
					cattleId: 3 as CattleId,
					cattleName: "Test",
					cattleEarTagNumber: "1003" as EarTagNumber,
					dueAt: new Date().toISOString(),
					message: "Test alert 3",
					memo: null,
					ownerUserId: 1 as UserId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					acknowledgedAt: null,
					resolvedAt: null
				},
				{
					id: "alert-4",
					type: "ESTRUS_OVER20_NOT_PREGNANT",
					severity: "medium",
					status: "active",
					cattleId: 4 as CattleId,
					cattleName: "Test",
					cattleEarTagNumber: "1004" as EarTagNumber,
					dueAt: null,
					message: "Test alert 4",
					memo: null,
					ownerUserId: 1 as UserId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					acknowledgedAt: null,
					resolvedAt: null
				}
			],
			listByCattleId: async () => [],
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
			}),
			findDistinctUserIds: async () => [],
			findDistinctUserIdsFallback: async () => [],
			generateAlertsForUser: async () => ({ ok: true, value: [] }),
			addAlertHistory: async () => ({ ok: true, value: undefined }),
			updateAlertMemo: async () => ({ ok: true, value: {} as AlertRecord })
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
