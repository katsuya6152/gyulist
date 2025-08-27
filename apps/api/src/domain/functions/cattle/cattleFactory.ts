/**
 * Cattle Factory Functions
 *
 * 牛エンティティの作成・更新を行うファクトリー関数群
 * 純粋関数として実装され、ドメインルールに基づくバリデーションを提供
 */

import type { CattleId } from "../../../shared/brand";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { CattleError } from "../../errors/cattle/CattleErrors";
import type {
	Barn,
	Breed,
	BreedingValue,
	Cattle,
	CattleName,
	NewCattleProps,
	Notes,
	ProducerName,
	Score,
	UpdateCattleProps,
	Weight
} from "../../types/cattle";
import {
	validateAndTransformString,
	validateBirthday,
	validateNewCattleProps,
	validateScore,
	validateWeight
} from "./cattleValidation";

/**
 * 牛エンティティのファクトリー関数
 *
 * 新規牛の作成を行い、ドメインルールに基づくバリデーションを実行します。
 * 以下の特徴を持ちます：
 *
 * - 純粋関数: 副作用なし、同じ入力に対して同じ出力
 * - ドメインルール: ビジネスルールに基づく検証
 * - 計算フィールド: 誕生日から年齢情報を自動計算
 * - 型安全性: Brand型による厳密な型チェック
 *
 * @param props - 新規牛のプロパティ
 * @param currentDate - 現在日時（テスト時の再現性向上のため注入）
 * @returns 作成結果（成功時は牛エンティティ、失敗時はドメインエラー）
 */
export function createCattle(
	props: NewCattleProps,
	currentDate: Date = new Date()
): Result<Cattle, CattleError> {
	// プロパティ全体のバリデーション
	const validationResult = validateNewCattleProps(props, currentDate);
	if (!validationResult.ok) return validationResult;

	// 文字列フィールドの検証と変換
	const name = validateAndTransformString(props.name, "name");
	const breed = validateAndTransformString(props.breed, "breed");
	const producerName = validateAndTransformString(
		props.producerName,
		"producerName"
	);
	const barn = validateAndTransformString(props.barn, "barn");
	const breedingValue = validateAndTransformString(
		props.breedingValue,
		"breedingValue"
	);
	const notes = validateAndTransformString(props.notes, "notes");

	// 牛エンティティの作成
	return ok({
		cattleId: 0 as CattleId, // リポジトリで設定される（一時的な値）
		ownerUserId: props.ownerUserId,
		identificationNumber: props.identificationNumber,
		earTagNumber: props.earTagNumber ?? null,
		name: name as CattleName | null,
		gender: props.gender ?? null,
		birthday: props.birthday ?? null,
		growthStage: props.growthStage ?? null,
		breed: breed as Breed | null,
		status: props.status ?? "HEALTHY", // デフォルトは健康状態
		producerName: producerName as ProducerName | null,
		barn: barn as Barn | null,
		breedingValue: breedingValue as BreedingValue | null,
		notes: notes as Notes | null,
		weight: props.weight as Weight | null,
		score: props.score as Score | null,
		createdAt: currentDate,
		updatedAt: currentDate,
		version: 1, // 初期バージョン
		alerts: {
			hasActiveAlerts: false,
			alertCount: 0,
			highestSeverity: null
		}
	});
}

/**
 * 牛エンティティの更新関数
 *
 * 既存の牛エンティティを更新し、ドメインルールに基づくバリデーションを実行します。
 * 以下の特徴を持ちます：
 *
 * - 不変性の維持: 元のエンティティは変更せず、新しいエンティティを返す
 * - 部分更新: 指定されたフィールドのみを更新
 * - バージョン管理: 楽観的ロック制御による並行性制御
 * - 年齢再計算: 誕生日が更新された場合の年齢情報の再計算
 *
 * @param current - 現在の牛エンティティ
 * @param updates - 更新するプロパティ
 * @param currentDate - 現在日時
 * @returns 更新結果（成功時は更新された牛エンティティ、失敗時はドメインエラー）
 */
export function updateCattle(
	current: Cattle,
	updates: UpdateCattleProps,
	currentDate: Date = new Date()
): Result<Cattle, CattleError> {
	// バリデーション
	const validationResult = validateUpdateInput(updates, currentDate);
	if (!validationResult.ok) return validationResult;

	// 文字列フィールドの検証と変換
	const name = validateAndTransformString(updates.name, "name");
	const breed = validateAndTransformString(updates.breed, "breed");
	const producerName = validateAndTransformString(
		updates.producerName,
		"producerName"
	);
	const barn = validateAndTransformString(updates.barn, "barn");
	const breedingValue = validateAndTransformString(
		updates.breedingValue,
		"breedingValue"
	);
	const notes = validateAndTransformString(updates.notes, "notes");

	// 更新された牛エンティティを作成
	return ok({
		...current,
		identificationNumber:
			updates.identificationNumber ?? current.identificationNumber,
		earTagNumber: updates.earTagNumber ?? current.earTagNumber,
		name: (name ?? current.name) as CattleName | null,
		gender: updates.gender ?? current.gender,
		birthday: updates.birthday ?? current.birthday,
		growthStage: updates.growthStage ?? current.growthStage,
		breed: (breed ?? current.breed) as Breed | null,
		status: updates.status ?? current.status,
		producerName: (producerName ?? current.producerName) as ProducerName | null,
		barn: (barn ?? current.barn) as Barn | null,
		breedingValue: (breedingValue ??
			current.breedingValue) as BreedingValue | null,
		notes: (notes ?? current.notes) as Notes | null,
		weight: (updates.weight ?? current.weight) as Weight | null,
		score: (updates.score ?? current.score) as Score | null,
		updatedAt: currentDate,
		version: current.version + 1 // バージョンをインクリメント
	});
}

/**
 * 更新入力のバリデーションを行うヘルパー関数
 */
function validateUpdateInput(
	updates: UpdateCattleProps,
	currentDate: Date
): Result<true, CattleError> {
	// 誕生日の検証（更新される場合）
	if (updates.birthday !== undefined) {
		const birthdayResult = validateBirthday(updates.birthday, currentDate);
		if (!birthdayResult.ok) return birthdayResult;
	}

	// 体重の検証（更新される場合）
	if (updates.weight !== undefined) {
		const weightResult = validateWeight(updates.weight);
		if (!weightResult.ok) return weightResult;
	}

	// 評価スコアの検証（更新される場合）
	if (updates.score !== undefined) {
		const scoreResult = validateScore(updates.score);
		if (!scoreResult.ok) return scoreResult;
	}

	// 個体識別番号の検証（更新される場合）
	if (updates.identificationNumber !== undefined) {
		if (updates.identificationNumber <= 0) {
			return err({
				type: "ValidationError",
				message: "個体識別番号は正の整数である必要があります",
				field: "identificationNumber"
			});
		}
	}

	return ok(true);
}
