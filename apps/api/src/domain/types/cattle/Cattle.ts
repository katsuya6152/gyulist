/**
 * 牛管理ドメイン - 牛エンティティの定義
 *
 * このファイルは、牛の個体管理における中心的なエンティティ（集約ルート）を定義しています。
 * 牛の基本情報、繁殖状態、健康状態などの属性を管理し、
 * ドメインルールに基づくバリデーションとビジネスロジックを提供します。
 */

import type { CattleId, UserId } from "../../../shared/brand";
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
} from "./CattleTypes";

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
export type Cattle = Readonly<{
	// 識別子（ID）
	cattleId: CattleId; // 牛の一意識別子
	ownerUserId: UserId; // 所有者（ユーザー）の識別子

	// 個体識別情報
	identificationNumber: IdentificationNumber; // 個体識別番号（農場内で一意）
	earTagNumber: EarTagNumber | null; // 耳標番号（オプション）

	// 基本情報
	name: CattleName | null; // 牛の名前（愛称）
	gender: Gender | null; // 性別
	birthday: Date | null; // 誕生日
	growthStage: GrowthStage | null; // 成長段階

	// 品種・血統情報
	breed: Breed | null; // 品種
	status: Status | null; // 現在の状態
	producerName: ProducerName | null; // 生産者名
	barn: Barn | null; // 牛舎

	// 繁殖・評価情報
	breedingValue: BreedingValue | null; // 育種価
	notes: Notes | null; // 備考・特記事項
	weight: Weight | null; // 体重（kg）
	score: Score | null; // 評価スコア（0-100）

	// システム管理情報
	createdAt: Date; // 作成日時
	updatedAt: Date; // 更新日時
	version: number; // バージョン（楽観的ロック制御用）

	// アラート情報
	alerts: Readonly<{
		hasActiveAlerts: boolean; // アクティブなアラートの有無
		alertCount: number; // アラート数
		highestSeverity: "high" | "medium" | "low" | null; // 最高重要度
	}>;
}>;

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
	name?: string | null; // 名前（文字列として受け取り、後でBrand型に変換）
	gender?: Gender | null; // 性別
	birthday?: Date | null; // 誕生日
	growthStage?: GrowthStage | null; // 成長段階
	breed?: string | null; // 品種（文字列として受け取り、後でBrand型に変換）
	status?: Status | null; // 状態
	producerName?: string | null; // 生産者名（文字列として受け取り、後でBrand型に変換）
	barn?: string | null; // 牛舎（文字列として受け取り、後でBrand型に変換）
	breedingValue?: string | null; // 育種価（文字列として受け取り、後でBrand型に変換）
	notes?: string | null; // 備考（文字列として受け取り、後でBrand型に変換）
	weight?: number | null; // 体重
	score?: number | null; // 評価スコア
};

/**
 * 牛の更新可能なプロパティ
 *
 * 牛の情報更新時に変更可能な項目を定義します。
 * IDや作成日時など、変更不可能な項目は除外されています。
 */
export type UpdateCattleProps = Partial<
	Omit<NewCattleProps, "ownerUserId" | "identificationNumber">
> & {
	identificationNumber?: IdentificationNumber; // 識別番号は特別な権限でのみ変更可能
};

/**
 * 牛の検索・フィルタリング条件
 *
 * 牛の一覧表示や検索機能で使用される条件を定義します。
 * 複数の条件を組み合わせた柔軟な検索が可能です。
 */
export type CattleSearchCriteria = {
	ownerUserId: UserId; // 所有者ID（必須）
	gender?: Gender; // 性別でフィルタ
	growthStage?: GrowthStage; // 成長段階でフィルタ
	status?: Status; // 状態でフィルタ
	hasAlert?: boolean; // アラートの有無でフィルタ
	search?: string; // 名前や識別番号での検索
	minWeight?: number; // 最小体重
	maxWeight?: number; // 最大体重
	minScore?: number; // 最小評価スコア
	maxScore?: number; // 最大評価スコア
	createdAfter?: Date; // 指定日以降に作成
	createdBefore?: Date; // 指定日以前に作成
};
