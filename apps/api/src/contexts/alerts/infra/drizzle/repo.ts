import { and, eq } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { alertHistory } from "../../../../db/tables/alertHistory";
import { alerts } from "../../../../db/tables/alerts";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AlertsDomainError } from "../../domain/errors";
import type {
	Alert,
	AlertHistory,
	AlertId,
	AlertSeverity,
	AlertStatus,
	AlertType,
	Timestamp,
	UserId
} from "../../domain/model";
import type { CattleId } from "../../domain/model";
import {
	toAlertMessage,
	toCattleId,
	toCattleName,
	toDueDate,
	toEarTagNumber,
	toTimestamp,
	toUserId
} from "../../domain/model/converters";
import type { AlertsRepoPort, RawAlertRow } from "../../ports";

class DrizzleAlertsRepo implements AlertsRepoPort {
	constructor(private db: AnyD1Database) {}

	async findOpenDaysOver60NoAI(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        WITH last_calving AS (
          SELECT cattleId, MAX(eventDatetime) AS lastCalving
          FROM events
          WHERE eventType = 'CALVING'
          GROUP BY cattleId
        )
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber, lc.lastCalving as dueAt
        FROM cattle c
        JOIN last_calving lc ON lc.cattleId = c.cattleId
        LEFT JOIN breeding_status bs ON bs.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND (c.status IS NULL OR c.status != 'PREGNANT')
          AND (julianday(?) - julianday(lc.lastCalving)) >= 60
          AND NOT EXISTS (
            SELECT 1 FROM events e
            WHERE e.cattleId = c.cattleId
              AND e.eventType = 'INSEMINATION'
              AND julianday(e.eventDatetime) > julianday(lc.lastCalving)
          )
          AND (bs.expectedCalvingDate IS NULL OR julianday(bs.expectedCalvingDate) <= julianday(lc.lastCalving))
      `)
			.bind(ownerUserId, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}

	async findCalvingWithin60(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber,
               bs.expectedCalvingDate as dueAt
        FROM cattle c
        JOIN breeding_status bs ON bs.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND bs.expectedCalvingDate IS NOT NULL
          AND julianday(bs.expectedCalvingDate) >= julianday(?)
          AND julianday(bs.expectedCalvingDate) <= julianday(?, '+60 days')
      `)
			.bind(ownerUserId, nowIso, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}

