import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type {
	BreedingMemo,
	DaysAfterCalving,
	DaysAfterInsemination,
	DaysOpen,
	InseminationCount,
	Parity,
	PregnancyDays
} from "./types";

/**
 * 繁殖状態の状態機械（ステートマシン）。
 *
 * - NotBreeding: 休息/未繁殖フェーズ
 * - Inseminated: 授精済みフェーズ（授精回数・経過日数などを追跡）
 * - Pregnant: 妊娠フェーズ（妊娠日数・予定分娩日など）
 * - PostCalving: 分娩後フェーズ（分娩後日数・難産フラグなど）
 */
export type BreedingStatus =
	| {
			/** 状態名 */ readonly type: "NotBreeding";
			/** 産次 */ readonly parity: Parity;
			/** 分娩後日数 */ readonly daysAfterCalving: DaysAfterCalving | null;
			/** メモ */ readonly memo: BreedingMemo | null;
	  }
	| {
			/** 状態名 */ readonly type: "Inseminated";
			/** 産次 */ readonly parity: Parity;
			/** 授精後日数 */ readonly daysAfterInsemination: DaysAfterInsemination;
			/** 授精回数 */ readonly inseminationCount: InseminationCount;
			/** 空胎日数 */ readonly daysOpen: DaysOpen | null;
			/** メモ */ readonly memo: BreedingMemo | null;
	  }
	| {
			/** 状態名 */ readonly type: "Pregnant";
			/** 産次 */ readonly parity: Parity;
			/** 妊娠日数 */ readonly pregnancyDays: PregnancyDays;
			/** 予定分娩日 */ readonly expectedCalvingDate: Date;
			/** 予定妊娠確認日 */ readonly scheduledPregnancyCheckDate: Date | null;
			/** メモ */ readonly memo: BreedingMemo | null;
	  }
	| {
			/** 状態名 */ readonly type: "PostCalving";
			/** 産次 */ readonly parity: Parity;
			/** 分娩後日数 */ readonly daysAfterCalving: DaysAfterCalving;
			/** 難産フラグ */ readonly isDifficultBirth: boolean;
			/** メモ */ readonly memo: BreedingMemo | null;
	  };

/**
 * 状態遷移を引き起こすイベント。
 */
export type BreedingEvent =
	| {
			/** 授精 */ readonly type: "Inseminate";
			/** 発生時刻 */ readonly timestamp: Date;
			/** メモ */ readonly memo?: string | null;
	  }
	| {
			/** 妊娠確認 */ readonly type: "ConfirmPregnancy";
			/** 発生時刻 */ readonly timestamp: Date;
			/** 予定分娩日 */ readonly expectedCalvingDate: Date;
			/** 予定妊娠確認日 */ readonly scheduledPregnancyCheckDate?: Date | null;
			/** メモ */ readonly memo?: string | null;
	  }
	| {
			/** 分娩 */ readonly type: "Calve";
			/** 発生時刻 */ readonly timestamp: Date;
			/** 難産かどうか */ readonly isDifficultBirth: boolean;
			/** メモ */ readonly memo?: string | null;
	  }
	| {
			/** 新周期開始 */ readonly type: "StartNewCycle";
			/** 発生時刻 */ readonly timestamp: Date;
			/** メモ */ readonly memo?: string | null;
	  };

/**
 * 初期繁殖状態の作成。
 * @param props.parity - 初期産次（0以上）
 * @param props.memo - 初期メモ
 */
export function createInitialBreedingStatus(props: {
	parity: number;
	memo?: string | null;
}): Result<BreedingStatus, DomainError> {
	if (props.parity < 0) {
		return err({
			type: "ValidationError",
			message: "Parity cannot be negative",
			field: "parity"
		});
	}

	return ok({
		type: "NotBreeding",
		parity: props.parity as Parity,
		daysAfterCalving: null,
		memo: props.memo as BreedingMemo | null
	});
}

/**
 * 繁殖状態の遷移を行う純粋関数。
 * @param current - 現在の状態
 * @param event - 発生イベント
 * @param currentDate - 現在日時
 */
