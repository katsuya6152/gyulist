import type { AnyD1Database } from "drizzle-orm/d1";
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
