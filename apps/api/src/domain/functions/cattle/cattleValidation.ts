/**
 * Cattle Validation Functions
 *
 * 牛管理ドメインのバリデーション関数群
 * 純粋関数として実装され、副作用を持たない
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { CattleError } from "../../errors/cattle/CattleErrors";
import type { NewCattleProps } from "../../types/cattle";

/**
 * 文字列フィールドの検証と変換を行うヘルパー関数
 *
 * @param value - 検証する文字列値
 * @param fieldName - フィールド名（エラーメッセージ用）
 * @returns 検証済みの文字列またはnull
 */
export function validateAndTransformString(
	value: string | null | undefined,
	fieldName: string
): string | null {
	if (value === null || value === undefined) return null;
	if (typeof value !== "string") return null;

	const trimmed = value.trim();
	if (trimmed === "") return null;

	return trimmed;
}

/**
 * 個体識別番号のバリデーション
 *
 * @param identificationNumber - 個体識別番号
 * @returns バリデーション結果
 */
export function validateIdentificationNumber(
	identificationNumber: number
): Result<true, CattleError> {
	if (identificationNumber <= 0) {
		return err({
			type: "ValidationError",
			message: "個体識別番号は正の整数である必要があります",
			field: "identificationNumber"
		});
	}
	return ok(true);
}

/**
 * 誕生日のバリデーション
 *
 * @param birthday - 誕生日
 * @param currentDate - 現在日時
 * @returns バリデーション結果
 */
export function validateBirthday(
	birthday: Date | null,
	currentDate: Date = new Date()
): Result<true, CattleError> {
	if (birthday && birthday > currentDate) {
		return err({
			type: "ValidationError",
			message: "誕生日は未来の日付ではありません",
			field: "birthday"
		});
	}
	return ok(true);
}

/**
 * 体重のバリデーション
 *
 * @param weight - 体重
 * @returns バリデーション結果
 */
export function validateWeight(
	weight: number | null | undefined
): Result<true, CattleError> {
	if (weight !== null && weight !== undefined && weight <= 0) {
		return err({
			type: "ValidationError",
			message: "体重は正の値である必要があります",
			field: "weight"
		});
	}
	return ok(true);
}

/**
 * 評価スコアのバリデーション
 *
 * @param score - 評価スコア
 * @returns バリデーション結果
 */
export function validateScore(
	score: number | null | undefined
): Result<true, CattleError> {
	if (score !== null && score !== undefined) {
		if (score < 0 || score > 100) {
			return err({
				type: "ValidationError",
				message: "評価スコアは0-100の範囲内である必要があります",
				field: "score"
			});
		}
	}
	return ok(true);
}

/**
 * 新規牛作成時のプロパティ全体のバリデーション
 *
 * @param props - 新規牛作成プロパティ
 * @param currentDate - 現在日時
 * @returns バリデーション結果
 */
export function validateNewCattleProps(
	props: NewCattleProps,
	currentDate: Date = new Date()
): Result<true, CattleError> {
	// 個体識別番号の検証
	const identificationResult = validateIdentificationNumber(
		props.identificationNumber
	);
	if (!identificationResult.ok) return identificationResult;

	// 誕生日の検証
	const birthdayResult = validateBirthday(props.birthday ?? null, currentDate);
	if (!birthdayResult.ok) return birthdayResult;

	// 体重の検証
	const weightResult = validateWeight(props.weight);
	if (!weightResult.ok) return weightResult;

	// 評価スコアの検証
	const scoreResult = validateScore(props.score);
	if (!scoreResult.ok) return scoreResult;

	return ok(true);
}
