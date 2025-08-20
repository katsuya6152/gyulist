import { and, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { breedingStatus, breedingSummary } from "../../../../db/schema";
import type { CattleId } from "../../../../shared/brand";
import type { BreedingRepoPort } from "../../ports";
import {
	breedingStatusFromDb,
	breedingStatusToDb,
	breedingSummaryFromDb,
	breedingSummaryToDb,
	reconstructBreedingAggregateFromDb
} from "../mappers/breedingMappers";

export function makeBreedingRepo(db: AnyD1Database): BreedingRepoPort {
	const d = drizzle(db);

	return {
		async findByCattleId(cattleId) {
			const [statusRow] = await d
				.select()
				.from(breedingStatus)
				.where(eq(breedingStatus.cattleId, cattleId as unknown as number))
				.limit(1);

			const [summaryRow] = await d
				.select()
				.from(breedingSummary)
				.where(eq(breedingSummary.cattleId, cattleId as unknown as number))
				.limit(1);

			const status = statusRow ? breedingStatusFromDb(statusRow) : null;
			const summary = summaryRow ? breedingSummaryFromDb(summaryRow) : null;

			if (!status && !summary) return null;

			return reconstructBreedingAggregateFromDb({
				cattleId,
				currentStatus:
					status ??
					(breedingStatusFromDb({
						cattleId: cattleId as unknown as number,
						parity: 0,
						breedingMemo: null,
						daysAfterCalving: null,
						expectedCalvingDate: null,
						scheduledPregnancyCheckDate: null,
						daysOpen: null,
						pregnancyDays: null,
						daysAfterInsemination: null,
						inseminationCount: null,
						isDifficultBirth: null,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						breedingStatusId: 0
					} as unknown as typeof breedingStatus.$inferSelect) as NonNullable<
						ReturnType<typeof breedingStatusFromDb>
					>),
				summary:
					summary ??
					(breedingSummaryFromDb({
						cattleId: cattleId as unknown as number,
						totalInseminationCount: 0,
						averageDaysOpen: null,
						averagePregnancyPeriod: null,
						averageCalvingInterval: null,
						difficultBirthCount: 0,
						pregnancyHeadCount: 0,
						pregnancySuccessRate: null,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						breedingSummaryId: 0
					} as unknown as typeof breedingSummary.$inferSelect) as NonNullable<
						ReturnType<typeof breedingSummaryFromDb>
					>),
				history: [],
				version: 1,
				lastUpdated: new Date()
			});
		},

		async save(aggregate) {
			const statusInsert = breedingStatusToDb(
				aggregate.cattleId,
				aggregate.currentStatus
			);
			const summaryInsert = breedingSummaryToDb(
				aggregate.cattleId,
				aggregate.summary
			);

			const existingStatus = await d
				.select({ id: breedingStatus.breedingStatusId })
				.from(breedingStatus)
				.where(
					eq(breedingStatus.cattleId, aggregate.cattleId as unknown as number)
				)
				.limit(1);

			if (existingStatus.length > 0) {
				await d
					.update(breedingStatus)
					.set({ ...statusInsert, updatedAt: new Date().toISOString() })
					.where(
						eq(breedingStatus.cattleId, aggregate.cattleId as unknown as number)
					)
					.returning();
			} else {
				await d
					.insert(breedingStatus)
					.values({
						...statusInsert,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					})
					.returning();
			}

			const existingSummary = await d
				.select({ id: breedingSummary.breedingSummaryId })
				.from(breedingSummary)
				.where(
					eq(breedingSummary.cattleId, aggregate.cattleId as unknown as number)
				)
				.limit(1);

			if (existingSummary.length > 0) {
				await d
					.update(breedingSummary)
					.set({ ...summaryInsert, updatedAt: new Date().toISOString() })
					.where(
						eq(
							breedingSummary.cattleId,
							aggregate.cattleId as unknown as number
						)
					)
					.returning();
			} else {
				await d
					.insert(breedingSummary)
					.values({
						...summaryInsert,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					})
					.returning();
			}

			// Re-read
			const saved = await this.findByCattleId(aggregate.cattleId);
			if (!saved) {
				// If nothing persisted (unexpected), fall back to aggregate
				return aggregate;
			}
			return saved;
		},

		async delete(cattleId) {
			await d
				.delete(breedingStatus)
				.where(eq(breedingStatus.cattleId, cattleId as unknown as number));
			await d
				.delete(breedingSummary)
				.where(eq(breedingSummary.cattleId, cattleId as unknown as number));
		},

		async getBreedingHistory() {
			// Event sourcing table is not yet available. Return empty for now.
			return [];
		},

		async appendBreedingEvent() {
			// No-op until event store is implemented
		},

		async findCattleNeedingAttention(ownerUserId, currentDate) {
			// 繁殖状態を持つ牛のID一覧を取得
			const statusRows = await d
				.select({ cattleId: breedingStatus.cattleId })
				.from(breedingStatus)
				.limit(1000); // バッチ処理用の制限

			return statusRows.map((row) => row.cattleId as unknown as CattleId);
		},

		async updateBreedingStatusDays(cattleId, currentTime) {
			// 繁殖状態の日数を現在時刻に基づいて更新
			const currentDate = currentTime.toISOString().split("T")[0]; // YYYY-MM-DD形式

			await d
				.update(breedingStatus)
				.set({
					updatedAt: currentTime.toISOString()
				})
				.where(eq(breedingStatus.cattleId, cattleId as unknown as number));
		},

		async getBreedingStatistics() {
			// Not implemented yet
			return {
				totalInseminations: 0,
				totalPregnancies: 0,
				totalCalvings: 0,
				averagePregnancyRate: 0,
				difficultBirthRate: 0
			};
		}
	} satisfies BreedingRepoPort;
}
