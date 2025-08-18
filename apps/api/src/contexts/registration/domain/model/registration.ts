import type { Brand } from "../../../../shared/brand";
import type {
	Email,
	LocaleValue,
	ReferralSource,
	RegistrationId,
	RegistrationStatus,
	Timestamp
} from "./types";

// ============================================================================
// 値オブジェクト
// ============================================================================

/**
 * 登録ステータス値オブジェクト
 */
export type RegistrationStatusValue = {
	readonly value: RegistrationStatus;
	readonly displayName: string;
	readonly description: string;
	readonly isActive: boolean;
	readonly isEditable: boolean;
};

/**
 * 登録ステータスのファクトリ関数
 */
export function createRegistrationStatus(
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
 * ロケール値オブジェクト
 */
export type LocaleValueObject = {
	readonly value: LocaleValue;
	readonly displayName: string;
	readonly languageCode: string;
	readonly countryCode?: string;
};

/**
 * ロケールのファクトリ関数
 */
export function createLocale(locale: LocaleValue): LocaleValueObject {
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
// Registrationエンティティ
// ============================================================================

/**
 * 新規登録作成用のプロパティ
 */
export type NewRegistrationProps = {
	readonly email: Email;
	readonly referralSource: ReferralSource | null;
	readonly locale: LocaleValue;
};

/**
 * Registrationエンティティ
 */
export type Registration = {
	readonly id: RegistrationId;
	readonly email: Email;
	readonly referralSource: ReferralSource | null;
	readonly status: RegistrationStatus;
	readonly locale: LocaleValue;
	readonly createdAt: Timestamp;
	readonly updatedAt: Timestamp;
};

/**
 * Registrationエンティティのファクトリ関数
 */
export function createRegistration(
	props: NewRegistrationProps,
	id: RegistrationId,
	currentTime: Timestamp
): Registration {
	return {
		id,
		email: props.email,
		referralSource: props.referralSource,
		status: "pending",
		locale: props.locale,
		createdAt: currentTime,
		updatedAt: currentTime
	};
}

/**
 * Registrationエンティティの更新
 */
export function updateRegistration(
	registration: Registration,
	updates: Partial<Pick<Registration, "status" | "referralSource">>,
	currentTime: Timestamp
): Registration {
	return {
		...registration,
		...updates,
		updatedAt: currentTime
	};
}

/**
 * Registrationエンティティのステータス更新
 */
export function updateRegistrationStatus(
	registration: Registration,
	newStatus: RegistrationStatus,
	currentTime: Timestamp
): Registration {
	return updateRegistration(registration, { status: newStatus }, currentTime);
}

/**
 * Registrationエンティティの紹介元更新
 */
export function updateReferralSource(
	registration: Registration,
	newReferralSource: ReferralSource | null,
	currentTime: Timestamp
): Registration {
	return updateRegistration(
		registration,
		{ referralSource: newReferralSource },
		currentTime
	);
}

// ============================================================================
// ドメインルール
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
	const statusValue = createRegistrationStatus(registration.status);
	return statusValue.isEditable;
}

/**
 * 登録がアクティブかチェック
 */
export function isRegistrationActive(registration: Registration): boolean {
	const statusValue = createRegistrationStatus(registration.status);
	return statusValue.isActive;
}
