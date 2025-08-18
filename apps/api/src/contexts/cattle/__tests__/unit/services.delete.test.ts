import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
import { remove } from "../../domain/services/delete";
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

describe("delete cattle UC", () => {
	it("deletes when owner matches", async () => {
		const owner = 1 as unknown as UserId;
		const cow: Cattle = {
			cattleId: 1 as unknown as CattleId,
			ownerUserId: owner,
			identificationNumber: 1 as unknown as Cattle["identificationNumber"],
			earTagNumber: null,
			name: "A",
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
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		const repo = setupRepo(cow);
		const r = await remove({ repo })({
			requesterUserId: owner,
			id: cow.cattleId
		});
		expect(r.ok).toBe(true);
	});
});
