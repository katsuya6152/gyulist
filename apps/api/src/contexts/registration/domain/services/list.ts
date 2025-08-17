import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../auth/domain/errors";
import type { RegistrationRepoPort, SearchParams } from "../../ports";

export type ListCmd = SearchParams;

export type ListDeps = {
	repo: RegistrationRepoPort;
};

export const list =
	(deps: ListDeps) =>
	async (
		cmd: ListCmd
	): Promise<
		Result<
			{ items: Array<Record<string, unknown>>; total: number },
			DomainError
		>
	> => {
		try {
			const res = await deps.repo.search(cmd);
			return ok(res);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to list registrations",
				cause
			});
		}
	};
