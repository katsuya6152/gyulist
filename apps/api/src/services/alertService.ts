import type { AnyD1Database } from "drizzle-orm/d1";
import {
	type RawAlertRow,
	findCalvingOverdue,
	findCalvingWithin60,
	findEstrusOver20NotPregnant,
	findOpenDaysOver60NoAI,
} from "../repositories/alertRepository";

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

export async function getAlerts(db: AnyD1Database, ownerUserId: number) {
	const nowIso = new Date().toISOString();
	const openDaysRows: RawAlertRow[] = await findOpenDaysOver60NoAI(
		db,
		ownerUserId,
		nowIso,
	);
	const calvingSoonRows: RawAlertRow[] = await findCalvingWithin60(
		db,
		ownerUserId,
		nowIso,
	);
	const calvingOverdueRows: RawAlertRow[] = await findCalvingOverdue(
		db,
		ownerUserId,
		nowIso,
	);
	const estrusRows: RawAlertRow[] = await findEstrusOver20NotPregnant(
		db,
		ownerUserId,
		nowIso,
	);

	const alerts: DerivedAlert[] = [];

	for (const r of openDaysRows) {
		alerts.push({
			alertId: `OPEN_DAYS_OVER60_NO_AI:${r.cattleId}`,
			type: "OPEN_DAYS_OVER60_NO_AI",
			severity: "medium",
			cattleId: r.cattleId,
			cattleName: r.cattleName ?? null,
			cattleEarTagNumber: r.cattleEarTagNumber ?? null,
			dueAt: r.dueAt ?? null,
			message: "最終分娩から60日以上、人工授精未実施",
		});
	}

	for (const r of calvingSoonRows) {
		alerts.push({
			alertId: `CALVING_WITHIN_60:${r.cattleId}`,
			type: "CALVING_WITHIN_60",
			severity: "medium",
			cattleId: r.cattleId,
			cattleName: r.cattleName ?? null,
			cattleEarTagNumber: r.cattleEarTagNumber ?? null,
			dueAt: r.dueAt ?? null,
			message: "分娩予定日まで60日以内（エサ強化）",
		});
	}

	for (const r of calvingOverdueRows) {
		alerts.push({
			alertId: `CALVING_OVERDUE:${r.cattleId}`,
			type: "CALVING_OVERDUE",
			severity: "high",
			cattleId: r.cattleId,
			cattleName: r.cattleName ?? null,
			cattleEarTagNumber: r.cattleEarTagNumber ?? null,
			dueAt: r.dueAt ?? null,
			message: "分娩予定日を経過",
		});
	}

	for (const r of estrusRows) {
		alerts.push({
			alertId: `ESTRUS_OVER20_NOT_PREGNANT:${r.cattleId}`,
			type: "ESTRUS_OVER20_NOT_PREGNANT",
			severity: "low",
			cattleId: r.cattleId,
			cattleName: r.cattleName ?? null,
			cattleEarTagNumber: r.cattleEarTagNumber ?? null,
			dueAt: r.dueAt ?? null,
			message: "発情から20日経過（再発情を確認）",
		});
	}

	// ソート: severity desc -> 期限が近い順（nullは最後）
	const severityOrder: Record<DerivedAlert["severity"], number> = {
		high: 3,
		medium: 2,
		low: 1,
	};

	alerts.sort((a, b) => {
		const sv = severityOrder[b.severity] - severityOrder[a.severity];
		if (sv !== 0) return sv;
		const ta = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
		const tb = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
		return ta - tb;
	});

	return { results: alerts.slice(0, 50) };
}
