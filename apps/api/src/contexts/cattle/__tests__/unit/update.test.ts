import type { CattleId, UserId } from "@/shared/brand";
import { describe, expect, it } from "vitest";
import type { BreedingStatus } from "../../domain/model/breedingStatus";
import type { BreedingEvent } from "../../domain/model/breedingStatus";
import type { BreedingSummary } from "../../domain/model/breedingSummary";
import type { Cattle, NewCattleProps } from "../../domain/model/cattle";
import { update } from "../../domain/services/update";
import type { CattleRepoPort } from "../../ports";

function setupRepo(initial?: Cattle): CattleRepoPort {
	const map = new Map<number, Cattle>();
	if (initial) map.set(initial.cattleId as unknown as number, initial);
	return {
		async findById(id) {
			return map.get(id as unknown as number) ?? null;
		},
		async search() {
			return Array.from(map.values());
		},
		async create(dto: NewCattleProps): Promise<Cattle> {
			const cattle: Cattle = {
				...dto,
				cattleId: Date.now() as unknown as CattleId,
				age: null,
				birthday: null,
				growthStage: null,
				gender: null,
				monthsOld: null,
				daysOld: null,
				breed: null,
				status: null,
				producerName: null,
				barn: null,
				breedingValue: null,
				notes: null,
				weight: null,
				score: null,
				version: 1,
				earTagNumber: dto.earTagNumber ?? null,
				name: (dto.name ?? null) as unknown as Cattle["name"],
				createdAt: new Date(),
				updatedAt: new Date()
			};
			map.set(cattle.cattleId as unknown as number, cattle);
			return cattle;
		},
		async update(id, partial) {
			const curr = map.get(id as unknown as number);
			if (!curr) throw new Error("not found");
			const next = { ...curr, ...partial } as Cattle;
			map.set(id as unknown as number, next);
			return next;
		},
		async delete(id) {
			map.delete(id as unknown as number);
		},
		async countByStatus() {
			return [];
		},
		async appendStatusHistory() {},
		async findByIds() {
			return [];
		},
		async findByIdentificationNumber() {
			return null;
		},
		async searchCount() {
			return 0;
		},
		async updateStatus() {
			return {} as Cattle;
		},
		async getStatusHistory() {
			return [];
		},
		async getAgeDistribution() {
			return [];
		},
		async getBreedDistribution() {
			return [];
		},
		async getCattleNeedingAttention() {
			return [];
		},
		async batchUpdate() {
			return [];
		},
		async updateWithVersion() {
			return {} as Cattle;
		}
	};
}

const fixedNow = new Date("2024-01-01T00:00:00.000Z");
const clock = { now: () => fixedNow };

const mockBreedingRepo = {
	upsertBreedingStatus: async () => {},
	upsertBreedingSummary: async () => {},
	findByCattleId: async () => null,
	save: async () => ({
		cattleId: 1 as unknown as CattleId,
		currentStatus: null as unknown as BreedingStatus,
		summary: null as unknown as BreedingSummary,
		history: [] as BreedingEvent[],
		events: [] as BreedingEvent[],
		version: 1,
		lastUpdated: new Date()
	}),
	delete: async () => {},
	getBreedingHistory: async () => [],
	getBreedingStatus: async () => null,
	getBreedingSummary: async () => null,
	appendBreedingEvent: async () => {},
	findCattleNeedingAttention: async () => [],
	getBreedingStatistics: async () => ({
		totalInseminations: 0,
		totalPregnancies: 0,
		totalCalvings: 0,
		averagePregnancyRate: 0,
		difficultBirthRate: 0
	}),
	updateBreedingStatusDays: async () => {}
};

function baseCattle(owner: UserId, idNum: number, id: number): Cattle {
	return {
		cattleId: id as unknown as CattleId,
		ownerUserId: owner,
		identificationNumber: idNum as unknown as Cattle["identificationNumber"],
		earTagNumber: null,
		name: "A" as unknown as Cattle["name"],
		gender: "雌",
		birthday: null,
		growthStage: null,
		age: null,
		monthsOld: null,
		daysOld: null,
		breed: null,
		status: "HEALTHY",
		producerName: null,
		barn: null,
		breedingValue: null,
		notes: null,
		weight: null,
		score: null,
		version: 1,
		createdAt: fixedNow,
		updatedAt: fixedNow
	};
}

describe("update cattle UC", () => {
	it("updates when owner matches", async () => {
		const owner = 1 as unknown as UserId;
		const cow = baseCattle(owner, 100, 1);
		const repo = setupRepo(cow);
		const r = await update({ repo, clock, breedingRepo: mockBreedingRepo })({
			requesterUserId: owner,
			id: cow.cattleId,
			patch: { name: "B" as unknown as Cattle["name"] }
		});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value.name).toBe("B");
	});

	it("forbids when owner mismatches", async () => {
		const owner = 1 as unknown as UserId;
		const other = 2 as unknown as UserId;
		const cow = baseCattle(owner, 100, 1);
		const repo = setupRepo(cow);
		const r = await update({ repo, clock, breedingRepo: mockBreedingRepo })({
			requesterUserId: other,
			id: cow.cattleId,
			patch: { name: "B" as unknown as Cattle["name"] }
		});
		expect(r.ok).toBe(false);
	});

	it("not found when missing", async () => {
		const owner = 1 as unknown as UserId;
		const repo = setupRepo();
		const r = await update({ repo, clock, breedingRepo: mockBreedingRepo })({
			requesterUserId: owner,
			id: 999 as unknown as CattleId,
			patch: { name: "B" as unknown as Cattle["name"] }
		});
		expect(r.ok).toBe(false);
	});
});
