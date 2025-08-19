import type { CattleId, UserId } from "../../../../shared/brand";
import type { ClockPort } from "../../../../shared/ports/clock";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { BreedingRepoPort } from "../../../breeding/ports";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";
import { createBreedingAggregate } from "../model/breedingAggregate";
import type { BreedingAggregate } from "../model/breedingAggregate";
import type { BreedingStatus } from "../model/breedingStatus";
import type { BreedingSummary } from "../model/breedingSummary";
import type { Cattle } from "../model/cattle";

/**
 * 牛更新の依存関係。
 */
type Deps = {
	/** 牛リポジトリ */ repo: CattleRepoPort;
	/** クロック */ clock: ClockPort;
	/** 繁殖リポジトリ */ breedingRepo: BreedingRepoPort;
};

/**
 * 牛更新コマンド。
 *
 * 牛の情報を更新する際に必要な情報を定義します。
 * 基本情報と繁殖関連情報の両方を更新できます。
 */
export type UpdateCattleCmd = {
	/** リクエスト元ユーザーID */ requesterUserId: UserId;
	/** 牛ID */ id: CattleId;
	/** 更新データ */ patch: Partial<
		Pick<
			Cattle,
			| "name"
			| "gender"
			| "birthday"
			| "growthStage"
			| "breed"
			| "status"
			| "producerName"
			| "barn"
			| "breedingValue"
			| "notes"
		>
	> & {
		/** 繁殖状況更新データ */ breedingStatus?: {
			/** 産次数 */ parity?: number | null;
			/** 予定分娩日 */ expectedCalvingDate?: string | null;
			/** 予定妊娠鑑定日 */ scheduledPregnancyCheckDate?: string | null;
			/** 分娩後日数 */ daysAfterCalving?: number | null;
			/** 空胎日数 */ daysOpen?: number | null;
			/** 妊娠日数 */ pregnancyDays?: number | null;
			/** 授精後日数 */ daysAfterInsemination?: number | null;
			/** 授精回数 */ inseminationCount?: number | null;
			/** 繁殖メモ */ breedingMemo?: string | null;
			/** 難産フラグ */ isDifficultBirth?: boolean | null;
		};
		/** 繁殖サマリー更新データ */ breedingSummary?: {
			/** 総授精回数 */ totalInseminationCount?: number | null;
			/** 平均空胎日数 */ averageDaysOpen?: number | null;
			/** 平均妊娠期間 */ averagePregnancyPeriod?: number | null;
			/** 平均分娩間隔 */ averageCalvingInterval?: number | null;
			/** 難産回数 */ difficultBirthCount?: number | null;
			/** 妊娠頭数 */ pregnancyHeadCount?: number | null;
			/** 妊娠成功率 */ pregnancySuccessRate?: number | null;
		};
	};
};

/**
 * 牛更新ユースケース。
 *
 * 牛の基本情報と繁殖関連情報を更新します。
 * 誕生日が変更された場合は年齢派生値を自動計算します。
 * 繁殖関連情報の更新時は繁殖集約も同時に更新されます。
 *
 * @param deps - 依存関係
 * @param cmd - 牛更新コマンド
 * @returns 成功時は更新された牛情報、失敗時はドメインエラー
 */
