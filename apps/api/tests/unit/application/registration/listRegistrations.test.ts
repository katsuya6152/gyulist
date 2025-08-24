import { beforeEach, describe, expect, it, vi } from "vitest";
import { listRegistrationsUseCase } from "../../../../src/application/use-cases/registration/listRegistrations";
import type {
	RegistrationRepository,
	SearchRegistrationsParams,
	SearchRegistrationsResult
} from "../../../../src/domain/ports/registration";
import type {
	Email,
	LocaleValue,
	ReferralSource,
	RegistrationId,
	RegistrationStatus,
	Timestamp
} from "../../../../src/domain/types/registration";
import { err, ok } from "../../../../src/shared/result";

describe("listRegistrationsUseCase", () => {
	let mockRegistrationRepo: {
		findByEmail: ReturnType<typeof vi.fn>;
		findById: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		search: ReturnType<typeof vi.fn>;
		updateStatus: ReturnType<typeof vi.fn>;
		updateReferralSource: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		createEmailLog: ReturnType<typeof vi.fn>;
		searchEmailLogs: ReturnType<typeof vi.fn>;
		findEmailLogsByEmail: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockRegistrationRepo = {
			findByEmail: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
			search: vi.fn(),
			updateStatus: vi.fn(),
			updateReferralSource: vi.fn(),
			delete: vi.fn(),
			createEmailLog: vi.fn(),
			searchEmailLogs: vi.fn(),
			findEmailLogsByEmail: vi.fn()
		};
	});

	it("should list registrations successfully", async () => {
		const input = {
			query: "test@example.com",
			fromDate: new Date("2024-01-01"),
			toDate: new Date("2024-01-31"),
			referralSource: "website",
			limit: 10,
			offset: 0
		};

		const mockSearchResult: SearchRegistrationsResult = {
			items: [
				{
					id: "reg-123" as unknown as RegistrationId,
					email: "test@example.com" as unknown as Email,
					status: "pending" as RegistrationStatus,
					referralSource: "website" as unknown as ReferralSource,
					locale: "ja" as unknown as LocaleValue,
					createdAt: 1704067200 as unknown as Timestamp,
					updatedAt: 1704067200 as unknown as Timestamp
				}
			],
			total: 1
		};

		mockRegistrationRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = listRegistrationsUseCase({
			registrationRepo: mockRegistrationRepo
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.items).toHaveLength(1);
			expect(result.value.total).toBe(1);
		}
		expect(mockRegistrationRepo.search).toHaveBeenCalledWith({
			query: "test@example.com",
			fromDate: new Date("2024-01-01"),
			toDate: new Date("2024-01-31"),
			referralSource: "website",
			limit: 10,
			offset: 0
		});
	});

	it("should list registrations with minimal parameters", async () => {
		const input = {
			limit: 20,
			offset: 0
		};

		const mockSearchResult: SearchRegistrationsResult = {
			items: [],
			total: 0
		};

		mockRegistrationRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = listRegistrationsUseCase({
			registrationRepo: mockRegistrationRepo
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.items).toHaveLength(0);
			expect(result.value.total).toBe(0);
		}
		expect(mockRegistrationRepo.search).toHaveBeenCalledWith({
			query: undefined,
			fromDate: undefined,
			toDate: undefined,
			referralSource: undefined,
			limit: 20,
			offset: 0
		});
	});

	it("should handle repository search error", async () => {
		const input = {
			limit: 10,
			offset: 0
		};

		mockRegistrationRepo.search.mockResolvedValue(
			err({
				type: "InfraError",
				message: "Database error"
			})
		);

		const useCase = listRegistrationsUseCase({
			registrationRepo: mockRegistrationRepo
		});

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("InfraError");
			expect(result.error.message).toBe("Database error");
		}
		expect(mockRegistrationRepo.search).toHaveBeenCalledWith({
			query: undefined,
			fromDate: undefined,
			toDate: undefined,
			referralSource: undefined,
			limit: 10,
			offset: 0
		});
	});

	it("should handle pagination correctly", async () => {
		const input = {
			limit: 5,
			offset: 10
		};

		const mockSearchResult: SearchRegistrationsResult = {
			items: [],
			total: 25
		};

		mockRegistrationRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = listRegistrationsUseCase({
			registrationRepo: mockRegistrationRepo
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.total).toBe(25);
		}
		expect(mockRegistrationRepo.search).toHaveBeenCalledWith({
			query: undefined,
			fromDate: undefined,
			toDate: undefined,
			referralSource: undefined,
			limit: 5,
			offset: 10
		});
	});

	it("should handle date range filtering", async () => {
		const input = {
			fromDate: new Date("2024-01-01"),
			toDate: new Date("2024-01-31"),
			limit: 10,
			offset: 0
		};

		const mockSearchResult: SearchRegistrationsResult = {
			items: [],
			total: 0
		};

		mockRegistrationRepo.search.mockResolvedValue(ok(mockSearchResult));

		const useCase = listRegistrationsUseCase({
			registrationRepo: mockRegistrationRepo
		});

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		expect(mockRegistrationRepo.search).toHaveBeenCalledWith({
			query: undefined,
			fromDate: new Date("2024-01-01"),
			toDate: new Date("2024-01-31"),
			referralSource: undefined,
			limit: 10,
			offset: 0
		});
	});
});
