import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
import { search } from "../../domain/services/search";
import type { CattleRepoPort } from "../../ports";

function makeCow(owner: UserId, id: number, name: string): Cattle {
	return {
		cattleId: id as unknown as CattleId,
		ownerUserId: owner,
		identificationNumber: id as unknown as Cattle["identificationNumber"],
		earTagNumber: null,
		name,
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
}

function setupRepo(items: Cattle[]): CattleRepoPort {
	const list = [...items];
	return {
		async findById() {
			return null;
		},
		async search(q) {
			return list
				.filter(
					(c) =>
						(c.ownerUserId as unknown as number) ===
						(q.ownerUserId as unknown as number)
				)
				.slice(0, q.limit);
		},
		async create(dto) {
			return dto;
		},
		async update() {
			throw new Error("not used");
		},
		async delete() {},
		async countByStatus() {
			return [];
		},
		async appendStatusHistory() {}
	};
}

describe("search cattle UC", () => {
	it("returns only owner's cattle up to limit", async () => {
		const owner1 = 1 as unknown as UserId;
		const owner2 = 2 as unknown as UserId;
		const repo = setupRepo([
			makeCow(owner1, 1, "A"),
			makeCow(owner1, 2, "B"),
			makeCow(owner2, 3, "C")
		]);
		const uc = search({ repo });
		const r = await uc({
			ownerUserId: owner1,
			limit: 1,
			sortBy: "id",
			sortOrder: "desc"
		});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value.length).toBe(1);
	});
});
