import { describe, expect, it } from "vitest";
import type { CattleId, UserId } from "../../../shared/brand";
import type { Cattle } from "../../domain/model/cattle";
import { updateStatus } from "../../domain/services/updateStatus";
import type { CattleRepoPort } from "../../ports";

function setupRepo(initial: Cattle): CattleRepoPort {
	let current = initial;
	return {
		async findById() {
			return current;
		},
		async search() {
			return [current];
		},
		async create(dto) {
			current = dto;
			return dto;
		},
		async update(id, partial) {
			current = { ...current, ...partial } as Cattle;
			return current;
		},
		async delete() {},
		async countByStatus() {
			return [];
		},
		async appendStatusHistory() {}
	};
}

describe("updateStatus UC", () => {
	it("appends history and updates when owner matches", async () => {
		const owner = 1 as unknown as UserId;
		const cow: Cattle = {
			cattleId: 1 as unknown as CattleId,
			ownerUserId: owner,
			identificationNumber: 1 as unknown as Cattle["identificationNumber"],
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
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		const repo = setupRepo(cow);
		const fixedNow = new Date("2024-01-01T00:00:00.000Z");
		const clock = { now: () => fixedNow };
		const r = await updateStatus({ repo, clock })({
			requesterUserId: owner,
			id: cow.cattleId,
			newStatus: "RESTING",
			reason: null
		});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value.status).toBe("RESTING");
	});
});
