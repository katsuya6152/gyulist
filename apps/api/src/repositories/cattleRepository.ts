import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import {
	events,
	bloodline,
	breedingStatus,
	breedingSummary,
	cattle,
	motherInfo,
} from "../db/schema";
import type {
	CreateCattleInput,
	UpdateCattleInput,
} from "../validators/cattleValidator";

export async function findCattleList(db: AnyD1Database, ownerUserId: number) {
	const dbInstance = drizzle(db);
	return await dbInstance
		.select()
		.from(cattle)
		.where(eq(cattle.ownerUserId, ownerUserId));
}

export async function searchCattle(
	db: AnyD1Database,
	ownerUserId: number,
	query: {
		cursor?: { id: number; value: string | number };
		limit: number;
		sort_by: "id" | "name" | "days_old";
		sort_order: "asc" | "desc";
		search?: string;
		growth_stage?: string[];
		gender?: string[];
	},
) {
	const dbInstance = drizzle(db);
	const conditions = [eq(cattle.ownerUserId, ownerUserId)];

	// 検索キーワード
	if (query.search) {
		conditions.push(
			sql`(${cattle.name} LIKE ${`%${query.search}%`} OR CAST(${cattle.identificationNumber} AS TEXT) LIKE ${`%${query.search}%`} OR CAST(${cattle.earTagNumber} AS TEXT) LIKE ${`%${query.search}%`})`,
		);
	}

	// 成長段階でフィルター
	if (query.growth_stage && query.growth_stage.length > 0) {
		const quotedStages = query.growth_stage
			.map((stage) => `'${stage}'`)
			.join(",");
		conditions.push(sql`${cattle.growthStage} IN (${sql.raw(quotedStages)})`);
	}

	// 性別でフィルター
	if (query.gender && query.gender.length > 0) {
		const quotedGenders = query.gender.map((g) => `'${g}'`).join(",");
		conditions.push(sql`${cattle.gender} IN (${sql.raw(quotedGenders)})`);
	}

	// カーソル条件の追加
	if (query.cursor) {
		const cursorCondition =
			query.sort_order === "desc"
				? sql`${getSortColumn(query.sort_by)} < ${query.cursor.value}`
				: sql`${getSortColumn(query.sort_by)} > ${query.cursor.value}`;
		conditions.push(cursorCondition);
	}

	// クエリの実行
	const results = await dbInstance
		.select()
		.from(cattle)
		.where(and(...conditions))
		.orderBy(
			query.sort_order === "desc"
				? desc(getSortColumn(query.sort_by))
				: asc(getSortColumn(query.sort_by)),
		)
		.limit(query.limit + 1);

	return results;
}

// ソートカラムの取得
function getSortColumn(sortBy: "id" | "name" | "days_old") {
	switch (sortBy) {
		case "id":
			return cattle.cattleId;
		case "name":
			return cattle.name;
		case "days_old":
			return sql`CAST((julianday('now') - julianday(${cattle.birthday})) AS INTEGER)`;
		default:
			return cattle.cattleId;
	}
}

export async function findCattleById(db: AnyD1Database, cattleId: number) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.select({
			cattle: cattle,
			bloodline: bloodline,
			motherInfo: motherInfo,
			breedingStatus: breedingStatus,
			breedingSummary: breedingSummary,
			events: events,
		})
		.from(cattle)
		.leftJoin(bloodline, eq(bloodline.cattleId, cattle.cattleId))
		.leftJoin(motherInfo, eq(motherInfo.cattleId, cattle.cattleId))
		.leftJoin(breedingStatus, eq(breedingStatus.cattleId, cattle.cattleId))
		.leftJoin(breedingSummary, eq(breedingSummary.cattleId, cattle.cattleId))
		.leftJoin(events, eq(events.cattleId, cattle.cattleId))
		.where(eq(cattle.cattleId, cattleId));

	if (!result.length) return null;

	// イベントを時系列でソート
	const sortedEvents = result
		.filter((r) => r.events)
		.map((r) => r.events)
		.sort((a, b) => {
			if (!a || !b) return 0;
			return (
				new Date(b.eventDatetime).getTime() -
				new Date(a.eventDatetime).getTime()
			);
		});

	// 重複を除去して1つのオブジェクトにまとめる
	return {
		...result[0].cattle,
		bloodline: result[0].bloodline,
		motherInfo: result[0].motherInfo,
		breedingStatus: result[0].breedingStatus,
		breedingSummary: result[0].breedingSummary,
		events: sortedEvents,
	};
}

export async function createCattle(db: AnyD1Database, data: CreateCattleInput) {
	const dbInstance = drizzle(db);
	const result = await dbInstance.insert(cattle).values(data).returning();
	return result[0];
}

export async function createBloodline(
	db: AnyD1Database,
	cattleId: number,
	bloodlineData: {
		fatherCattleName?: string | null;
		motherFatherCattleName?: string | null;
		motherGrandFatherCattleName?: string | null;
		motherGreatGrandFatherCattleName?: string | null;
	},
) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.insert(bloodline)
		.values({
			cattleId,
			...bloodlineData,
		})
		.returning();
	return result[0];
}

