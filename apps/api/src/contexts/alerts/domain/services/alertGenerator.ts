import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { AlertsRepoPort, RawAlertRow } from "../../ports";
import type { AlertsDomainError } from "../errors";
import type {
	Alert,
	AlertSeverity,
	AlertType,
	CattleId,
	Timestamp,
	UserId
} from "../model";
import {
	createAlert,
	createAlertType,
	toAlertId,
	toAlertMessage,
	toAlertSeverity,
	toAlertType,
	toCattleId,
	toCattleName,
	toDueDate,
	toEarTagNumber,
	toTimestamp,
	toUserId
} from "../model";

// ============================================================================
// 依存関係とコマンド
// ============================================================================

/**
 * アラート生成の依存関係。
 */
export type AlertGeneratorDeps = {
	/** アラートリポジトリ */ repo: AlertsRepoPort;
	/** ID生成器 */ id: { uuid(): string };
	/** 時刻取得器 */ time: { nowSeconds(): number };
};

/**
 * アラート生成コマンド。
 *
 * アラートを生成する際に必要な情報を定義します。
 */
export type GenerateAlertsCmd = {
	/** 所有者ユーザーID */ ownerUserId: UserId;
	/** 現在時刻取得関数 */ now: () => Date;
};

// ============================================================================
// 結果型
// ============================================================================

/**
 * アラート生成結果。
 *
 * 生成されたアラート一覧と統計情報を含む結果を定義します。
 */
export type AlertGenerationResult = {
	/** アラート一覧 */ alerts: Alert[];
	/** 総件数 */ total: number;
	/** 重要度別統計 */ summary: {
		/** 高重要度 */ high: number;
		/** 中重要度 */ medium: number;
		/** 低重要度 */ low: number;
		/** 緊急 */ urgent: number;
	};
};

// ============================================================================
// アラート生成サービス
// ============================================================================

/**
 * アラート生成のユースケース。
 *
 * 繁殖管理、健康管理、スケジュール管理に関するアラートを動的に生成します。
 * 各種条件に基づいてアラートを作成し、重要度別の統計情報も提供します。
 *
 * @param deps - 依存関係
 * @param cmd - アラート生成コマンド
 * @returns 成功時はアラート生成結果、失敗時はドメインエラー
 */
export const generateAlerts =
	(deps: AlertGeneratorDeps) =>
	async (
		cmd: GenerateAlertsCmd
	): Promise<Result<AlertGenerationResult, AlertsDomainError>> => {
		try {
			const nowIso = cmd.now().toISOString();
			const currentTime = toTimestamp(deps.time.nowSeconds());

			// 1. 各種アラートデータを並行取得
			const [openDays, calvingWithin, calvingOverdue, estrusOver] =
				await Promise.all([
					deps.repo.findOpenDaysOver60NoAI(fromUserId(cmd.ownerUserId), nowIso),
					deps.repo.findCalvingWithin60(fromUserId(cmd.ownerUserId), nowIso),
					deps.repo.findCalvingOverdue(fromUserId(cmd.ownerUserId), nowIso),
					deps.repo.findEstrusOver20NotPregnant(
						fromUserId(cmd.ownerUserId),
						nowIso
					)
				]);

			// 2. アラートエンティティを生成
			const alerts: Alert[] = [];

			// 空胎60日以上（AI未実施）
			for (const row of openDays) {
				const alert = createAlertFromRow(
					row,
					"OPEN_DAYS_OVER60_NO_AI",
					"medium",
					"最終分娩から60日以上、人工授精未実施",
					deps,
					currentTime
				);
				alerts.push(alert);
			}

			// 60日以内分娩予定
			for (const row of calvingWithin) {
				const alert = createAlertFromRow(
					row,
					"CALVING_WITHIN_60",
					"medium",
					"分娩予定日まで60日以内（エサ強化）",
					deps,
					currentTime
				);
				alerts.push(alert);
			}

			// 分娩予定日超過
			for (const row of calvingOverdue) {
				const alert = createAlertFromRow(
					row,
					"CALVING_OVERDUE",
					"high",
					"分娩予定日を経過",
					deps,
					currentTime
				);
				alerts.push(alert);
			}

			// 発情から20日以上未妊娠
			for (const row of estrusOver) {
				const alert = createAlertFromRow(
					row,
					"ESTRUS_OVER20_NOT_PREGNANT",
					"low",
					"発情から20日経過（再発情を確認）",
					deps,
					currentTime
				);
				alerts.push(alert);
			}

			// 3. アラートを優先度順にソート
			const sortedAlerts = sortAlertsByPriority(alerts);

			// 4. サマリーを計算
			const summary = calculateAlertSummary(sortedAlerts);

			return ok({
				alerts: sortedAlerts.slice(0, 50), // 最大50件まで
				total: sortedAlerts.length,
				summary
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "アラートの生成に失敗しました",
				cause
			});
		}
	};

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 生データからアラートエンティティを作成
 */
function createAlertFromRow(
	row: RawAlertRow,
	type: AlertType,
	severity: AlertSeverity,
	message: string,
	deps: AlertGeneratorDeps,
	currentTime: Timestamp
): Alert {
	const alertId = toAlertId(deps.id.uuid());
	const cattleId = toCattleId(row.cattleId);
	const cattleName = toCattleName(row.cattleName);
	const earTagNumber = toEarTagNumber(row.cattleEarTagNumber);
	const dueAt = toDueDate(row.dueAt);
	const alertMessage = toAlertMessage(message);

	return createAlert(
		{
			type: toAlertType(type),
			severity: toAlertSeverity(severity),
			cattleId,
			cattleName,
			cattleEarTagNumber: earTagNumber,
			dueAt,
			message: alertMessage,
			ownerUserId: toUserId(row.cattleId) // TODO: 実際のownerUserIdを取得する必要がある
		},
		alertId,
		currentTime
	);
}

/**
 * アラートを優先度順にソート
 */
function sortAlertsByPriority(alerts: Alert[]): Alert[] {
	const severityOrder: Record<AlertSeverity, number> = {
		high: 3,
		medium: 2,
		low: 1
	};

	return alerts.sort((a, b) => {
		// 1. 重要度でソート（高い順）
		const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
		if (severityDiff !== 0) return severityDiff;

		// 2. 期限でソート（近い順）
		const aTime = a.dueAt
			? new Date(a.dueAt).getTime()
			: Number.MAX_SAFE_INTEGER;
		const bTime = b.dueAt
			? new Date(b.dueAt).getTime()
			: Number.MAX_SAFE_INTEGER;
		return aTime - bTime;
	});
}

/**
 * アラートサマリーを計算
 */
function calculateAlertSummary(
	alerts: Alert[]
): AlertGenerationResult["summary"] {
	let high = 0;
	let medium = 0;
	let low = 0;
	let urgent = 0;

	for (const alert of alerts) {
		switch (alert.severity) {
			case "high":
				high++;
				urgent++;
				break;
			case "medium":
				medium++;
				break;
			case "low":
				low++;
				break;
		}
	}

	return { high, medium, low, urgent };
}

// ============================================================================
// 型変換ヘルパー
// ============================================================================

/**
 * UserIdを数値に変換（一時的な実装）
 */
function fromUserId(userId: UserId): number {
	return userId as unknown as number;
}
