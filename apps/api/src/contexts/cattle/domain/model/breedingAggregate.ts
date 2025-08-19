import type { CattleId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type { BreedingEvent, BreedingStatus } from "./breedingStatus";
import { transitionBreedingStatus } from "./breedingStatus";
import type { BreedingSummary } from "./breedingSummary";
import {
	createInitialBreedingSummary,
	updateBreedingSummary
} from "./breedingSummary";

/**
 * 繁殖集約ルート。
 *
 * 牛の繁殖に関するすべての情報を統合管理する集約ルートです。
 * 現在の繁殖状況、統計情報、イベント履歴、バージョン管理を提供します。
 */
export type BreedingAggregate = {
	/** 牛ID */ readonly cattleId: CattleId;
	/** 現在の繁殖状況 */ readonly currentStatus: BreedingStatus;
	/** 繁殖統計情報 */ readonly summary: BreedingSummary;
	/** イベント履歴 */ readonly history: readonly BreedingEvent[];
	/** バージョン（楽観的ロック制御用） */ readonly version: number;
	/** 最終更新日時 */ readonly lastUpdated: Date;
};

/**
 * 新規繁殖集約のファクトリ関数。
 *
 * 新しい牛の繁殖集約を作成し、初期状態を設定します。
 * @param cattleId - 牛ID
 * @param initialStatus - 初期繁殖状況
 * @returns 作成された繁殖集約
 */
export function createBreedingAggregate(
	cattleId: CattleId,
	initialStatus: BreedingStatus
): BreedingAggregate {
	return {
		cattleId,
		currentStatus: initialStatus,
		summary: createInitialBreedingSummary(),
		history: [],
		version: 1,
		lastUpdated: new Date()
	};
}

/**
 * 永続化データから繁殖集約を再構築するファクトリ関数。
 *
 * データベースから取得したデータから繁殖集約を再構築します。
 * @param props - 再構築用のプロパティ
 * @returns 再構築された繁殖集約
 */
export function reconstructBreedingAggregate(props: {
	/** 牛ID */ cattleId: CattleId;
	/** 現在の繁殖状況 */ currentStatus: BreedingStatus;
	/** 繁殖統計情報 */ summary: BreedingSummary;
	/** イベント履歴 */ history: BreedingEvent[];
	/** バージョン */ version: number;
	/** 最終更新日時 */ lastUpdated: Date;
}): BreedingAggregate {
	return {
		cattleId: props.cattleId,
		currentStatus: props.currentStatus,
		summary: props.summary,
		history: [...props.history], // Create new array to maintain immutability
		version: props.version,
		lastUpdated: props.lastUpdated
	};
}

/**
 * 繁殖イベントを集約に適用する純粋関数。
 *
 * 繁殖イベントを集約に適用し、新しい状態を生成します。
 * イベントの妥当性チェック、状態遷移、統計更新を行います。
 * @param aggregate - 対象の繁殖集約
 * @param event - 適用する繁殖イベント
 * @param currentDate - 現在日時
 * @returns 成功時は更新された集約、失敗時はドメインエラー
 */
export function applyBreedingEvent(
	aggregate: BreedingAggregate,
	event: BreedingEvent,
	currentDate: Date
): Result<BreedingAggregate, DomainError> {
	// Validate event timestamp
	if (event.timestamp > currentDate) {
		return err({
			type: "ValidationError",
			message: "Event timestamp cannot be in the future"
		});
	}

	// Validate event order (events should be chronological)
	const lastEvent = aggregate.history[aggregate.history.length - 1];
	if (lastEvent && event.timestamp < lastEvent.timestamp) {
		return err({
			type: "ValidationError",
			message: "Events must be in chronological order"
		});
	}

	// Transition breeding status
	const statusTransition = transitionBreedingStatus(
		aggregate.currentStatus,
		event,
		currentDate
	);

	if (!statusTransition.ok) {
		return statusTransition;
	}

	// Update history
	const newHistory = [...aggregate.history, event];

	// Update summary
	const newSummary = updateBreedingSummary(
		aggregate.summary,
		event,
		newHistory
	);

	return ok({
		cattleId: aggregate.cattleId,
		currentStatus: statusTransition.value,
		summary: newSummary,
		history: newHistory,
		version: aggregate.version + 1,
		lastUpdated: currentDate
	});
}

/**
 * 指定された日付範囲内の繁殖イベントを取得する純粋関数。
 * @param aggregate - 対象の繁殖集約
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 日付範囲内のイベント一覧
 */
export function getBreedingEventsInRange(
	aggregate: BreedingAggregate,
	startDate: Date,
	endDate: Date
): BreedingEvent[] {
	return aggregate.history.filter(
		(event) => event.timestamp >= startDate && event.timestamp <= endDate
	);
}

/**
 * 指定されたタイプの最後のイベントを取得する純粋関数。
 * @param aggregate - 対象の繁殖集約
 * @param eventType - イベントタイプ
 * @returns 最後のイベント（見つからない場合はnull）
 */
export function getLastEventOfType(
	aggregate: BreedingAggregate,
	eventType: BreedingEvent["type"]
): BreedingEvent | null {
	const eventsOfType = aggregate.history.filter(
		(event) => event.type === eventType
	);
	return eventsOfType.length > 0 ? eventsOfType[eventsOfType.length - 1] : null;
}

/**
 * 繁殖集約が有効な状態かどうかをチェックする純粋関数。
 *
 * 状態の一貫性、イベントの順序、バージョンの妥当性を検証します。
 * @param aggregate - 検証対象の繁殖集約
 * @returns 成功時はtrue、失敗時はドメインエラー
 */
export function isBreedingAggregateValid(
	aggregate: BreedingAggregate
): Result<true, DomainError> {
	// Check if status is consistent with recent events
	const lastEvent = aggregate.history[aggregate.history.length - 1];

	if (lastEvent) {
		// Validate status consistency based on last event
		switch (lastEvent.type) {
			case "Inseminate":
				if (aggregate.currentStatus.type !== "Inseminated") {
					return err({
						type: "ValidationError",
						message: "Status should be 'Inseminated' after insemination event"
					});
				}
				break;
			case "ConfirmPregnancy":
				if (aggregate.currentStatus.type !== "Pregnant") {
					return err({
						type: "ValidationError",
						message: "Status should be 'Pregnant' after pregnancy confirmation"
					});
				}
				break;
			case "Calve":
				if (aggregate.currentStatus.type !== "PostCalving") {
					return err({
						type: "ValidationError",
						message: "Status should be 'PostCalving' after calving event"
					});
				}
				break;
		}
	}

	// Check version consistency
	if (aggregate.version <= 0) {
		return err({
			type: "ValidationError",
			message: "Aggregate version must be positive"
		});
	}

	return ok(true);
}

/**
 * 繁殖サイクルの要約を取得する純粋関数。
 *
 * 現在の繁殖サイクルの開始日、経過日数、次の予定イベントなどを計算します。
 * @param aggregate - 対象の繁殖集約
 * @returns 繁殖サイクルの要約情報
 */
export function getBreedingCycleSummary(aggregate: BreedingAggregate): {
	/** 現在のサイクル開始日 */ currentCycleStartDate: Date | null;
	/** 現在のサイクル経過日数 */ daysInCurrentCycle: number | null;
	/** サイクル段階 */ cyclePhase: string;
	/** 次の予定イベント */ nextExpectedEvent: string | null;
	/** 次の予定日 */ nextExpectedDate: Date | null;
} {
	const status = aggregate.currentStatus;
	const lastCalving = getLastEventOfType(aggregate, "Calve");
	const lastInsemination = getLastEventOfType(aggregate, "Inseminate");
	const currentDate = new Date();

	let currentCycleStartDate: Date | null = null;
	let daysInCurrentCycle: number | null = null;
	let nextExpectedEvent: string | null = null;
	let nextExpectedDate: Date | null = null;

	switch (status.type) {
		case "NotBreeding":
			currentCycleStartDate = lastCalving?.timestamp || null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				if (daysInCurrentCycle > 60) {
					nextExpectedEvent = "人工授精";
					// Estimate next breeding window
					const nextBreedingDate = new Date(currentCycleStartDate);
					nextBreedingDate.setDate(nextBreedingDate.getDate() + 80);
					nextExpectedDate = nextBreedingDate;
				}
			}
			break;

		case "Inseminated":
			currentCycleStartDate = lastInsemination?.timestamp || null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				nextExpectedEvent = "妊娠鑑定";
				nextExpectedDate = new Date(currentCycleStartDate);
				nextExpectedDate.setDate(nextExpectedDate.getDate() + 21);
			}
			break;

		case "Pregnant": {
			const lastPregnancyConfirmation = getLastEventOfType(
				aggregate,
				"ConfirmPregnancy"
			);
			currentCycleStartDate =
				lastPregnancyConfirmation?.timestamp ||
				lastInsemination?.timestamp ||
				null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				nextExpectedEvent = "分娩";
				nextExpectedDate = status.expectedCalvingDate;
			}
			break;
		}

		case "PostCalving": {
			const lastCalving = getLastEventOfType(aggregate, "Calve");
			currentCycleStartDate = lastCalving?.timestamp || null;
			if (currentCycleStartDate) {
				daysInCurrentCycle = Math.floor(
					(currentDate.getTime() - currentCycleStartDate.getTime()) /
						(1000 * 60 * 60 * 24)
				);
				if (daysInCurrentCycle > 45) {
					nextExpectedEvent = "次回繁殖開始";
					nextExpectedDate = new Date(currentCycleStartDate);
					nextExpectedDate.setDate(nextExpectedDate.getDate() + 60);
				}
			}
			break;
		}
	}

	return {
		currentCycleStartDate,
		daysInCurrentCycle,
		cyclePhase: status.type,
		nextExpectedEvent,
		nextExpectedDate
	};
}
