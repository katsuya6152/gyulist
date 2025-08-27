/**
 * Registration Factory Functions
 *
 * 事前登録エンティティの作成・更新を行うファクトリー関数群
 * 純粋関数として実装され、ドメインルールに基づくバリデーションを提供
 */

import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import type { RegistrationError } from "../../errors/registration/RegistrationErrors";
import type {
	Email,
	LocaleValue,
	LocaleValueObject,
	NewRegistrationProps,
	ReferralSource,
	Registration,
	RegistrationId,
	RegistrationStatus,
	RegistrationStatusValue,
	Timestamp,
	UpdateRegistrationProps
} from "../../types/registration";

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * 事前登録エンティティのファクトリー関数
 *
 * 新規事前登録の作成を行い、ドメインルールに基づくバリデーションを実行します。
 *
 * @param props - 新規登録のプロパティ
 * @param id - 登録ID
 * @param currentTime - 現在時刻
 * @returns 成功時は作成された登録、失敗時はドメインエラー
 */
export function createRegistration(
	props: NewRegistrationProps,
	id: RegistrationId,
	currentTime: Timestamp
): Result<Registration, RegistrationError> {
	// バリデーション
	const validation = validateNewRegistrationProps(props);
	if (!validation.ok) return validation;

	// 登録作成
	const registration: Registration = {
		id,
		email: props.email,
		referralSource: props.referralSource,
		status: "pending",
		locale: props.locale,
		createdAt: currentTime,
		updatedAt: currentTime
	};

	return ok(registration);
}

/**
 * 事前登録更新ファクトリー関数
 *
 * 既存の事前登録を更新し、ドメインルールに基づくバリデーションを実行します。
 *
 * @param current - 現在の登録
 * @param updates - 更新データ
 * @param currentTime - 現在時刻
 * @returns 成功時は更新された登録、失敗時はドメインエラー
 */
export function updateRegistration(
	current: Registration,
	updates: UpdateRegistrationProps,
	currentTime: Timestamp
): Result<Registration, RegistrationError> {
	// ステータス変更のバリデーション
	if (updates.status && updates.status !== current.status) {
		const canChange = canChangeStatus(current.status, updates.status);
		if (!canChange) {
			return err({
				type: "StatusTransitionError",
				message: `ステータス ${current.status} から ${updates.status} への変更は許可されていません`,
				currentStatus: current.status,
				newStatus: updates.status
			});
		}
	}

	// 更新プロパティのバリデーション
	const validation = validateUpdateRegistrationProps(updates);
	if (!validation.ok) return validation;

	// 登録更新
	const updatedRegistration: Registration = {
		...current,
		...(updates.status !== undefined && { status: updates.status }),
		...(updates.referralSource !== undefined && {
			referralSource: updates.referralSource
		}),
		updatedAt: currentTime
	};

	return ok(updatedRegistration);
}

/**
 * 登録ステータス更新ファクトリー関数
 *
 * 登録のステータスのみを更新します。
 *
 * @param current - 現在の登録
 * @param newStatus - 新しいステータス
 * @param currentTime - 現在時刻
 * @returns 成功時は更新された登録、失敗時はドメインエラー
 */
export function updateRegistrationStatus(
	current: Registration,
	newStatus: RegistrationStatus,
	currentTime: Timestamp
): Result<Registration, RegistrationError> {
	return updateRegistration(current, { status: newStatus }, currentTime);
}

/**
 * 紹介元更新ファクトリー関数
 *
 * 登録の紹介元のみを更新します。
 *
 * @param current - 現在の登録
 * @param newReferralSource - 新しい紹介元
 * @param currentTime - 現在時刻
 * @returns 成功時は更新された登録、失敗時はドメインエラー
 */
export function updateReferralSource(
	current: Registration,
	newReferralSource: ReferralSource | null,
	currentTime: Timestamp
): Result<Registration, RegistrationError> {
	return updateRegistration(
		current,
		{ referralSource: newReferralSource },
		currentTime
	);
}

// ============================================================================
// Value Object Factory Functions
// ============================================================================

/**
 * 登録ステータス値オブジェクトのファクトリー関数
 *
 * ステータス値から値オブジェクトを生成します。
 * @param status - 登録ステータス
 * @returns 登録ステータス値オブジェクト
 */
