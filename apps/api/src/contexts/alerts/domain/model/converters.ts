import type {
	AlertId,
	AlertMessage,
	AlertSeverity,
	AlertStatus,
	AlertType,
	CattleId,
	CattleName,
	DueDate,
	EarTagNumber,
	Timestamp,
	UserId
} from "./types";

// ============================================================================
// 文字列からドメイン型への変換
// ============================================================================

/**
 * 文字列をAlertIdに変換
 */
export function toAlertId(id: string): AlertId {
	return id as AlertId;
}

/**
 * 数値をCattleIdに変換
 */
export function toCattleId(id: number): CattleId {
	return id as CattleId;
}

/**
 * 数値をUserIdに変換
 */
export function toUserId(id: number): UserId {
	return id as UserId;
}

/**
 * 文字列をAlertMessageに変換
 */
export function toAlertMessage(message: string): AlertMessage {
	return message as AlertMessage;
}

/**
 * 文字列をCattleNameに変換
 */
export function toCattleName(name: string | null): CattleName | null {
	return name as CattleName | null;
}

/**
 * 文字列をEarTagNumberに変換
 */
export function toEarTagNumber(number: string | null): EarTagNumber | null {
	return number as EarTagNumber | null;
}

/**
 * 文字列をDueDateに変換
 */
export function toDueDate(date: string | null): DueDate | null {
	return date as DueDate | null;
}

/**
 * 数値をTimestampに変換
 */
export function toTimestamp(timestamp: number): Timestamp {
	return timestamp as Timestamp;
}

/**
 * 文字列をAlertTypeに変換
 */
export function toAlertType(type: string): AlertType {
	return type as AlertType;
}

/**
 * 文字列をAlertSeverityに変換
 */
export function toAlertSeverity(severity: string): AlertSeverity {
	return severity as AlertSeverity;
}

/**
 * 文字列をAlertStatusに変換
 */
export function toAlertStatus(status: string): AlertStatus {
	return status as AlertStatus;
}

// ============================================================================
// ドメイン型から文字列への変換
// ============================================================================

/**
 * AlertIdを文字列に変換
 */
export function fromAlertId(id: AlertId): string {
	return id;
}

/**
 * CattleIdを数値に変換
 */
export function fromCattleId(id: CattleId): number {
	return id;
}

/**
 * UserIdを数値に変換
 */
export function fromUserId(id: UserId): number {
	return id;
}

/**
 * AlertMessageを文字列に変換
 */
export function fromAlertMessage(message: AlertMessage): string {
	return message;
}

/**
 * CattleNameを文字列に変換
 */
export function fromCattleName(name: CattleName | null): string | null {
	return name;
}

/**
 * EarTagNumberを文字列に変換
 */
export function fromEarTagNumber(number: EarTagNumber | null): string | null {
	return number;
}

/**
 * DueDateを文字列に変換
 */
export function fromDueDate(date: DueDate | null): string | null {
	return date;
}

/**
 * Timestampを数値に変換
 */
export function fromTimestamp(timestamp: Timestamp): number {
	return timestamp;
}

/**
 * AlertTypeを文字列に変換
 */
export function fromAlertType(type: AlertType): string {
	return type;
}

/**
 * AlertSeverityを文字列に変換
 */
export function fromAlertSeverity(severity: AlertSeverity): string {
	return severity;
}

/**
 * AlertStatusを文字列に変換
 */
export function fromAlertStatus(status: AlertStatus): string {
	return status;
}
