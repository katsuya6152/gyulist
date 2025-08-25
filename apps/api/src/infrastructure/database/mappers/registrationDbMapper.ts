/**
 * Registration Database Mappers
 *
 * 事前登録ドメインのデータベースマッピング関数群
 */

import type {
	Email,
	EmailLog,
	EmailLogId,
	EmailType,
	ErrorMessage,
	HttpStatus,
	LocaleValue,
	ReferralSource,
	Registration,
	RegistrationId,
	RegistrationStatus,
	ResendId,
	Timestamp
} from "../../../domain/types/registration";

// ============================================================================
// Raw Database Types
// ============================================================================

export type RawRegistrationRecord = {
	readonly id: string;
	readonly email: string;
	readonly referralSource: string | null;
	readonly status: string;
	readonly locale: string;
	readonly createdAt: number;
	readonly updatedAt: number;
};

export type RawEmailLogRecord = {
	readonly id: string;
	readonly email: string;
	readonly type: string;
	readonly httpStatus?: number;
	readonly resendId?: string | null;
	readonly error?: string | null;
	readonly createdAt: number;
};

// ============================================================================
// Database to Domain Mapping
// ============================================================================

/**
 * データベース行からドメインRegistrationモデルに変換
 *
 * @param row - データベース行
 * @returns ドメインRegistrationエンティティ
 */
export function mapRawRegistrationToRegistration(
	row: RawRegistrationRecord
): Registration {
	return {
		id: row.id as RegistrationId,
		email: row.email as Email,
		referralSource: row.referralSource
			? (row.referralSource as ReferralSource)
			: null,
		status: row.status as RegistrationStatus,
		locale: row.locale as LocaleValue,
		createdAt: row.createdAt as Timestamp,
		updatedAt: row.updatedAt as Timestamp
	};
}

/**
 * データベース行の配列からドメインRegistrationモデルの配列に変換
 *
 * @param rows - データベース行の配列
 * @returns ドメインRegistrationエンティティの配列
 */
export function mapRawRegistrationsToRegistrations(
	rows: RawRegistrationRecord[]
): Registration[] {
	return rows.map(mapRawRegistrationToRegistration);
}

/**
 * データベース行からドメインEmailLogモデルに変換
 *
 * @param row - データベース行
 * @returns ドメインEmailLogエンティティ
 */
export function mapRawEmailLogToEmailLog(row: RawEmailLogRecord): EmailLog {
	return {
		id: row.id as EmailLogId,
		email: row.email as Email,
		type: row.type as EmailType,
		httpStatus: row.httpStatus as HttpStatus,
		resendId: row.resendId ? (row.resendId as ResendId) : null,
		error: row.error ? (row.error as ErrorMessage) : null,
		createdAt: row.createdAt as Timestamp
	};
}

/**
 * データベース行の配列からドメインEmailLogモデルの配列に変換
 *
 * @param rows - データベース行の配列
 * @returns ドメインEmailLogエンティティの配列
 */
export function mapRawEmailLogsToEmailLogs(
	rows: RawEmailLogRecord[]
): EmailLog[] {
	return rows.map(mapRawEmailLogToEmailLog);
}

// ============================================================================
// Domain to Database Mapping
// ============================================================================

/**
 * ドメインRegistrationからデータベース挿入用オブジェクトに変換
 *
 * @param registration - ドメインRegistrationエンティティ
 * @returns データベース挿入用オブジェクト
 */
export function mapRegistrationToDbInsert(
	registration: Registration
): RawRegistrationRecord {
	return {
		id: registration.id as string,
		email: registration.email as string,
		referralSource: registration.referralSource as string | null,
		status: registration.status,
		locale: registration.locale as string,
		createdAt: registration.createdAt as number,
		updatedAt: registration.updatedAt as number
	};
}

/**
 * ステータス更新用のデータベース更新オブジェクトに変換
 *
 * @param status - 新しいステータス
 * @param updateTime - 更新時刻
 * @returns データベース更新用オブジェクト
 */
export function mapStatusUpdateToDbUpdate(
	status: RegistrationStatus,
	updateTime: Timestamp
): Partial<RawRegistrationRecord> {
	return {
		status,
		updatedAt: updateTime as number
	};
}

/**
 * 紹介元更新用のデータベース更新オブジェクトに変換
 *
 * @param referralSource - 新しい紹介元
 * @param updateTime - 更新時刻
 * @returns データベース更新用オブジェクト
 */
export function mapReferralSourceUpdateToDbUpdate(
	referralSource: ReferralSource | null,
	updateTime: Timestamp
): Partial<RawRegistrationRecord> {
	return {
		referralSource: referralSource as string | null,
		updatedAt: updateTime as number
	};
}

/**
 * ドメインEmailLogからデータベース挿入用オブジェクトに変換
 *
 * @param emailLog - ドメインEmailLogエンティティ
 * @returns データベース挿入用オブジェクト
 */
export function mapEmailLogToDbInsert(emailLog: EmailLog): RawEmailLogRecord {
	return {
		id: emailLog.id as string,
		email: emailLog.email as string,
		type: emailLog.type,
		httpStatus: emailLog.httpStatus,
		resendId: emailLog.resendId as string | null,
		error: emailLog.error as string | null,
		createdAt: emailLog.createdAt as number
	};
}
