/**
 * Alert Database Mapper
 *
 * ドメインエンティティとデータベースレコード間の変換を行うマッパー
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { alerts as AlertsTable } from "../../../db/schema";
import type { Alert, NewAlertProps } from "../../../domain/types/alerts";
import type { AlertId } from "../../../domain/types/alerts/AlertTypes";
import type {
	AlertMessage,
	DueDate
} from "../../../domain/types/alerts/AlertTypes";
import type { CattleId, UserId } from "../../../shared/brand";

/**
 * データベース行の型定義（JOIN結果）
 */
export type AlertDbRow = Omit<
	InferSelectModel<typeof AlertsTable>,
	"cattleEarTagNumber"
> & {
	cattleName?: string | null;
	cattleEarTagNumber?: number | null;
};

/**
 * アラートデータベースマッパー
 */
export const alertDbMapper = {
	/**
	 * データベースレコードからドメインエンティティへの変換
	 */
	toDomain(row: AlertDbRow): Alert {
		// 日時文字列を安全にDateオブジェクトに変換
		const parseDate = (dateString: string | null): Date | null => {
			if (!dateString) return null;
			const date = new Date(dateString);
			return Number.isNaN(date.getTime()) ? null : date;
		};

		// UNIX timestampを安全にDateオブジェクトに変換
		const parseTimestamp = (timestamp: number | null): Date | null => {
			if (!timestamp) return null;
			return new Date(timestamp * 1000);
		};

		return {
			id: row.id as unknown as AlertId,
			type: row.type as Alert["type"],
			severity: row.severity as Alert["severity"],
			status: row.status as Alert["status"],
			cattleId: row.cattleId as unknown as CattleId,
			cattleName: row.cattleName || null,
			cattleEarTagNumber: row.cattleEarTagNumber || null,
			dueAt: parseDate(row.dueAt) as unknown as DueDate | null,
			message: row.message as unknown as AlertMessage,
			memo: row.memo,
			ownerUserId: row.ownerUserId as unknown as UserId,
			createdAt: parseTimestamp(row.createdAt) || new Date(),
			updatedAt: parseTimestamp(row.updatedAt) || new Date(),
			acknowledgedAt: parseTimestamp(row.acknowledgedAt),
			resolvedAt: parseTimestamp(row.resolvedAt)
		};
	},

	/**
	 * データベース行の配列からドメインエンティティ配列への変換
	 */
	toDomainList(rows: AlertDbRow[]): Alert[] {
		return rows.map(this.toDomain);
	},

	/**
	 * ドメインエンティティからデータベース挿入用レコードへの変換
	 */
	toInsertRecord(
		alert: Omit<Alert, "id" | "createdAt" | "updatedAt">
	): Omit<
		InferInsertModel<typeof AlertsTable>,
		"id" | "createdAt" | "updatedAt"
	> {
		return {
			type: alert.type,
			severity: alert.severity,
			status: alert.status,
			cattleId: alert.cattleId as number,
			dueAt: alert.dueAt ? alert.dueAt.toISOString() : null,
			message: alert.message as string,
			memo: alert.memo,
			ownerUserId: alert.ownerUserId as number,
			acknowledgedAt: alert.acknowledgedAt
				? Math.floor(alert.acknowledgedAt.getTime() / 1000)
				: null,
			resolvedAt: alert.resolvedAt
				? Math.floor(alert.resolvedAt.getTime() / 1000)
				: null
		};
	},

	/**
	 * 新規アラートプロパティからデータベース挿入用レコードへの変換
	 */
	fromNewAlertProps(
		props: NewAlertProps
	): Omit<
		InferInsertModel<typeof AlertsTable>,
		"id" | "createdAt" | "updatedAt"
	> {
		return {
			type: props.type,
			severity: props.severity,
			status: "active",
			cattleId: props.cattleId as number,
			dueAt: props.dueAt ? props.dueAt.toISOString() : null,
			message: props.message,
			memo: props.memo || null,
			ownerUserId: props.ownerUserId as number,
			acknowledgedAt: null,
			resolvedAt: null
		};
	},

	/**
	 * 更新用の部分的なレコードへの変換
	 */
	toUpdateRecord(
		updates: Partial<Alert>
	): Partial<InferInsertModel<typeof AlertsTable>> {
		const record: Partial<InferInsertModel<typeof AlertsTable>> = {};

		if (updates.type !== undefined) {
			record.type = updates.type;
		}
		if (updates.severity !== undefined) {
			record.severity = updates.severity;
		}
		if (updates.status !== undefined) {
			record.status = updates.status;
		}
		if (updates.dueAt !== undefined) {
			record.dueAt = updates.dueAt ? updates.dueAt.toISOString() : null;
		}
		if (updates.message !== undefined) {
			record.message = updates.message as string;
		}
		if (updates.memo !== undefined) {
			record.memo = updates.memo;
		}
		if (updates.acknowledgedAt !== undefined) {
			record.acknowledgedAt = updates.acknowledgedAt
				? Math.floor(updates.acknowledgedAt.getTime() / 1000)
				: null;
		}
		if (updates.resolvedAt !== undefined) {
			record.resolvedAt = updates.resolvedAt
				? Math.floor(updates.resolvedAt.getTime() / 1000)
				: null;
		}
		if (updates.updatedAt !== undefined) {
			record.updatedAt = Math.floor(updates.updatedAt.getTime() / 1000);
		}

		return record;
	}
};