	async findCalvingOverdue(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber,
               bs.expectedCalvingDate as dueAt
        FROM cattle c
        JOIN breeding_status bs ON bs.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND bs.expectedCalvingDate IS NOT NULL
          AND julianday(bs.expectedCalvingDate) < julianday(?)
          AND (c.status IS NULL OR c.status != 'RESTING')
      `)
			.bind(ownerUserId, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}

	async findEstrusOver20NotPregnant(
		ownerUserId: number,
		nowIso: string = new Date().toISOString()
	): Promise<RawAlertRow[]> {
		const stmt = this.db
			.prepare(`
        WITH last_estrus AS (
          SELECT cattleId, MAX(eventDatetime) AS lastEstrus
          FROM events
          WHERE eventType = 'ESTRUS'
          GROUP BY cattleId
        )
        SELECT c.cattleId as cattleId, c.name as cattleName, CAST(c.earTagNumber AS TEXT) as cattleEarTagNumber, le.lastEstrus as dueAt
        FROM cattle c
        JOIN last_estrus le ON le.cattleId = c.cattleId
        WHERE c.ownerUserId = ?
          AND (c.status IS NULL OR c.status != 'PREGNANT')
          AND (julianday(?) - julianday(le.lastEstrus)) >= 20
      `)
			.bind(ownerUserId, nowIso);
		return (await stmt.all<RawAlertRow>()).results ?? [];
	}

	// 新規追加メソッドの実装
	async findActiveAlertsByUserId(userId: number): Promise<Alert[]> {
		try {
			const rows = await this.db
				.prepare(`
					SELECT id, type, severity, status, cattle_id, cattle_name, 
						   cattle_ear_tag_number, due_at, message, memo, owner_user_id, 
						   created_at, updated_at, acknowledged_at, resolved_at
					FROM alerts 
					WHERE owner_user_id = ? AND status IN ('active', 'acknowledged')
					ORDER BY severity DESC, created_at DESC
				`)
				.bind(userId)
				.all<{
					id: string;
					type: string;
					severity: string;
					status: string;
					cattle_id: number;
					cattle_name: string | null;
					cattle_ear_tag_number: string | null;
					due_at: string | null;
					message: string;
					memo: string | null;
					owner_user_id: number;
					created_at: number;
					updated_at: number;
					acknowledged_at: number | null;
					resolved_at: number | null;
				}>();

			return rows.results.map((row: (typeof rows.results)[0]) => ({
				id: row.id as AlertId,
				type: row.type as AlertType,
				severity: row.severity as AlertSeverity,
				status: row.status as AlertStatus,
				cattleId: toCattleId(row.cattle_id),
				cattleName: toCattleName(row.cattle_name),
				cattleEarTagNumber: toEarTagNumber(row.cattle_ear_tag_number),
				dueAt: toDueDate(row.due_at),
				message: toAlertMessage(row.message),
				memo: row.memo ?? null,
				ownerUserId: toUserId(row.owner_user_id),
				createdAt: toTimestamp(row.created_at),
				updatedAt: toTimestamp(row.updated_at),
				acknowledgedAt: row.acknowledged_at
					? toTimestamp(row.acknowledged_at)
					: null,
				resolvedAt: row.resolved_at ? toTimestamp(row.resolved_at) : null
			}));
		} catch (error) {
			console.error("Failed to find active alerts:", error);
			return [];
		}
	}

	async findAlertById(alertId: AlertId): Promise<Alert | null> {
		try {
			const rows = await this.db
				.prepare(`
					SELECT id, type, severity, status, cattle_id, cattle_name, 
						   cattle_ear_tag_number, due_at, message, memo, owner_user_id, 
						   created_at, updated_at, acknowledged_at, resolved_at
					FROM alerts 
					WHERE id = ?
				`)
				.bind(alertId)
				.all<{
					id: string;
					type: string;
					severity: string;
					status: string;
					cattle_id: number;
					cattle_name: string | null;
					cattle_ear_tag_number: string | null;
					due_at: string | null;
					message: string;
					memo: string | null;
					owner_user_id: number;
					created_at: number;
					updated_at: number;
					acknowledged_at: number | null;
					resolved_at: number | null;
				}>();

			if (rows.results.length === 0) {
				return null;
			}

			const row = rows.results[0];
			return {
				id: row.id as AlertId,
				type: row.type as AlertType,
				severity: row.severity as AlertSeverity,
				status: row.status as AlertStatus,
				cattleId: toCattleId(row.cattle_id),
				cattleName: toCattleName(row.cattle_name),
				cattleEarTagNumber: toEarTagNumber(row.cattle_ear_tag_number),
				dueAt: toDueDate(row.due_at),
				message: toAlertMessage(row.message),
				memo: row.memo ?? null,
				ownerUserId: toUserId(row.owner_user_id),
				createdAt: toTimestamp(row.created_at),
				updatedAt: toTimestamp(row.updated_at),
				acknowledgedAt: row.acknowledged_at
					? toTimestamp(row.acknowledged_at)
					: null,
				resolvedAt: row.resolved_at ? toTimestamp(row.resolved_at) : null
			};
		} catch (error) {
			console.error("Failed to find alert by ID:", error);
			return null;
		}
	}

	async updateAlertStatus(
		alertId: AlertId,
		newStatus: AlertStatus,
		currentTime: Timestamp
	): Promise<Result<Alert, AlertsDomainError>> {
		try {
			const updateFields: {
				status: AlertStatus;
				updated_at: Timestamp;
				acknowledged_at?: Timestamp;
				resolved_at?: Timestamp;
			} = {
				status: newStatus,
				updated_at: currentTime
			};

			// ステータスに応じてタイムスタンプを設定
			if (newStatus === "acknowledged") {
				updateFields.acknowledged_at = currentTime;
			} else if (newStatus === "resolved") {
				updateFields.resolved_at = currentTime;
			}

			const stmt = this.db
				.prepare(`
				UPDATE alerts 
				SET status = ?, updated_at = ?, acknowledged_at = ?, resolved_at = ?
				WHERE id = ?
			`)
				.bind(
					newStatus,
					currentTime,
					updateFields.acknowledged_at || null,
					updateFields.resolved_at || null,
					alertId
				);

			const result = await stmt.run();

			if (result.success) {
				// 更新されたアラートを取得して返す
				const updatedAlert = await this.findAlertById(alertId);
				if (updatedAlert) {
					return ok(updatedAlert);
				}
			}

			return err({
				type: "InfraError",
				message: "アラートステータスの更新に失敗しました",
				cause: new Error("SQL update failed")
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "アラートステータスの更新に失敗しました",
				cause: error
			});
		}
	}

	async createAlert(alert: Alert): Promise<Result<Alert, AlertsDomainError>> {
		try {
			// 生のSQLを使用してアラートを作成
			const stmt = this.db
				.prepare(`
				INSERT INTO alerts (
					id, type, severity, status, cattle_id, cattle_name, 
					cattle_ear_tag_number, due_at, message, memo, owner_user_id, 
					created_at, updated_at, acknowledged_at, resolved_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
				.bind(
					alert.id,
					alert.type,
					alert.severity,
					alert.status,
					alert.cattleId as number,
					alert.cattleName,
					alert.cattleEarTagNumber,
					alert.dueAt,
					alert.message,
					alert.memo,
					alert.ownerUserId as number,
					alert.createdAt,
					alert.updatedAt,
					alert.acknowledgedAt,
					alert.resolvedAt
				);

			const result = await stmt.run();

			if (result.success) {
				return ok(alert);
			}

			return err({
				type: "InfraError",
				message: "アラートの作成に失敗しました",
				cause: new Error("SQL insert failed")
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "アラートの作成に失敗しました",
				cause: error
			});
		}
	}

