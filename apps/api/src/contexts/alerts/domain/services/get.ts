import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../../../auth/domain/errors";
import type { AlertsRepoPort, RawAlertRow } from "../../ports";

export type Repo = AlertsRepoPort;

export type DerivedAlert = {
	alertId: string;
	type:
		| "OPEN_DAYS_OVER60_NO_AI"
		| "CALVING_WITHIN_60"
		| "CALVING_OVERDUE"
		| "ESTRUS_OVER20_NOT_PREGNANT";
	severity: "high" | "medium" | "low";
	cattleId: number;
	cattleName: string | null;
	cattleEarTagNumber: string | null;
	dueAt: string | null;
	message: string;
};

export const getAlerts =
	(repo: Repo) =>
	async (
		ownerUserId: number,
		now: () => Date
	): Promise<Result<{ results: DerivedAlert[] }, DomainError>> => {
		try {
			const nowIso = now().toISOString();
			const [open, within, overdue, estrus] = await Promise.all([
				repo.findOpenDaysOver60NoAI(ownerUserId, nowIso),
				repo.findCalvingWithin60(ownerUserId, nowIso),
				repo.findCalvingOverdue(ownerUserId, nowIso),
				repo.findEstrusOver20NotPregnant(ownerUserId, nowIso)
			]);

			const alerts: DerivedAlert[] = [];
			for (const r of open) {
				alerts.push({
					alertId: `OPEN_DAYS_OVER60_NO_AI:${r.cattleId}`,
					type: "OPEN_DAYS_OVER60_NO_AI",
					severity: "medium",
					cattleId: r.cattleId,
					cattleName: r.cattleName ?? null,
					cattleEarTagNumber: r.cattleEarTagNumber ?? null,
					dueAt: r.dueAt ?? null,
					message: "最終分娩から60日以上、人工授精未実施"
				});
			}
			for (const r of within) {
				alerts.push({
					alertId: `CALVING_WITHIN_60:${r.cattleId}`,
					type: "CALVING_WITHIN_60",
					severity: "medium",
					cattleId: r.cattleId,
					cattleName: r.cattleName ?? null,
					cattleEarTagNumber: r.cattleEarTagNumber ?? null,
					dueAt: r.dueAt ?? null,
					message: "分娩予定日まで60日以内（エサ強化）"
				});
			}
			for (const r of overdue) {
				alerts.push({
					alertId: `CALVING_OVERDUE:${r.cattleId}`,
					type: "CALVING_OVERDUE",
					severity: "high",
					cattleId: r.cattleId,
					cattleName: r.cattleName ?? null,
					cattleEarTagNumber: r.cattleEarTagNumber ?? null,
					dueAt: r.dueAt ?? null,
					message: "分娩予定日を経過"
				});
			}
			for (const r of estrus) {
				alerts.push({
					alertId: `ESTRUS_OVER20_NOT_PREGNANT:${r.cattleId}`,
					type: "ESTRUS_OVER20_NOT_PREGNANT",
					severity: "low",
					cattleId: r.cattleId,
					cattleName: r.cattleName ?? null,
					cattleEarTagNumber: r.cattleEarTagNumber ?? null,
					dueAt: r.dueAt ?? null,
					message: "発情から20日経過（再発情を確認）"
				});
			}

			const severityOrder: Record<DerivedAlert["severity"], number> = {
				high: 3,
				medium: 2,
				low: 1
			};
			alerts.sort((a, b) => {
				const sv = severityOrder[b.severity] - severityOrder[a.severity];
				if (sv !== 0) return sv;
				const ta = a.dueAt
					? new Date(a.dueAt).getTime()
					: Number.MAX_SAFE_INTEGER;
				const tb = b.dueAt
					? new Date(b.dueAt).getTime()
					: Number.MAX_SAFE_INTEGER;
				return ta - tb;
			});

			return ok({ results: alerts.slice(0, 50) });
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "failed to get alerts",
				cause
			});
		}
	};
