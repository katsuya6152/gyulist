import type { UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { CattleRepoPort } from "../../../cattle/ports";
import type { DomainError } from "../errors";
import type { Cattle } from "../model/cattle";

type Deps = { repo: CattleRepoPort };

export type SearchCattleCmd = {
	ownerUserId: UserId;
	cursor?: { id: number; value: string | number };
	limit: number;
	sortBy: "id" | "name" | "days_old";
	sortOrder: "asc" | "desc";
	search?: string;
	growthStage?: string[];
	gender?: string[];
	status?: string[];
};

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