export function createRegistrationStatusValue(
	status: RegistrationStatus
): RegistrationStatusValue {
	const statusMap: Record<
		RegistrationStatus,
		Omit<RegistrationStatusValue, "value">
	> = {
		pending: {
			displayName: "保留中",
			description: "登録申請中、確認待ち",
			isActive: false,
			isEditable: true
		},
		confirmed: {
			displayName: "確認済み",
			description: "登録確認済み、完了待ち",
			isActive: true,
			isEditable: true
		},
		completed: {
			displayName: "完了",
			description: "登録完了",
			isActive: true,
			isEditable: false
		},
		cancelled: {
			displayName: "キャンセル",
			description: "登録キャンセル",
			isActive: false,
			isEditable: false
		}
	};

	return {
		value: status,
		...statusMap[status]
	};
}

/**
 * ロケール値オブジェクトのファクトリー関数
 *
 * ロケール値から値オブジェクトを生成します。
 * @param locale - ロケール値
 * @returns ロケール値オブジェクト
 */
export function createLocaleValue(locale: LocaleValue): LocaleValueObject {
	const localeMap: Record<string, Omit<LocaleValueObject, "value">> = {
		ja: {
			displayName: "日本語",
			languageCode: "ja",
			countryCode: "JP"
		},
		en: {
			displayName: "English",
			languageCode: "en",
			countryCode: "US"
		}
	};

	const localeStr = locale as string;
	return {
		value: locale,
		...localeMap[localeStr]
	};
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * 新規登録プロパティのバリデーション
 */
function validateNewRegistrationProps(
	props: NewRegistrationProps
): Result<true, RegistrationError> {
	// メールアドレスチェック
	if (!props.email || (props.email as string).trim().length === 0) {
		return err({
			type: "ValidationError",
			message: "Email is required",
			field: "email"
		});
	}

	if (!isValidEmail(props.email as string)) {
		return err({
			type: "ValidationError",
			message: "Invalid email format",
			field: "email"
		});
	}

	if ((props.email as string).length > 254) {
		return err({
			type: "ValidationError",
			message: "Email address is too long",
			field: "email"
		});
	}

	// 紹介元チェック
	if (props.referralSource && (props.referralSource as string).length > 100) {
		return err({
			type: "ValidationError",
			message: "Referral source is too long",
			field: "referralSource"
		});
	}

	// ロケールチェック
	if (!["ja", "en"].includes(props.locale as string)) {
		return err({
			type: "ValidationError",
			message: "Invalid locale",
			field: "locale"
		});
	}

	return ok(true);
}

/**
 * 登録更新プロパティのバリデーション
 */
function validateUpdateRegistrationProps(
	updates: UpdateRegistrationProps
): Result<true, RegistrationError> {
	// 紹介元チェック
	if (
		updates.referralSource &&
		(updates.referralSource as string).length > 100
	) {
		return err({
			type: "ValidationError",
			message: "Referral source is too long",
			field: "referralSource"
		});
	}

	return ok(true);
}

// ============================================================================
// Business Rules
// ============================================================================

/**
 * 登録ステータスの変更が許可されているかチェック
 */
export function canChangeStatus(
	currentStatus: RegistrationStatus,
	newStatus: RegistrationStatus
): boolean {
	const statusTransitions: Record<RegistrationStatus, RegistrationStatus[]> = {
		pending: ["confirmed", "cancelled"],
		confirmed: ["completed", "cancelled"],
		completed: [], // 完了後は変更不可
		cancelled: [] // キャンセル後は変更不可
	};

	return statusTransitions[currentStatus].includes(newStatus);
}

/**
 * 登録が編集可能かチェック
 */
export function isRegistrationEditable(registration: Registration): boolean {
	const statusValue = createRegistrationStatusValue(registration.status);
	return statusValue.isEditable;
}

/**
 * 登録がアクティブかチェック
 */
export function isRegistrationActive(registration: Registration): boolean {
	const statusValue = createRegistrationStatusValue(registration.status);
	return statusValue.isActive;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * メールアドレスの形式チェック
 */
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * 登録ビジネスルール
 */
export const RegistrationRules = {
	/**
	 * 登録が編集可能かチェック
	 */
	isEditable: isRegistrationEditable,

	/**
	 * 登録がアクティブかチェック
	 */
	isActive: isRegistrationActive,

	/**
	 * ステータス変更が可能かチェック
	 */
	canChangeStatus,

	/**
	 * 登録が完了済みかチェック
	 */
	isCompleted(registration: Registration): boolean {
		return registration.status === "completed";
	},

	/**
	 * 登録がキャンセル済みかチェック
	 */
	isCancelled(registration: Registration): boolean {
		return registration.status === "cancelled";
	},

	/**
	 * 登録が保留中かチェック
	 */
	isPending(registration: Registration): boolean {
		return registration.status === "pending";
	},

	/**
	 * 登録が確認済みかチェック
	 */
	isConfirmed(registration: Registration): boolean {
		return registration.status === "confirmed";
	}
};