export async function createBreedingStatus(
	db: AnyD1Database,
	cattleId: number,
	breedingStatusData: {
		parity?: number | null;
		expectedCalvingDate?: string | null;
		scheduledPregnancyCheckDate?: string | null;
		daysAfterCalving?: number | null;
		daysOpen?: number | null;
		pregnancyDays?: number | null;
		daysAfterInsemination?: number | null;
		inseminationCount?: number | null;
		breedingMemo?: string | null;
		isDifficultBirth?: boolean | null;
	},
) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.insert(breedingStatus)
		.values({
			cattleId,
			...breedingStatusData,
		})
		.returning();
	return result[0];
}

export async function createBreedingSummary(
	db: AnyD1Database,
	cattleId: number,
	breedingSummaryData: {
		totalInseminationCount?: number | null;
		averageDaysOpen?: number | null;
		averagePregnancyPeriod?: number | null;
		averageCalvingInterval?: number | null;
		difficultBirthCount?: number | null;
		pregnancyHeadCount?: number | null;
		pregnancySuccessRate?: number | null;
	},
) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.insert(breedingSummary)
		.values({
			cattleId,
			...breedingSummaryData,
		})
		.returning();
	return result[0];
}

export async function updateCattle(
	db: AnyD1Database,
	cattleId: number,
	data: UpdateCattleInput,
) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.update(cattle)
		.set({ ...data, updatedAt: new Date().toISOString() })
		.where(eq(cattle.cattleId, cattleId))
		.returning();
	return result[0];
}

export async function updateBloodline(
	db: AnyD1Database,
	cattleId: number,
	bloodlineData: {
		fatherCattleName?: string | null;
		motherFatherCattleName?: string | null;
		motherGrandFatherCattleName?: string | null;
		motherGreatGrandFatherCattleName?: string | null;
	},
) {
	const dbInstance = drizzle(db);
	// 既存の血統情報を確認
	const existing = await dbInstance
		.select()
		.from(bloodline)
		.where(eq(bloodline.cattleId, cattleId))
		.limit(1);

	if (existing.length > 0) {
		// 既存のレコードを更新
		const result = await dbInstance
			.update(bloodline)
			.set(bloodlineData)
			.where(eq(bloodline.cattleId, cattleId))
			.returning();
		return result[0];
	}

	// 新規作成
	return await createBloodline(db, cattleId, bloodlineData);
}

export async function updateBreedingStatus(
	db: AnyD1Database,
	cattleId: number,
	breedingStatusData: {
		parity?: number | null;
		expectedCalvingDate?: string | null;
		scheduledPregnancyCheckDate?: string | null;
		daysAfterCalving?: number | null;
		daysOpen?: number | null;
		pregnancyDays?: number | null;
		daysAfterInsemination?: number | null;
		inseminationCount?: number | null;
		breedingMemo?: string | null;
		isDifficultBirth?: boolean | null;
	},
) {
	const dbInstance = drizzle(db);
	// 既存の繁殖状態を確認
	const existing = await dbInstance
		.select()
		.from(breedingStatus)
		.where(eq(breedingStatus.cattleId, cattleId))
		.limit(1);

	if (existing.length > 0) {
		// 既存のレコードを更新
		const result = await dbInstance
			.update(breedingStatus)
			.set({ ...breedingStatusData, updatedAt: new Date().toISOString() })
			.where(eq(breedingStatus.cattleId, cattleId))
			.returning();
		return result[0];
	}

	// 新規作成
	return await createBreedingStatus(db, cattleId, breedingStatusData);
}

export async function updateBreedingSummary(
	db: AnyD1Database,
	cattleId: number,
	breedingSummaryData: {
		totalInseminationCount?: number | null;
		averageDaysOpen?: number | null;
		averagePregnancyPeriod?: number | null;
		averageCalvingInterval?: number | null;
		difficultBirthCount?: number | null;
		pregnancyHeadCount?: number | null;
		pregnancySuccessRate?: number | null;
	},
) {
	const dbInstance = drizzle(db);
	// 既存の繁殖統計を確認
	const existing = await dbInstance
		.select()
		.from(breedingSummary)
		.where(eq(breedingSummary.cattleId, cattleId))
		.limit(1);

	if (existing.length > 0) {
		// 既存のレコードを更新
		const result = await dbInstance
			.update(breedingSummary)
			.set({ ...breedingSummaryData, updatedAt: new Date().toISOString() })
			.where(eq(breedingSummary.cattleId, cattleId))
			.returning();
		return result[0];
	}

	// 新規作成
	return await createBreedingSummary(db, cattleId, breedingSummaryData);
}

export async function deleteCattle(db: AnyD1Database, cattleId: number) {
	const dbInstance = drizzle(db);
	await dbInstance.delete(cattle).where(eq(cattle.cattleId, cattleId));
}