export function transitionBreedingStatus(
	current: BreedingStatus,
	event: BreedingEvent,
	currentDate: Date
): Result<BreedingStatus, DomainError> {
	switch (current.type) {
		case "NotBreeding":
			if (event.type === "Inseminate") {
				return ok({
					type: "Inseminated",
					parity: current.parity,
					daysAfterInsemination: 0 as DaysAfterInsemination,
					inseminationCount: 1 as InseminationCount,
					daysOpen: current.daysAfterCalving
						? ((calculateDaysDifference(event.timestamp, currentDate) +
								current.daysAfterCalving) as DaysOpen)
						: null,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;

		case "Inseminated":
			if (event.type === "Inseminate") {
				return ok({
					...current,
					daysAfterInsemination: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as DaysAfterInsemination,
					inseminationCount: (current.inseminationCount +
						1) as InseminationCount,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "ConfirmPregnancy") {
				return ok({
					type: "Pregnant",
					parity: current.parity,
					pregnancyDays: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as PregnancyDays,
					expectedCalvingDate: event.expectedCalvingDate,
					scheduledPregnancyCheckDate:
						event.scheduledPregnancyCheckDate || null,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "StartNewCycle") {
				return ok({
					type: "NotBreeding",
					parity: current.parity,
					daysAfterCalving: null,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;

		case "Pregnant":
			if (event.type === "Calve") {
				return ok({
					type: "PostCalving",
					parity: (current.parity + 1) as Parity,
					daysAfterCalving: 0 as DaysAfterCalving,
					isDifficultBirth: event.isDifficultBirth,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "StartNewCycle") {
				// Pregnancy failed, back to not breeding
				return ok({
					type: "NotBreeding",
					parity: current.parity,
					daysAfterCalving: null,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;

		case "PostCalving":
			if (event.type === "StartNewCycle") {
				return ok({
					type: "NotBreeding",
					parity: current.parity,
					daysAfterCalving: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as DaysAfterCalving,
					memo: event.memo as BreedingMemo | null
				});
			}
			if (event.type === "Inseminate") {
				return ok({
					type: "Inseminated",
					parity: current.parity,
					daysAfterInsemination: 0 as DaysAfterInsemination,
					inseminationCount: 1 as InseminationCount,
					daysOpen: calculateDaysDifference(
						event.timestamp,
						currentDate
					) as DaysOpen,
					memo: event.memo as BreedingMemo | null
				});
			}
			break;
	}

	return err({
		type: "ValidationError",
		message: `Invalid transition from ${current.type} with event ${event.type}`
	});
}

// Helper function to calculate days difference
function calculateDaysDifference(from: Date, to: Date): number {
	const diffMs = to.getTime() - from.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 現在の繁殖フェーズを表示用の説明文として返します。
 */
export function getBreedingPhaseDescription(status: BreedingStatus): string {
	switch (status.type) {
		case "NotBreeding":
			return status.daysAfterCalving
				? `休息中 (分娩後${status.daysAfterCalving}日)`
				: "繁殖待機中";
		case "Inseminated":
			return `人工授精済み (${status.inseminationCount}回目, ${status.daysAfterInsemination}日経過)`;
		case "Pregnant":
			return `妊娠中 (${status.pregnancyDays}日目)`;
		case "PostCalving":
			return `分娩後 (${status.daysAfterCalving}日経過, ${status.isDifficultBirth ? "難産" : "安産"})`;
	}
}

/**
 * 注意喚起が必要かを判定します。
 */
export function needsBreedingAttention(
	status: BreedingStatus,
	currentDate: Date
): boolean {
	switch (status.type) {
		case "Inseminated":
			return status.daysAfterInsemination > 21; // Pregnancy check needed
		case "Pregnant":
			if (status.scheduledPregnancyCheckDate) {
				return currentDate >= status.scheduledPregnancyCheckDate;
			}
			return status.pregnancyDays > 280; // Near calving date
		case "PostCalving":
			return status.daysAfterCalving > 60; // Ready for next breeding
		default:
			return false;
	}
}
