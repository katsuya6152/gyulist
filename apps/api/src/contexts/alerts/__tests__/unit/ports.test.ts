import { describe, expect, it } from "vitest";
import type {
	AlertRecord,
	AlertSearchParams,
	AlertsRepoPort,
	RawAlertRow
} from "../../ports";

describe("AlertsRepoPort", () => {
	// モック実装
	const mockRepo: AlertsRepoPort = {
		async findOpenDaysOver60NoAI(
			ownerUserId: number,
			nowIso: string
		): Promise<RawAlertRow[]> {
			return [
				{
					cattleId: 1,
					cattleName: "Test Cow 1",
					cattleEarTagNumber: "123",
					dueAt: "2025-09-20T00:00:00Z"
				}
			];
		},

		async findCalvingWithin60(
			ownerUserId: number,
			nowIso: string
		): Promise<RawAlertRow[]> {
			return [
				{
					cattleId: 2,
					cattleName: "Test Cow 2",
					cattleEarTagNumber: "456",
					dueAt: "2025-09-15T00:00:00Z"
				}
			];
		},

		async findCalvingOverdue(
			ownerUserId: number,
			nowIso: string
		): Promise<RawAlertRow[]> {
			return [
				{
					cattleId: 3,
					cattleName: "Test Cow 3",
					cattleEarTagNumber: "789",
					dueAt: "2025-08-15T00:00:00Z"
				}
			];
		},

		async findEstrusOver20NotPregnant(
			ownerUserId: number,
			nowIso: string
		): Promise<RawAlertRow[]> {
			return [
				{
					cattleId: 4,
					cattleName: "Test Cow 4",
					cattleEarTagNumber: "012",
					dueAt: "2025-09-10T00:00:00Z"
				}
			];
		},

		async search(
			ownerUserId: number,
			params: AlertSearchParams
		): Promise<{ items: AlertRecord[]; total: number }> {
			const mockAlert: AlertRecord = {
				id: "alert-1",
				type: "BREEDING",
				severity: "HIGH",
				status: "ACTIVE",
				cattleId: 1,
				cattleName: "Test Cow",
				cattleEarTagNumber: "123",
				dueAt: "2025-09-20T00:00:00Z",
				message: "Test alert message",
				ownerUserId: 1,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				acknowledgedAt: null,
				resolvedAt: null
			};

			return {
				items: [mockAlert],
				total: 1
			};
		},

		async findById(id: string): Promise<AlertRecord | null> {
			if (id === "alert-1") {
				return {
					id: "alert-1",
					type: "BREEDING",
					severity: "HIGH",
					status: "ACTIVE",
					cattleId: 1,
					cattleName: "Test Cow",
					cattleEarTagNumber: "123",
					dueAt: "2025-09-20T00:00:00Z",
					message: "Test alert message",
					ownerUserId: 1,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					acknowledgedAt: null,
					resolvedAt: null
				};
			}
			return null;
		},

		async create(alert: AlertRecord): Promise<void> {
			// モック実装
		},

		async update(
			id: string,
			updates: Partial<AlertRecord>
		): Promise<AlertRecord> {
			const baseAlert: AlertRecord = {
				id: "alert-1",
				type: "BREEDING",
				severity: "HIGH",
				status: "ACTIVE",
				cattleId: 1,
				cattleName: "Test Cow",
				cattleEarTagNumber: "123",
				dueAt: "2025-09-20T00:00:00Z",
				message: "Test alert message",
				ownerUserId: 1,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				acknowledgedAt: null,
				resolvedAt: null
			};

			return { ...baseAlert, ...updates };
		},

		async delete(id: string): Promise<void> {
			// モック実装
		},

		async updateStatus(
			id: string,
			status: string,
			reason?: string
		): Promise<AlertRecord> {
			const baseAlert: AlertRecord = {
				id: "alert-1",
				type: "BREEDING",
				severity: "HIGH",
				status: "ACTIVE",
				cattleId: 1,
				cattleName: "Test Cow",
				cattleEarTagNumber: "123",
				dueAt: "2025-09-20T00:00:00Z",
				message: "Test alert message",
				ownerUserId: 1,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				acknowledgedAt: null,
				resolvedAt: null
			};

			return { ...baseAlert, status };
		},

		async updateSeverity(
			id: string,
			severity: string,
			reason?: string
		): Promise<AlertRecord> {
			const baseAlert: AlertRecord = {
				id: "alert-1",
				type: "BREEDING",
				severity: "HIGH",
				status: "ACTIVE",
				cattleId: 1,
				cattleName: "Test Cow",
				cattleEarTagNumber: "123",
				dueAt: "2025-09-20T00:00:00Z",
				message: "Test alert message",
				ownerUserId: 1,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				acknowledgedAt: null,
				resolvedAt: null
			};

			return { ...baseAlert, severity };
		}
	};

	it("should find open days over 60 no AI", async () => {
		const result = await mockRepo.findOpenDaysOver60NoAI(
			1,
			"2025-08-20T00:00:00Z"
		);
		expect(result).toHaveLength(1);
		expect(result[0].cattleId).toBe(1);
		expect(result[0].cattleName).toBe("Test Cow 1");
	});

	it("should find calving within 60 days", async () => {
		const result = await mockRepo.findCalvingWithin60(
			1,
			"2025-08-20T00:00:00Z"
		);
		expect(result).toHaveLength(1);
		expect(result[0].cattleId).toBe(2);
		expect(result[0].cattleName).toBe("Test Cow 2");
	});

	it("should find calving overdue", async () => {
		const result = await mockRepo.findCalvingOverdue(1, "2025-08-20T00:00:00Z");
		expect(result).toHaveLength(1);
		expect(result[0].cattleId).toBe(3);
		expect(result[0].cattleName).toBe("Test Cow 3");
	});

	it("should find estrus over 20 not pregnant", async () => {
		const result = await mockRepo.findEstrusOver20NotPregnant(
			1,
			"2025-08-20T00:00:00Z"
		);
		expect(result).toHaveLength(1);
		expect(result[0].cattleId).toBe(4);
		expect(result[0].cattleName).toBe("Test Cow 4");
	});

	it("should search alerts", async () => {
		const result = await mockRepo.search(1, { limit: 10, offset: 0 });
		expect(result.items).toHaveLength(1);
		expect(result.total).toBe(1);
		expect(result.items[0].type).toBe("BREEDING");
	});

	it("should find alert by id", async () => {
		const alert = await mockRepo.findById("alert-1");
		expect(alert).toBeDefined();
		expect(alert?.id).toBe("alert-1");
		expect(alert?.type).toBe("BREEDING");
	});

	it("should return null for non-existent alert", async () => {
		const alert = await mockRepo.findById("non-existent");
		expect(alert).toBeNull();
	});

	it("should update alert", async () => {
		const updated = await mockRepo.update("alert-1", { status: "RESOLVED" });
		expect(updated.status).toBe("RESOLVED");
	});

	it("should update alert status", async () => {
		const updated = await mockRepo.updateStatus(
			"alert-1",
			"ACKNOWLEDGED",
			"User acknowledged"
		);
		expect(updated.status).toBe("ACKNOWLEDGED");
	});

	it("should update alert severity", async () => {
		const updated = await mockRepo.updateSeverity(
			"alert-1",
			"MEDIUM",
			"Risk reduced"
		);
		expect(updated.severity).toBe("MEDIUM");
	});
});
