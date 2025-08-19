import type { CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { EventsRepoPort } from "../../../events/ports";
import type { CattleRepoPort } from "../../ports";
import type { CattleDetailsQueryPort } from "../../ports.details";
import type { DomainError } from "../errors";

/**
 * 牛詳細取得の依存関係。
 */
type Deps = {
	/** 牛リポジトリ */ repo: CattleRepoPort;
	/** イベントリポジトリ */ eventsRepo: EventsRepoPort;
	/** 詳細クエリポート */ details: CattleDetailsQueryPort;
};

/**
 * 牛詳細取得コマンド。
 *
 * 牛の詳細情報を取得する際に必要な情報を定義します。
 */
export type GetCattleDetailCmd = {
	/** 牛ID */ id: CattleId;
	/** リクエスト元ユーザーID */ requesterUserId: UserId;
};

/**
 * 牛詳細取得ユースケース。
 *
 * 牛の基本情報、イベント履歴、血統情報、母牛情報、繁殖状況、繁殖サマリーを
 * 並行取得して統合した詳細情報を提供します。
 *
 * @param deps - 依存関係
 * @param cmd - 牛詳細取得コマンド
 * @returns 成功時は牛の詳細情報、失敗時はドメインエラー
 */
export const getDetail =
	(deps: Deps) =>
	async (
		cmd: GetCattleDetailCmd
	): Promise<Result<Record<string, unknown>, DomainError>> => {
		const found = await deps.repo.findById(cmd.id);
		if (!found) {
			return err({
				type: "NotFound",
				entity: "Cattle",
				id: cmd.id as unknown as number,
				message: "Cattle not found"
			});
		}

		if (
			(found.ownerUserId as unknown as number) !==
			(cmd.requesterUserId as unknown as number)
		) {
			return err({ type: "Forbidden", message: "Unauthorized" });
		}

		const [
			events,
			bloodline,
			motherInfo,
			breedingStatusRaw,
			breedingSummaryRaw
		] = await Promise.all([
			deps.eventsRepo.listByCattleId(cmd.id, cmd.requesterUserId),
			deps.details.getBloodline(cmd.id),
			deps.details.getMotherInfo(cmd.id),
			deps.details.getBreedingStatus(cmd.id),
			deps.details.getBreedingSummary(cmd.id)
		]);

		const normalizedBreedingStatus = breedingStatusRaw
			? {
					...breedingStatusRaw,
					createdAt: new Date(breedingStatusRaw.createdAt),
					updatedAt: new Date(breedingStatusRaw.updatedAt)
				}
			: null;

		const normalizedBreedingSummary = breedingSummaryRaw
			? {
					...breedingSummaryRaw,
					createdAt: new Date(breedingSummaryRaw.createdAt),
					updatedAt: new Date(breedingSummaryRaw.updatedAt)
				}
			: null;

		return ok({
			...(found as unknown as Record<string, unknown>),
			events,
			bloodline,
			motherInfo,
			breedingStatus: normalizedBreedingStatus,
			breedingSummary: normalizedBreedingSummary
		});
	};
