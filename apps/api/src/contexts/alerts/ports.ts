export type RawAlertRow = {
	cattleId: number;
	cattleName: string | null;
	cattleEarTagNumber: string | null;
	dueAt: string | null;
};

export interface AlertsRepoPort {
	findOpenDaysOver60NoAI(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;
	findCalvingWithin60(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;
	findCalvingOverdue(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;
	findEstrusOver20NotPregnant(
		ownerUserId: number,
		nowIso: string
	): Promise<RawAlertRow[]>;
}
