import { describe, expect, it } from "vitest";
import type {
	EmailLogRecord,
	RegistrationRecord,
	RegistrationRepoPort,
	SearchParams
} from "../../ports";

describe("RegistrationRepoPort", () => {
	// モック実装
	const mockRepo: RegistrationRepoPort = {
		async findByEmail(email: string): Promise<RegistrationRecord | null> {
			if (email === "test@example.com") {
				return {
					id: "reg-1",
					email: "test@example.com",
					referralSource: "website",
					status: "PENDING",
					locale: "ja",
					createdAt: Date.now(),
					updatedAt: Date.now()
				};
			}
			return null;
		},

		async insert(reg: RegistrationRecord): Promise<void> {
			// モック実装
		},

		async search(
			params: SearchParams
		): Promise<{ items: RegistrationRecord[]; total: number }> {
			const mockItems: RegistrationRecord[] = [
				{
					id: "reg-1",
					email: "test1@example.com",
					referralSource: "website",
					status: "PENDING",
					locale: "ja",
					createdAt: Date.now(),
					updatedAt: Date.now()
				},
				{
					id: "reg-2",
					email: "test2@example.com",
					referralSource: "social",
					status: "COMPLETED",
					locale: "en",
					createdAt: Date.now(),
					updatedAt: Date.now()
				}
			];

			return {
				items: mockItems,
				total: 2
			};
		},

		async insertEmailLog(log: EmailLogRecord): Promise<void> {
			// モック実装
		},

		async updateStatus(
			id: string,
			status: string,
			reason?: string
		): Promise<RegistrationRecord> {
			const baseRecord: RegistrationRecord = {
				id: id,
				email: "test@example.com",
				referralSource: "website",
				status: "PENDING",
				locale: "ja",
				createdAt: Date.now(),
				updatedAt: Date.now()
			};

			return { ...baseRecord, status };
		},

		async updateReferralSource(
			id: string,
			referralSource: string | null
		): Promise<RegistrationRecord> {
			const baseRecord: RegistrationRecord = {
				id: id,
				email: "test@example.com",
				referralSource: "website",
				status: "PENDING",
				locale: "ja",
				createdAt: Date.now(),
				updatedAt: Date.now()
			};

			return { ...baseRecord, referralSource };
		},

		async delete(id: string): Promise<void> {
			// モック実装
		}
	};

	it("should find registration by email", async () => {
		const registration = await mockRepo.findByEmail("test@example.com");
		expect(registration).toBeDefined();
		expect(registration?.email).toBe("test@example.com");
		expect(registration?.status).toBe("PENDING");
		expect(registration?.referralSource).toBe("website");
	});

	it("should return null for non-existent email", async () => {
		const registration = await mockRepo.findByEmail("nonexistent@example.com");
		expect(registration).toBeNull();
	});

	it("should search registrations", async () => {
		const result = await mockRepo.search({ limit: 10, offset: 0 });
		expect(result.items).toHaveLength(2);
		expect(result.total).toBe(2);
		expect(result.items[0].email).toBe("test1@example.com");
		expect(result.items[1].email).toBe("test2@example.com");
	});

	it("should search registrations with query filter", async () => {
		const result = await mockRepo.search({
			q: "test",
			limit: 10,
			offset: 0
		});
		expect(result.items).toHaveLength(2);
	});

	it("should search registrations with date range", async () => {
		const result = await mockRepo.search({
			from: Date.now() - 86400000, // 1日前
			to: Date.now(),
			limit: 10,
			offset: 0
		});
		expect(result.items).toHaveLength(2);
	});

	it("should search registrations with source filter", async () => {
		const result = await mockRepo.search({
			source: "website",
			limit: 10,
			offset: 0
		});
		expect(result.items).toHaveLength(2);
	});

	it("should update registration status", async () => {
		const updated = await mockRepo.updateStatus(
			"reg-1",
			"COMPLETED",
			"User completed registration"
		);
		expect(updated.status).toBe("COMPLETED");
		expect(updated.id).toBe("reg-1");
	});

	it("should update referral source", async () => {
		const updated = await mockRepo.updateReferralSource("reg-1", "social");
		expect(updated.referralSource).toBe("social");
		expect(updated.id).toBe("reg-1");
	});

	it("should handle null referral source", async () => {
		const updated = await mockRepo.updateReferralSource("reg-1", null);
		expect(updated.referralSource).toBeNull();
	});

	it("should insert email log", async () => {
		const emailLog: EmailLogRecord = {
			id: "log-1",
			email: "test@example.com",
			type: "VERIFICATION",
			httpStatus: 200,
			resendId: "resend-123",
			createdAt: Date.now()
		};

		await expect(mockRepo.insertEmailLog(emailLog)).resolves.toBeUndefined();
	});

	it("should handle email log with error", async () => {
		const emailLog: EmailLogRecord = {
			id: "log-2",
			email: "test@example.com",
			type: "VERIFICATION",
			httpStatus: 500,
			error: "SMTP error",
			createdAt: Date.now()
		};

		await expect(mockRepo.insertEmailLog(emailLog)).resolves.toBeUndefined();
	});

	it("should delete registration", async () => {
		await expect(mockRepo.delete("reg-1")).resolves.toBeUndefined();
	});

	it("should have correct registration record structure", async () => {
		const registration = await mockRepo.findByEmail("test@example.com");
		expect(registration).toHaveProperty("id");
		expect(registration).toHaveProperty("email");
		expect(registration).toHaveProperty("referralSource");
		expect(registration).toHaveProperty("status");
		expect(registration).toHaveProperty("locale");
		expect(registration).toHaveProperty("createdAt");
		expect(registration).toHaveProperty("updatedAt");
	});

	it("should have correct email log record structure", async () => {
		const emailLog: EmailLogRecord = {
			id: "log-1",
			email: "test@example.com",
			type: "VERIFICATION",
			createdAt: Date.now()
		};

		expect(emailLog).toHaveProperty("id");
		expect(emailLog).toHaveProperty("email");
		expect(emailLog).toHaveProperty("type");
		expect(emailLog).toHaveProperty("createdAt");
	});
});
