import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { cattle } from "../db/schema";
import {
	createCattle,
	deleteCattle,
	findCattleById,
	searchCattle,
	updateCattle,
} from "../repositories/cattleRepository";
import { calculateAge } from "../utils/date";
import type {
	Cattle,
	CreateCattleInput,
	SearchCattleQuery,
	UpdateCattleInput,
} from "../validators/cattleValidator";

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
	// カーソルのデコード
	let decodedCursor: { id: number; value: string | number } | undefined;
	if (query.cursor) {
		try {
			decodedCursor = JSON.parse(atob(query.cursor));
		} catch (e) {
			console.error("Invalid cursor:", e);
		}
	}

	// リポジトリの呼び出し
	const results = await searchCattle(db, ownerUserId, {
		...query,
		cursor: decodedCursor,
	});

	// 次のページの有無を確認
	const hasNext = results.length > query.limit;
	const items = hasNext ? results.slice(0, -1) : results;

	// 次のカーソルの生成
	let nextCursor: string | null = null;
	if (hasNext && items.length > 0) {
		const lastItem = items[items.length - 1];
		const cursorValue =
			query.sort_by === "days_old"
				? Math.floor(
						(new Date().getTime() -
							new Date(lastItem.birthday ?? "").getTime()) /
							(1000 * 60 * 60 * 24),
					)
				: lastItem[getSortColumnKey(query.sort_by)];
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
