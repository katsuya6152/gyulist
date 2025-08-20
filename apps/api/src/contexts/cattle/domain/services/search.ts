import type { UserId } from "@/shared/brand";
import type { Result } from "@/shared/result";
import { err, ok } from "@/shared/result";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";
import type { Cattle } from "../model/cattle";

/**
 * 牛検索の依存関係。
 */
type Deps = {
	/** 牛リポジトリ */ repo: CattleRepoPort;
};

/**
 * 牛検索コマンド。
 *
 * 牛の検索を実行する際に必要な情報を定義します。
 * ページネーション、ソート、フィルタリング機能をサポートします。
 */
export type SearchCattleCmd = {
	/** 所有者ユーザーID */ ownerUserId: UserId;
	/** カーソル（ページネーション用） */ cursor?: {
		id: number;
		value: string | number;
	};
	/** 取得件数制限 */ limit: number;
	/** ソート項目 */ sortBy: "id" | "name" | "days_old";
	/** ソート順序 */ sortOrder: "asc" | "desc";
	/** 検索文字列（オプション） */ search?: string;
	/** 成長段階フィルタ（オプション） */ growthStage?: string[];
	/** 性別フィルタ（オプション） */ gender?: string[];
	/** ステータスフィルタ（オプション） */ status?: string[];
};

/**
 * 牛検索ユースケース。
 *
 * 指定された条件に基づいて牛を検索します。
 * ページネーション、ソート、フィルタリング機能を提供します。
 *
 * @param deps - 依存関係
 * @param cmd - 牛検索コマンド
 * @returns 成功時は検索結果の牛一覧、失敗時はドメインエラー
 */
export const search =
	(deps: Deps) =>
	async (cmd: SearchCattleCmd): Promise<Result<Cattle[], DomainError>> => {
		try {
			const list = await deps.repo.search(cmd);
			return ok(list);
		} catch (error) {
			return err({
				type: "InfraError",
				message: "Failed to search cattle",
				cause: error
			});
		}
	};
