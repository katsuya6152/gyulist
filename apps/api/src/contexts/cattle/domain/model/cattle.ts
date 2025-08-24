/**
 * 牛管理ドメイン - 牛エンティティの定義
 *
 * このファイルは、牛の個体管理における中心的なエンティティ（集約ルート）を定義しています。
 * 牛の基本情報、繁殖状態、健康状態などの属性を管理し、
 * ドメインルールに基づくバリデーションとビジネスロジックを提供します。
 */

import type { CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type {
	Barn,
	Breed,
	BreedingValue,
	CattleName,
	EarTagNumber,
	Gender,
	GrowthStage,
	IdentificationNumber,
	Notes,
	ProducerName,
	Score,
	Status,
	Weight
} from "./types";

/**
 * 牛エンティティ（集約ルート）
 *
 * 牛の個体管理における中心的なエンティティです。
 * 以下の特徴を持ちます：
 *
 * - 不変性（Immutability）: すべてのプロパティがreadonly
 * - 集約ルート: 牛に関連する他のエンティティの境界を管理
 * - ドメインルール: ビジネスルールに基づくバリデーション
 * - 楽観的ロック制御: versionフィールドによる並行性制御
 */
export type Cattle = {
	// 識別子（ID）
	readonly cattleId: CattleId; // 牛の一意識別子
	readonly ownerUserId: UserId; // 所有者（ユーザー）の識別子

	// 個体識別情報
	readonly identificationNumber: IdentificationNumber; // 個体識別番号（農場内で一意）
	readonly earTagNumber: EarTagNumber | null; // 耳標番号（オプション）

	// 基本情報
	readonly name: CattleName | null; // 牛の名前（愛称）
	readonly gender: Gender | null; // 性別
	readonly birthday: Date | null; // 誕生日
	readonly growthStage: GrowthStage | null; // 成長段階

	// 品種・血統情報
	readonly breed: Breed | null; // 品種
	readonly status: Status | null; // 現在の状態
	readonly producerName: ProducerName | null; // 生産者名
	readonly barn: Barn | null; // 牛舎

	// 繁殖・評価情報
	readonly breedingValue: BreedingValue | null; // 育種価
	readonly notes: Notes | null; // 備考・特記事項
	readonly weight: Weight | null; // 体重（kg）
	readonly score: Score | null; // 評価スコア（0-100）

	// システム管理情報
	readonly createdAt: Date; // 作成日時
	readonly updatedAt: Date; // 更新日時
	readonly version: number; // バージョン（楽観的ロック制御用）

	// アラート情報
	readonly alerts: {
		readonly hasActiveAlerts: boolean; // アクティブなアラートの有無
		readonly alertCount: number; // アラート数
		readonly highestSeverity: "high" | "medium" | "low" | null; // 最高重要度
	};
};

/**
 * 新規牛作成時のプロパティ
 *
 * 牛の新規登録時に必要な情報を定義します。
 * 必須項目とオプション項目を明確に分離し、
 * ドメインルールに基づくバリデーションを提供します。
 */
export type NewCattleProps = {
	// 必須項目
	ownerUserId: UserId; // 所有者ID（必須）
	identificationNumber: IdentificationNumber; // 個体識別番号（必須）

	// オプション項目
	earTagNumber?: EarTagNumber | null; // 耳標番号
	name?: string | null; // 名前
	gender?: Gender | null; // 性別
	birthday?: Date | null; // 誕生日
	growthStage?: GrowthStage | null; // 成長段階
	breed?: string | null; // 品種
	status?: Status | null; // 状態
	producerName?: string | null; // 生産者名
	barn?: string | null; // 牛舎
	breedingValue?: string | null; // 育種価
	notes?: string | null; // 備考
	weight?: number | null; // 体重
	score?: number | null; // 評価スコア
};

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
): Result<Cattle, DomainError> {
	// ドメインルール1: 個体識別番号は正の整数である必要がある
	if (props.identificationNumber <= 0) {
		return err({
			type: "ValidationError",
			message: "個体識別番号は正の整数である必要があります",
			field: "identificationNumber"
		});
	}

	// ドメインルール2: 誕生日は未来の日付ではない
	if (props.birthday && props.birthday > currentDate) {
		return err({
			type: "ValidationError",
			message: "誕生日は未来の日付ではありません",
			field: "birthday"
		});
	}

	// ドメインルール3: 体重は正の値である必要がある（提供された場合）
	if (
		props.weight !== null &&
		props.weight !== undefined &&
		props.weight <= 0
	) {
		return err({
			type: "ValidationError",
			message: "体重は正の値である必要があります",
			field: "weight"
		});
	}

	// ドメインルール4: 評価スコアは0-100の範囲内である必要がある（提供された場合）
	if (props.score !== null && props.score !== undefined) {
		if (props.score < 0 || props.score > 100) {
			return err({
				type: "ValidationError",
				message: "評価スコアは0-100の範囲内である必要があります",
				field: "score"
			});
		}
	}

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
	updates: Partial<NewCattleProps>,
	currentDate: Date = new Date()
): Result<Cattle, DomainError> {
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
	updates: Partial<NewCattleProps>,
	currentDate: Date
): Result<true, DomainError> {
	// 誕生日の更新時の検証
	if (updates.birthday && updates.birthday > currentDate) {
		return err({
			type: "ValidationError",
			message: "誕生日は未来の日付ではありません",
			field: "birthday"
		});
	}

	// 体重の更新時の検証
	if (
		updates.weight !== undefined &&
		updates.weight !== null &&
		updates.weight <= 0
	) {
		return err({
			type: "ValidationError",
			message: "体重は正の値である必要があります",
			field: "weight"
		});
	}

	// 評価スコアの更新時の検証
	if (updates.score !== undefined && updates.score !== null) {
		if (updates.score < 0 || updates.score > 100) {
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
 * 文字列フィールドの検証と変換を行うヘルパー関数
 *
 * 入力された文字列を検証し、適切な形式に変換します。
 * 以下の処理を行います：
 *
 * - 空文字列のnull変換
 * - 前後の空白文字の除去
 * - 型チェック
 *
 * @param value - 検証対象の値
 * @param fieldName - フィールド名（エラーメッセージ用）
 * @returns 変換後の値（nullまたはトリム済み文字列）
 * @throws 型が文字列でない場合のエラー
 */
function validateAndTransformString(
	value: string | null | undefined,
	fieldName: string
): string | null {
	if (value === undefined || value === null) return null;
	if (typeof value !== "string") {
		throw new Error(`${fieldName}は文字列である必要があります`);
	}
	const trimmed = value.trim();
	return trimmed === "" ? null : trimmed; // 空文字列はnullに変換
}
