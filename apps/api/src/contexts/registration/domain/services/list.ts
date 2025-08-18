import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { RegistrationRepoPort, SearchParams } from "../../ports";
import type { RegistrationDomainError } from "../errors";
import type { Registration } from "../model/registration";

// ============================================================================
// コマンドと依存関係
// ============================================================================

export type ListCmd = SearchParams;

export type ListDeps = {
	repo: RegistrationRepoPort;
};

// ============================================================================
// 結果型
// ============================================================================

export type ListResult = {
	items: Registration[];
	total: number;
};

// ============================================================================
// ドメインサービス
// ============================================================================

/**
 * 登録一覧取得のユースケース
 */
export const list =
	(deps: ListDeps) =>
	async (
		cmd: ListCmd
	): Promise<Result<ListResult, RegistrationDomainError>> => {
		try {
			const res = await deps.repo.search(cmd);

			// 生のデータをドメインモデルに変換
			const items = res.items.map((item) => ({
				id: item.id,
				email: item.email,
				referralSource: item.referralSource,
				status: item.status,
				locale: item.locale,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt
			})) as Registration[];

			return ok({
				items,
				total: res.total
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "登録一覧の取得に失敗しました",
				cause
			});
		}
	};
