import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { cattle } from "../db/schema";
import {
	createBloodline,
	createBreedingStatus,
	createBreedingSummary,
	createCattle,
	createStatusHistory,
	deleteCattle,
	findCattleById,
	searchCattle,
	updateBloodline,
	updateBreedingStatus,
	updateBreedingSummary,
	updateCattle,
	updateCattleStatus,
} from "../repositories/cattleRepository";
import { calculateAge } from "../utils/date";
import type {
	Cattle,
	CreateCattleInput,
	SearchCattleQuery,
	UpdateCattleInput,
} from "../validators/cattleValidator";

// 繁殖情報の自動計算ロジック
function calculateBreedingValues(
	birthday: string | null,
	expectedCalvingDate: string | null,
	scheduledPregnancyCheckDate: string | null,
) {
	const today = new Date();

	// 産次の計算（生年月日から現在までの年数）
	let parity = null;
	if (birthday) {
		const birthDate = new Date(birthday);
		const ageInYears = Math.floor(
			(today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
		);
		// 初産は通常2-3歳、その後は年1回の分娩を想定
		parity = Math.max(0, ageInYears - 2);
	}

	// 妊娠日数の計算
	let pregnancyDays = null;
	if (scheduledPregnancyCheckDate) {
		const checkDate = new Date(scheduledPregnancyCheckDate);
		pregnancyDays = Math.floor(
			(today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24),
		);
	}

	// 分娩予定日までの日数
	let daysUntilCalving = null;
	if (expectedCalvingDate) {
		const calvingDate = new Date(expectedCalvingDate);
		daysUntilCalving = Math.floor(
			(calvingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
		);
	}

	return {
		parity,
		pregnancyDays,
		daysUntilCalving,
	};
}

export async function getCattleById(db: AnyD1Database, cattleId: number) {
	return await findCattleById(db, cattleId);
}

export async function createNewCattle(
	db: AnyD1Database,
	data: CreateCattleInput & {
		bloodline?: {
			fatherCattleName?: string | null;
			motherFatherCattleName?: string | null;
			motherGrandFatherCattleName?: string | null;
			motherGreatGrandFatherCattleName?: string | null;
		};
		breedingStatus?: {
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
		};
		breedingSummary?: {
			totalInseminationCount?: number | null;
			averageDaysOpen?: number | null;
			averagePregnancyPeriod?: number | null;
			averageCalvingInterval?: number | null;
			difficultBirthCount?: number | null;
			pregnancyHeadCount?: number | null;
			pregnancySuccessRate?: number | null;
		};
	},
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
		status: "HEALTHY", // デフォルトで健康ステータスを設定
	};

	// 牛の基本情報を保存
	const cattle = await createCattle(db, cattleData);

	// 血統情報を保存
	if (data.bloodline) {
		await createBloodline(db, cattle.cattleId, data.bloodline);
	}

	// 繁殖状態の自動計算
	const breedingCalculations = calculateBreedingValues(
		data.birthday || null,
		data.breedingStatus?.expectedCalvingDate || null,
		data.breedingStatus?.scheduledPregnancyCheckDate || null,
	);

	// 繁殖状態を保存（自動計算値を含む）
	const breedingStatusData = {
		...data.breedingStatus,
		parity: breedingCalculations.parity,
		pregnancyDays: breedingCalculations.pregnancyDays,
		// 手動入力値があれば優先、なければ自動計算値を使用
		expectedCalvingDate: data.breedingStatus?.expectedCalvingDate || null,
		scheduledPregnancyCheckDate:
			data.breedingStatus?.scheduledPregnancyCheckDate || null,
		breedingMemo: data.breedingStatus?.breedingMemo || null,
		isDifficultBirth: data.breedingStatus?.isDifficultBirth || null,
	};

	await createBreedingStatus(db, cattle.cattleId, breedingStatusData);

	// 繁殖統計は初期値として0を設定
	const breedingSummaryData = {
		totalInseminationCount: 0,
		averageDaysOpen: 0,
		averagePregnancyPeriod: 0,
		averageCalvingInterval: 0,
		difficultBirthCount: 0,
		pregnancyHeadCount: 0,
		pregnancySuccessRate: 0,
		...data.breedingSummary, // 手動入力値があれば上書き
	};

	await createBreedingSummary(db, cattle.cattleId, breedingSummaryData);

	return cattle;
}

export async function updateCattleData(
	db: AnyD1Database,
	cattleId: number,
	data: UpdateCattleInput & {
		bloodline?: {
			fatherCattleName?: string | null;
			motherFatherCattleName?: string | null;
			motherGrandFatherCattleName?: string | null;
			motherGreatGrandFatherCattleName?: string | null;
		};
		breedingStatus?: {
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
		};
		breedingSummary?: {
			totalInseminationCount?: number | null;
			averageDaysOpen?: number | null;
			averagePregnancyPeriod?: number | null;
			averageCalvingInterval?: number | null;
			difficultBirthCount?: number | null;
			pregnancyHeadCount?: number | null;
			pregnancySuccessRate?: number | null;
		};
	},
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
	const updateData: Partial<CreateCattleInput> = {
		...data,
		...(age !== null && {
			age,
			monthsOld,
			daysOld,
		}),
	};

	// 牛の基本情報を更新
	const cattle = await updateCattle(db, cattleId, updateData);

	// 血統情報を更新
	if (data.bloodline) {
		await updateBloodline(db, cattleId, data.bloodline);
	}

	// 繁殖状態の自動計算
	const breedingCalculations = calculateBreedingValues(
		data.birthday || null,
		data.breedingStatus?.expectedCalvingDate || null,
		data.breedingStatus?.scheduledPregnancyCheckDate || null,
	);

	// 繁殖状態を更新（自動計算値を含む）
	const breedingStatusData = {
		...data.breedingStatus,
		parity: breedingCalculations.parity,
		pregnancyDays: breedingCalculations.pregnancyDays,
		// 手動入力値があれば優先、なければ自動計算値を使用
		expectedCalvingDate: data.breedingStatus?.expectedCalvingDate || null,
		scheduledPregnancyCheckDate:
			data.breedingStatus?.scheduledPregnancyCheckDate || null,
		breedingMemo: data.breedingStatus?.breedingMemo || null,
		isDifficultBirth: data.breedingStatus?.isDifficultBirth || null,
	};

	await updateBreedingStatus(db, cattleId, breedingStatusData);

	// 繁殖統計を更新（手動入力値のみ）
	if (data.breedingSummary) {
		await updateBreedingSummary(db, cattleId, data.breedingSummary);
	}

	return cattle;
}

export async function updateStatus(
	db: AnyD1Database,
	cattleId: number,
	newStatus: string,
	changedBy: number,
	reason?: string,
) {
	const current = await findCattleById(db, cattleId);
	if (!current) {
		throw new Error("牛が見つかりません");
	}
	// 最終ステータスの制限チェックを削除
	await updateCattleStatus(db, cattleId, newStatus);
	await createStatusHistory(db, {
		cattleId,
		oldStatus: current.status ?? null,
		newStatus,
		changedBy,
		reason: reason ?? null,
	});
	return { ...current, status: newStatus };
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
