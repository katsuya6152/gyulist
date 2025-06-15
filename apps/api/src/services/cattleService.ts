import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { cattle } from "../db/schema";
import {
	createCattle,
	deleteCattle,
	findCattleById,
	findCattleList,
	updateCattle,
} from "../repositories/cattleRepository";
import { calculateAge } from "../utils/date";
import type {
	Cattle,
	CreateCattleInput,
	SearchCattleQuery,
	UpdateCattleInput,
} from "../validators/cattleValidator";

export async function getCattleList(db: AnyD1Database, userId: number) {
	return findCattleList(db, userId);
}

export async function getCattleById(db: AnyD1Database, cattleId: number) {
	return await findCattleById(db, cattleId);
}

export async function createNewCattle(
	db: AnyD1Database,
	data: CreateCattleInput,
) {
	// 生年月日から年齢を計算
	const age = data.birthday ? calculateAge(new Date(data.birthday)) : null;
	const monthsOld = data.birthday
		? calculateAge(new Date(data.birthday), "months")
		: null;
	const daysOld = data.birthday
		? calculateAge(new Date(data.birthday), "days")
		: null;

	// データベース用のデータを作成
	const cattleData: CreateCattleInput = {
		...data,
		age,
		monthsOld,
		daysOld,
	};

	// データを保存
	return await createCattle(db, cattleData);
}

export async function updateCattleData(
	db: AnyD1Database,
	cattleId: number,
	data: UpdateCattleInput,
) {
	// 生年月日が更新された場合、年齢を再計算
	let age = null;
	let monthsOld = null;
	let daysOld = null;

	if (data.birthday) {
		age = calculateAge(new Date(data.birthday));
		monthsOld = calculateAge(new Date(data.birthday), "months");
		daysOld = calculateAge(new Date(data.birthday), "days");
	}

	// 更新データの作成
	const updateData: Partial<Cattle> = {
		...data,
		...(age !== null && {
			age,
			monthsOld,
			daysOld,
		}),
	};

	// データを更新
	return await updateCattle(db, cattleId, updateData);
}

export async function deleteCattleData(db: AnyD1Database, cattleId: number) {
	return await deleteCattle(db, cattleId);
}

export async function searchCattleList(
	db: AnyD1Database,
	ownerUserId: number,
	query: SearchCattleQuery,
) {
	const dbInstance = drizzle(db);
	const { cursor, limit, sort_by, sort_order, search, growth_stage, gender } =
		query;

	// カーソルのデコード
	let decodedCursor: { id: number; value: string | number } | undefined;
	if (cursor) {
		try {
			decodedCursor = JSON.parse(atob(cursor));
		} catch (e) {
			console.error("Invalid cursor:", e);
		}
	}

	// 検索条件の構築
	const conditions = [eq(cattle.ownerUserId, ownerUserId)];

	// 検索キーワード
	if (search) {
		conditions.push(
			sql`(${cattle.name} LIKE ${`%${search}%`} OR CAST(${cattle.identificationNumber} AS TEXT) LIKE ${`%${search}%`} OR CAST(${cattle.earTagNumber} AS TEXT) LIKE ${`%${search}%`})`,
		);
	}

	// 成長段階でフィルター
	if (growth_stage) {
		conditions.push(eq(cattle.growthStage, growth_stage));
	}

	// 性別でフィルター
	if (gender) {
		conditions.push(eq(cattle.gender, gender));
	}

	// カーソル条件の追加
	if (decodedCursor) {
		const cursorCondition =
			sort_order === "desc"
				? sql`${getSortColumn(sort_by)} < ${decodedCursor.value}`
				: sql`${getSortColumn(sort_by)} > ${decodedCursor.value}`;
		conditions.push(cursorCondition);
	}

	// クエリの実行
	const results = await dbInstance
		.select()
		.from(cattle)
		.where(and(...conditions))
		.orderBy(
			sort_order === "desc"
				? desc(getSortColumn(sort_by))
				: asc(getSortColumn(sort_by)),
		)
		.limit(limit + 1);

	// 次のページの有無を確認
	const hasNext = results.length > limit;
	const items = hasNext ? results.slice(0, -1) : results;

	// 次のカーソルの生成
	let nextCursor: string | null = null;
	if (hasNext && items.length > 0) {
		const lastItem = items[items.length - 1];
		const cursorValue =
			sort_by === "days_old"
				? Math.floor(
						(new Date().getTime() -
							new Date(lastItem.birthday ?? "").getTime()) /
							(1000 * 60 * 60 * 24),
					)
				: lastItem[getSortColumnKey(sort_by)];
		nextCursor = btoa(
			JSON.stringify({ id: lastItem.cattleId, value: cursorValue }),
		);
	}

	return {
		results: items,
		next_cursor: nextCursor,
		has_next: hasNext,
	};
}

// ソートカラムの取得
function getSortColumn(sortBy: SearchCattleQuery["sort_by"]) {
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

// ソートカラムのキー取得
function getSortColumnKey(sortBy: SearchCattleQuery["sort_by"]): keyof Cattle {
	switch (sortBy) {
		case "id":
			return "cattleId";
		case "name":
			return "name";
		case "days_old":
			return "birthday";
		default:
			return "cattleId";
	}
}