	async addAlertHistory(
		history: AlertHistory
	): Promise<Result<void, AlertsDomainError>> {
		try {
			const db = drizzle(this.db);
			await db.insert(alertHistory).values({
				id: history.id,
				alertId: history.alertId,
				action: history.action,
				previousStatus: history.previousStatus,
				newStatus: history.newStatus,
				changedBy: history.changedBy as number,
				reason: history.reason,
				createdAt: history.createdAt
			});

			return ok(undefined);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "アラート履歴の追加に失敗しました",
				cause: error
			});
		}
	}

	async generateAlertsForUser(
		userId: number,
		nowIso: string
	): Promise<Result<Alert[], AlertsDomainError>> {
		try {
			const alerts: Alert[] = [];
			const now = new Date(nowIso);
			const currentTime = toTimestamp(Math.floor(now.getTime() / 1000));

			// 1. 空胎60日以上（AI未実施）の牛を検索
			const openDaysOver60NoAI = await this.findOpenDaysOver60NoAI(
				userId,
				nowIso
			);

			for (const cattle of openDaysOver60NoAI) {
				const alert: Alert = {
					id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as AlertId,
					type: "OPEN_DAYS_OVER60_NO_AI",
					severity: "high",
					status: "active",
					cattleId: toCattleId(cattle.cattleId),
					cattleName: toCattleName(cattle.cattleName),
					cattleEarTagNumber: toEarTagNumber(cattle.cattleEarTagNumber),
					dueAt: toDueDate(cattle.dueAt),
					message: toAlertMessage("空胎60日以上（AI未実施）"),
					memo: null,
					ownerUserId: toUserId(userId),
					createdAt: currentTime,
					updatedAt: currentTime,
					acknowledgedAt: null,
					resolvedAt: null
				};
				alerts.push(alert);
			}

			// 2. 60日以内分娩予定の牛を検索
			const calvingWithin60 = await this.findCalvingWithin60(userId, nowIso);

			for (const cattle of calvingWithin60) {
				const alert: Alert = {
					id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as AlertId,
					type: "CALVING_WITHIN_60",
					severity: "medium",
					status: "active",
					cattleId: toCattleId(cattle.cattleId),
					cattleName: toCattleName(cattle.cattleName),
					cattleEarTagNumber: toEarTagNumber(cattle.cattleEarTagNumber),
					dueAt: toDueDate(cattle.dueAt),
					message: toAlertMessage("60日以内分娩予定"),
					memo: null,
					ownerUserId: toUserId(userId),
					createdAt: currentTime,
					updatedAt: currentTime,
					acknowledgedAt: null,
					resolvedAt: null
				};
				alerts.push(alert);
			}

			// 3. 分娩予定日超過の牛を検索
			const calvingOverdue = await this.findCalvingOverdue(userId, nowIso);

			for (const cattle of calvingOverdue) {
				const alert: Alert = {
					id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as AlertId,
					type: "CALVING_OVERDUE",
					severity: "high",
					status: "active",
					cattleId: toCattleId(cattle.cattleId),
					cattleName: toCattleName(cattle.cattleName),
					cattleEarTagNumber: toEarTagNumber(cattle.cattleEarTagNumber),
					dueAt: toDueDate(cattle.dueAt),
					message: toAlertMessage("分娩予定日超過"),
					memo: null,
					ownerUserId: toUserId(userId),
					createdAt: currentTime,
					updatedAt: currentTime,
					acknowledgedAt: null,
					resolvedAt: null
				};
				alerts.push(alert);
			}

			// 4. 発情から20日以上未妊娠の牛を検索
			const estrusOver20NotPregnant = await this.findEstrusOver20NotPregnant(
				userId,
				nowIso
			);

			for (const cattle of estrusOver20NotPregnant) {
				const alert: Alert = {
					id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as AlertId,
					type: "ESTRUS_OVER20_NOT_PREGNANT",
					severity: "medium",
					status: "active",
					cattleId: toCattleId(cattle.cattleId),
					cattleName: toCattleName(cattle.cattleName),
					cattleEarTagNumber: toEarTagNumber(cattle.cattleEarTagNumber),
					dueAt: toDueDate(cattle.dueAt),
					message: toAlertMessage("発情から20日以上未妊娠"),
					memo: null,
					ownerUserId: toUserId(userId),
					createdAt: currentTime,
					updatedAt: currentTime,
					acknowledgedAt: null,
					resolvedAt: null
				};
				alerts.push(alert);
			}

			return ok(alerts);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "アラート生成に失敗しました",
				cause: error
			});
		}
	}

	// これらのメソッドは現在の機能では不要
	// 将来的に動的アラート生成が必要になった場合に実装

	async updateAlertMemo(
		alertId: AlertId,
		memo: string,
		currentTime: Timestamp
	): Promise<Result<Alert, AlertsDomainError>> {
		try {
			const stmt = this.db
				.prepare(`
				UPDATE alerts 
				SET memo = ?, updated_at = ?
				WHERE id = ?
			`)
				.bind(memo, currentTime, alertId);

			const result = await stmt.run();

			if (result.success) {
				// 更新されたアラートを取得して返す
				const updatedAlert = await this.findAlertById(alertId);
				if (updatedAlert) {
					return ok(updatedAlert);
				}
			}

			return err({
				type: "InfraError",
				message: "メモ更新に失敗しました",
				cause: new Error("SQL update failed")
			});
		} catch (error) {
			return err({
				type: "InfraError",
				message: "メモ更新に失敗しました",
				cause: error
			});
		}
	}

	async findDistinctUserIds(): Promise<UserId[]> {
		try {
			const rows = await this.db
				.prepare(`
					SELECT DISTINCT owner_user_id
					FROM alerts
					ORDER BY owner_user_id
				`)
				.all<{ owner_user_id: number }>();

			return rows.results.map((row: (typeof rows.results)[0]) =>
				toUserId(row.owner_user_id)
			);
		} catch (error) {
			console.error("Failed to get distinct user IDs:", error);
			throw error;
		}
	}

	async findDistinctUserIdsFallback(): Promise<UserId[]> {
		try {
			// フォールバック: より簡単なクエリで取得
			const rows = await this.db
				.prepare(`
					SELECT owner_user_id
					FROM alerts
					LIMIT 100
				`)
				.all<{ owner_user_id: number }>();

			// 重複除去
			const uniqueUserIds = [
				...new Set(
					rows.results.map((row: (typeof rows.results)[0]) => row.owner_user_id)
				)
			];
			return uniqueUserIds.map((id: unknown) => toUserId(id as number));
		} catch (error) {
			console.error("Fallback method failed:", error);
			throw error;
		}
	}
}

export function makeAlertsRepo(db: AnyD1Database): AlertsRepoPort {
	return new DrizzleAlertsRepo(db);
}
