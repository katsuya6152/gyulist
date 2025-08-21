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

	// 計算フィールド（誕生日から自動計算）
	readonly age: number | null; // 年齢（満何歳）
	readonly monthsOld: number | null; // 月齢
	readonly daysOld: number | null; // 日齢

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

	// 年齢関連の計算フィールドを算出
	const ageValues = props.birthday
		? calculateAge(props.birthday, currentDate)
		: {
				age: null,
				monthsOld: null,
				daysOld: null
			};

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
		age: ageValues.age,
		monthsOld: ageValues.monthsOld,
		daysOld: ageValues.daysOld,
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

	// 誕生日が更新された場合の年齢情報の再計算
	const birthday =
		updates.birthday !== undefined ? updates.birthday : current.birthday;
	const ageValues = birthday
		? calculateAge(birthday, currentDate)
		: {
				age: current.age,
				monthsOld: current.monthsOld,
				daysOld: current.daysOld
			};

	// 文字列フィールドの変換
	const name =
		updates.name !== undefined
			? (validateAndTransformString(updates.name, "name") as CattleName | null)
			: current.name;
	const breed =
		updates.breed !== undefined
			? (validateAndTransformString(updates.breed, "breed") as Breed | null)
			: current.breed;
	const producerName =
		updates.producerName !== undefined
			? (validateAndTransformString(
					updates.producerName,
					"producerName"
				) as ProducerName | null)
			: current.producerName;
	const barn =
		updates.barn !== undefined
			? (validateAndTransformString(updates.barn, "barn") as Barn | null)
			: current.barn;
	const breedingValue =
		updates.breedingValue !== undefined
			? (validateAndTransformString(
					updates.breedingValue,
					"breedingValue"
				) as BreedingValue | null)
			: current.breedingValue;
	const notes =
		updates.notes !== undefined
			? (validateAndTransformString(updates.notes, "notes") as Notes | null)
			: current.notes;

	// 更新された牛エンティティの作成
	return ok({
		...current,
		identificationNumber:
			updates.identificationNumber ?? current.identificationNumber,
		earTagNumber:
			updates.earTagNumber !== undefined
				? updates.earTagNumber
				: current.earTagNumber,
		name,
		gender: updates.gender !== undefined ? updates.gender : current.gender,
		birthday,
		growthStage:
			updates.growthStage !== undefined
				? updates.growthStage
				: current.growthStage,
		age: ageValues.age,
		monthsOld: ageValues.monthsOld,
		daysOld: ageValues.daysOld,
		breed,
		status: updates.status !== undefined ? updates.status : current.status,
		producerName,
		barn,
		breedingValue,
		notes,
		weight:
			updates.weight !== undefined
				? (updates.weight as Weight | null)
				: current.weight,
		score:
			updates.score !== undefined
				? (updates.score as Score | null)
				: current.score,
		updatedAt: currentDate,
		version: current.version + 1 // バージョンをインクリメント
	});
}

/**
 * 誕生日から年齢を計算するヘルパー関数
 *
 * 純粋関数として実装され、誕生日と現在日時から年齢情報を算出します。
 * 以下の情報を提供します：
 *
 * - age: 満年齢（年）
 * - monthsOld: 月齢
 * - daysOld: 日齢
 *
 * @param birthday - 誕生日
 * @param currentDate - 現在日時
 * @returns 年齢情報オブジェクト
 */
function calculateAge(
	birthday: Date,
	currentDate: Date
): {
	age: number;
	monthsOld: number;
	daysOld: number;
} {
	const diffMs = currentDate.getTime() - birthday.getTime();
	return {
		age: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)), // 年齢（365日で割算）
		monthsOld: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)), // 月齢（30日で割算）
		daysOld: Math.floor(diffMs / (1000 * 60 * 60 * 24)) // 日齢（24時間で割算）
	};
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

/**
 * 牛が繁殖可能年齢かどうかを判定する純粋関数
 *
 * 性別と年齢に基づいて繁殖可能かどうかを判定します。
 * 以下のルールに従います：
 *
 * - 雄: 1歳以上で繁殖可能
 * - 去勢: 繁殖不可（肉質向上や行動制御が目的）
 * - 雌: 2歳以上で繁殖可能
 *
 * @param cattle - 判定対象の牛エンティティ
 * @returns 繁殖可能年齢の場合true、そうでない場合false
 */
export function isBreedingAge(cattle: Cattle): boolean {
	if (!cattle.age || !cattle.gender) return false;
	if (cattle.gender === "去勢") return false; // 去勢牛は繁殖不可
	if (cattle.gender === "雄") return cattle.age >= 1;
	return cattle.age >= 2; // 雌は通常2歳から繁殖可能
}

/**
 * 牛のライフステージを判定する純粋関数
 *
 * 年齢に基づいて牛のライフステージを判定します。
 * 各ステージで異なる管理方針が適用されます。
 *
 * @param cattle - 判定対象の牛エンティティ
 * @returns ライフステージ（Calf, Young, Adult, Senior, Unknown）
 */
export function getCattleLifeStage(
	cattle: Cattle
): "Calf" | "Young" | "Adult" | "Senior" | "Unknown" {
	if (!cattle.age) return "Unknown";

	if (cattle.age < 1) return "Calf"; // 子牛期（0-1歳）
	if (cattle.age < 3) return "Young"; // 若年期（1-3歳）
	if (cattle.age < 10) return "Adult"; // 成牛期（3-10歳）
	return "Senior"; // 高齢期（10歳以上）
}

/**
 * 牛が健康診断を必要とするかどうかを判定する純粋関数
 *
 * 最後の健康診断日と現在日時から、次回の健康診断が必要かどうかを判定します。
 * ライフステージに応じて異なる間隔を適用します。
 *
 * @param cattle - 判定対象の牛エンティティ
 * @param lastCheckupDate - 最後の健康診断日
 * @param currentDate - 現在日時
 * @returns 健康診断が必要な場合true、そうでない場合false
 */
export function needsHealthCheckup(
	cattle: Cattle,
	lastCheckupDate: Date | null,
	currentDate: Date
): boolean {
	if (!lastCheckupDate) return true; // 初回の場合は健康診断が必要

	const daysSinceCheckup = Math.floor(
		(currentDate.getTime() - lastCheckupDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	// ライフステージに応じた健康診断間隔
	const lifeStage = getCattleLifeStage(cattle);
	switch (lifeStage) {
		case "Calf":
			return daysSinceCheckup > 30; // 子牛期：月1回
		case "Young":
			return daysSinceCheckup > 90; // 若年期：3ヶ月に1回
		case "Adult":
			return daysSinceCheckup > 180; // 成牛期：6ヶ月に1回
		case "Senior":
			return daysSinceCheckup > 90; // 高齢期：3ヶ月に1回（若年期と同様）
		default:
			return daysSinceCheckup > 180; // デフォルト：6ヶ月に1回
	}
}
