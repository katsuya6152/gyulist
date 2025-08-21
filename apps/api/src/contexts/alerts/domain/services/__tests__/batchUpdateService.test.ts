import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserId } from "../../model/types";
import { getAllUserIds, updateAlertsBatch } from "../batchUpdateService";
import type {
	AlertBatchUpdateDeps,
	UpdateAlertsBatchCmd
} from "../batchUpdateService";

// モックデータ
const mockUserId1 = 1 as UserId;
const mockUserId2 = 2 as UserId;

const mockAlertsRepo = {
	findActiveAlertsByUserId: vi.fn(),
	findAlertById: vi.fn(),
	updateAlertStatus: vi.fn(),
	createAlert: vi.fn(),
	addAlertHistory: vi.fn(),
	generateAlertsForUser: vi.fn(),
	checkIfAIPerformed: vi.fn(),
	checkIfCalvingCompleted: vi.fn(),
	checkIfPregnancyConfirmedOrEstrusDetected: vi.fn(),
	findOpenDaysOver60NoAI: vi.fn(),
	findCalvingWithin60: vi.fn(),
	findCalvingOverdue: vi.fn(),
	findEstrusOver20NotPregnant: vi.fn(),
	getAllUserIds: vi.fn(),
	findDistinctUserIds: vi.fn(),
	findDistinctUserIdsFallback: vi.fn(),
	listByCattleId: vi.fn(),
	search: vi.fn(),
	findById: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	updateStatus: vi.fn(),
	updateSeverity: vi.fn(),
	updateAlertMemo: vi.fn()
};

const mockTime = {
	nowSeconds: () => Math.floor(Date.now() / 1000)
};

const mockDeps: AlertBatchUpdateDeps = {
	repo: mockAlertsRepo,
	time: mockTime,
	idGenerator: { generate: () => "test-id" }
};

describe("updateAlertsBatch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should successfully update alerts for multiple users", async () => {
		// モックの設定
		vi.mocked(mockAlertsRepo.findActiveAlertsByUserId).mockResolvedValue([]);
		vi.mocked(mockAlertsRepo.generateAlertsForUser).mockResolvedValue({
			ok: true,
			value: []
		});

		const cmd: UpdateAlertsBatchCmd = {
			userIds: [mockUserId1, mockUserId2],
			now: () => new Date()
		};

		const result = await updateAlertsBatch(mockDeps)(cmd);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.totalUsers).toBe(2);
			expect(result.value.totalUpdated).toBe(0);
			expect(result.value.totalCreated).toBe(0);
			expect(result.value.totalResolved).toBe(0);
			expect(result.value.errors).toBe(0);
			expect(result.value.errorDetails).toHaveLength(0);
		}
	});

	it("should handle errors from individual user updates", async () => {
		// モックの設定 - 1つ目のユーザーは成功、2つ目は失敗
		vi.mocked(mockAlertsRepo.findActiveAlertsByUserId)
			.mockResolvedValueOnce([]) // 1つ目のユーザー
			.mockResolvedValueOnce([]); // 2つ目のユーザー

		vi.mocked(mockAlertsRepo.generateAlertsForUser)
			.mockResolvedValueOnce({
				ok: true,
				value: []
			})
			.mockResolvedValueOnce({
				ok: false,
				error: { type: "InfraError", cause: new Error("Database error") }
			});

		const cmd: UpdateAlertsBatchCmd = {
			userIds: [mockUserId1, mockUserId2],
			now: () => new Date()
		};

		const result = await updateAlertsBatch(mockDeps)(cmd);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.totalUsers).toBe(2);
			expect(result.value.totalUpdated).toBe(0);
			expect(result.value.totalCreated).toBe(0);
			expect(result.value.totalResolved).toBe(0);
			expect(result.value.errors).toBe(1);
			expect(result.value.errorDetails).toHaveLength(1);
		}
	});

	it("should handle unexpected errors during user updates", async () => {
		// モックの設定 - 予期しないエラーを発生させる
		vi.mocked(mockAlertsRepo.findActiveAlertsByUserId).mockRejectedValue(
			new Error("Unexpected error")
		);

		const cmd: UpdateAlertsBatchCmd = {
			userIds: [mockUserId1],
			now: () => new Date()
		};

		const result = await updateAlertsBatch(mockDeps)(cmd);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.totalUsers).toBe(1);
			expect(result.value.errors).toBe(1);
			expect(result.value.errorDetails).toHaveLength(1);
		}
	});

	it("should return error when batch processing fails completely", async () => {
		// モックの設定 - 完全に失敗させる
		vi.mocked(mockAlertsRepo.findActiveAlertsByUserId).mockRejectedValue(
			new Error("Critical error")
		);

		const cmd: UpdateAlertsBatchCmd = {
			userIds: [mockUserId1],
			now: () => new Date()
		};

		const result = await updateAlertsBatch(mockDeps)(cmd);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.totalUsers).toBe(1);
			expect(result.value.errors).toBe(1);
			expect(result.value.errorDetails).toHaveLength(1);
		}
	});
});

describe("getAllUserIds", () => {
	it("should return mock user IDs", async () => {
		vi.mocked(mockAlertsRepo.findDistinctUserIds).mockResolvedValue([
			1 as UserId
		]);
		const result = await getAllUserIds(mockAlertsRepo);
		expect(result).toEqual([1 as UserId]);
	});
});