export const update =
	(deps: Deps) =>
	async (cmd: UpdateCattleCmd): Promise<Result<Cattle, DomainError>> => {
		const current = await deps.repo.findById(cmd.id);
		if (!current)
			return err({
				type: "NotFound",
				entity: "Cattle",
				id: cmd.id as unknown as number
			});
		if (
			(current.ownerUserId as unknown as number) !==
			(cmd.requesterUserId as unknown as number)
		) {
			return err({ type: "Forbidden", message: "You do not own this cattle" });
		}
		// birthday が変わる場合は年齢派生値を再計算（readonlyを直接代入しない）
		const basePatch = { ...cmd.patch } as Partial<Cattle>;
		let updatesForRepo: Partial<Cattle> = basePatch;
		if (typeof basePatch.birthday === "string") {
			const birth = new Date(basePatch.birthday);
			if (Number.isNaN(birth.getTime())) {
				return err({
					type: "ValidationError",
					message: "Invalid birthday format"
				});
			}
			const now = deps.clock.now();
			const diffMs = now.getTime() - birth.getTime();
			updatesForRepo = {
				...basePatch,
				age: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)),
				monthsOld: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)),
				daysOld: Math.floor(diffMs / (1000 * 60 * 60 * 24))
			};
		}
		const updated = await deps.repo.update(
			cmd.id,
			updatesForRepo as unknown as Partial<
				import("../model/cattle").NewCattleProps
			>
		);

		// breeding updates via breedingRepo (Hex)
		if (cmd.patch.breedingStatus || cmd.patch.breedingSummary) {
			const existing =
				(await deps.breedingRepo.findByCattleId(cmd.id)) ??
				createBreedingAggregate(cmd.id, {
					type: "NotBreeding",
					parity: 0,
					daysAfterCalving: null,
					memo: null
				} as unknown as BreedingStatus);

			let nextStatus: BreedingStatus = existing.currentStatus;
			if (cmd.patch.breedingStatus) {
				const bs = cmd.patch.breedingStatus;
				let pregnancyDays = bs.pregnancyDays ?? null;
				if (pregnancyDays == null && bs.scheduledPregnancyCheckDate) {
					const checkDate = new Date(bs.scheduledPregnancyCheckDate);
					pregnancyDays = Math.floor(
						(deps.clock.now().getTime() - checkDate.getTime()) /
							(1000 * 60 * 60 * 24)
					);
				}
				if (pregnancyDays != null) {
					nextStatus = {
						type: "Pregnant",
						parity: (bs.parity ?? 0) as unknown,
						pregnancyDays: pregnancyDays as unknown,
						expectedCalvingDate: bs.expectedCalvingDate
							? new Date(bs.expectedCalvingDate)
							: new Date(),
						scheduledPregnancyCheckDate: bs.scheduledPregnancyCheckDate
							? new Date(bs.scheduledPregnancyCheckDate)
							: null,
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				} else if (bs.daysAfterInsemination != null) {
					nextStatus = {
						type: "Inseminated",
						parity: (bs.parity ?? 0) as unknown,
						daysAfterInsemination: (bs.daysAfterInsemination ?? 0) as unknown,
						inseminationCount: (bs.inseminationCount ?? 1) as unknown,
						daysOpen: (bs.daysOpen ?? null) as unknown,
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				} else if (bs.daysAfterCalving != null) {
					nextStatus = {
						type: "PostCalving",
						parity: (bs.parity ?? 0) as unknown,
						daysAfterCalving: (bs.daysAfterCalving ?? 0) as unknown,
						isDifficultBirth: Boolean(bs.isDifficultBirth),
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				} else {
					nextStatus = {
						type: "NotBreeding",
						parity: (bs.parity ?? 0) as unknown,
						daysAfterCalving: (bs.daysAfterCalving ?? null) as unknown,
						memo: (bs.breedingMemo ?? null) as unknown
					} as unknown as BreedingStatus;
				}
			}

			let nextSummary: BreedingSummary = existing.summary;
			if (cmd.patch.breedingSummary) {
				const s = cmd.patch.breedingSummary;
				nextSummary = {
					...existing.summary,
					totalInseminationCount: (s.totalInseminationCount ??
						(existing.summary
							.totalInseminationCount as unknown as number)) as unknown,
					averageDaysOpen: (s.averageDaysOpen ??
						(existing.summary.averageDaysOpen as unknown as
							| number
							| null)) as unknown,
					averagePregnancyPeriod: (s.averagePregnancyPeriod ??
						(existing.summary.averagePregnancyPeriod as unknown as
							| number
							| null)) as unknown,
					averageCalvingInterval: (s.averageCalvingInterval ??
						(existing.summary.averageCalvingInterval as unknown as
							| number
							| null)) as unknown,
					difficultBirthCount: (s.difficultBirthCount ??
						(existing.summary
							.difficultBirthCount as unknown as number)) as unknown,
					pregnancyHeadCount: (s.pregnancyHeadCount ??
						(existing.summary
							.pregnancyHeadCount as unknown as number)) as unknown,
					pregnancySuccessRate: (s.pregnancySuccessRate ??
						(existing.summary.pregnancySuccessRate as unknown as
							| number
							| null)) as unknown,
					lastUpdated: deps.clock.now()
				} as unknown as BreedingSummary;
			}

			const aggregate: BreedingAggregate = {
				...existing,
				currentStatus: nextStatus,
				summary: nextSummary,
				lastUpdated: deps.clock.now()
			};
			await deps.breedingRepo.save(aggregate);
		}

		return ok(updated);
	};
