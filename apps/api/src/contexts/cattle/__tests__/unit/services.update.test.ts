import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
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
		async create(dto) {
			map.set(dto.cattleId as unknown as number, dto);
			return dto;
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
		async appendStatusHistory() {}
	};
}

const fixedNow = new Date("2024-01-01T00:00:00.000Z");
const clock = { now: () => fixedNow };

function baseCattle(owner: UserId, idNum: number, id: number): Cattle {
	return {
		cattleId: id as unknown as CattleId,
		ownerUserId: owner,
		identificationNumber: idNum as unknown as Cattle["identificationNumber"],
		earTagNumber: null,
		name: "A",
		gender: "メス",
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
		createdAt: fixedNow.toISOString(),
		updatedAt: fixedNow.toISOString()
	};
}

describe("update cattle UC", () => {
	it("updates when owner matches", async () => {
		const owner = 1 as unknown as UserId;
		const cow = baseCattle(owner, 100, 1);
		const repo = setupRepo(cow);
		const r = await update({ repo, clock })({
			requesterUserId: owner,
			id: cow.cattleId,
			patch: { name: "B" }
		});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value.name).toBe("B");
	});

	it("forbids when owner mismatches", async () => {
		const owner = 1 as unknown as UserId;
		const other = 2 as unknown as UserId;
		const cow = baseCattle(owner, 100, 1);
		const repo = setupRepo(cow);
		const r = await update({ repo, clock })({
			requesterUserId: other,
			id: cow.cattleId,
			patch: { name: "B" }
		});
		expect(r.ok).toBe(false);
	});

	it("not found when missing", async () => {
		const owner = 1 as unknown as UserId;
		const repo = setupRepo();
		const r = await update({ repo, clock })({
			requesterUserId: owner,
			id: 999 as unknown as CattleId,
			patch: { name: "B" }
		});
		expect(r.ok).toBe(false);
	});
});
