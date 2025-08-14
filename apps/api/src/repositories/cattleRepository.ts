import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import {
	events,
	bloodline,
	breedingStatus,
	breedingSummary,
	cattle,
	cattleStatusHistory,
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
		status?: string[];
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

	// ステータスでフィルター
	if (query.status && query.status.length > 0) {
		const quotedStatuses = query.status.map((s) => `'${s}'`).join(",");
		conditions.push(sql`${cattle.status} IN (${sql.raw(quotedStatuses)})`);
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

	// 結果から対象IDの行を優先して選択（テスト用フェイクDB互換のための安全策）
	const matched =
		result.find((r) => r.cattle?.cattleId === cattleId) ?? result[0];

	// イベントを時系列でソート（対象個体のイベントのみ）
	const targetId = matched.cattle?.cattleId ?? cattleId;
	const sortedEvents = result
		.filter((r) => {
			if (!r.events) return false;
			const ev = r.events as unknown as { cattleId?: number };
			return typeof ev.cattleId === "number" ? ev.cattleId === targetId : true;
		})
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
		...matched.cattle,
		bloodline: matched.bloodline,
		motherInfo: matched.motherInfo,
		breedingStatus: matched.breedingStatus,
		breedingSummary: matched.breedingSummary,
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

export async function updateCattleStatus(
	db: AnyD1Database,
	cattleId: number,
	status: "HEALTHY" | "PREGNANT" | "RESTING" | "TREATING" | "SHIPPED" | "DEAD",
) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.update(cattle)
		.set({ status, updatedAt: new Date().toISOString() })
		.where(eq(cattle.cattleId, cattleId))
		.returning();
	return result[0];
}

export async function createStatusHistory(
	db: AnyD1Database,
	data: {
		cattleId: number;
		oldStatus: string | null;
		newStatus: string;
		changedBy: number;
		reason?: string | null;
	},
) {
	const dbInstance = drizzle(db);
	const result = await dbInstance
		.insert(cattleStatusHistory)
		.values({
			cattleId: data.cattleId,
			oldStatus: data.oldStatus,
			newStatus: data.newStatus,
			changedBy: data.changedBy,
			reason: data.reason ?? null,
			changedAt: new Date().toISOString(),
		} as typeof cattleStatusHistory.$inferInsert)
		.returning();
	return result[0];
}

export async function deleteCattle(db: AnyD1Database, cattleId: number) {
	const dbInstance = drizzle(db);

	// 関連するすべてのテーブルのレコードを先に削除
	await dbInstance.delete(events).where(eq(events.cattleId, cattleId));
	await dbInstance.delete(bloodline).where(eq(bloodline.cattleId, cattleId));
	await dbInstance
		.delete(breedingStatus)
		.where(eq(breedingStatus.cattleId, cattleId));
	await dbInstance
		.delete(breedingSummary)
		.where(eq(breedingSummary.cattleId, cattleId));
	await dbInstance.delete(motherInfo).where(eq(motherInfo.cattleId, cattleId));

	// 牛のレコードを削除
	await dbInstance.delete(cattle).where(eq(cattle.cattleId, cattleId));
}

// ステータス別の頭数集計
export async function countCattleByStatus(
	db: AnyD1Database,
	ownerUserId: number,
) {
	const dbInstance = drizzle(db);
	const rows = await dbInstance
		.select({
			status: cattle.status,
			count: sql<number>`COUNT(*)`.as("count"),
		})
		.from(cattle)
		.where(eq(cattle.ownerUserId, ownerUserId))
		.groupBy(cattle.status);

	return rows as Array<{
		status: InferSelectModel<typeof cattle>["status"];
		count: number;
	}>;
}
