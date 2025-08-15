import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
import { create } from "../../domain/services/create";
import type { CattleRepoPort } from "../../ports";

const fixedNow = new Date("2024-01-01T00:00:00.000Z");
const clock = { now: () => fixedNow };

function makeRepo(): CattleRepoPort {
	let seq = 1;
	const map = new Map<number, Cattle>();
	return {
		async findById(id) {
			return map.get(id as unknown as number) ?? null;
		},
		async search() {
			return Array.from(map.values());
		},
		async create(dto) {
			const id = seq++ as number;
			const created = { ...dto, cattleId: id as unknown as CattleId };
			map.set(id, created);
			return created;
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

describe("create cattle UC", () => {
	it("creates cattle with clock timestamps", async () => {
		const repo = makeRepo();
		const uc = create({ repo, clock });
		const r = await uc({
			ownerUserId: 1 as unknown as UserId,
			identificationNumber: 1001,
			name: "X",
			gender: "メス",
			birthday: null,
			growthStage: null,
			breed: null,
			status: "HEALTHY",
			producerName: null,
			barn: null,
			breedingValue: null,
			notes: null,
			earTagNumber: null
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.createdAt).toBe(fixedNow.toISOString());
			expect(r.value.updatedAt).toBe(fixedNow.toISOString());
		}
	});
});
