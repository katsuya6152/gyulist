/**
 * Export Registrations CSV Use Case
 *
 * 管理者向けの事前登録CSVエクスポートユースケース
 */

import type { RegistrationError } from "../../../domain/errors/registration/RegistrationErrors";
import type { RegistrationRepository } from "../../../domain/ports/registration";
import type { Registration } from "../../../domain/types/registration";
import type { Result } from "../../../shared/result";

// ============================================================================
// Use Case Types
// ============================================================================

export type ExportRegistrationsCsvInput = {
	readonly q?: string;
	readonly from?: number;
	readonly to?: number;
	readonly source?: string;
	readonly limit: number;
	readonly offset: number;
};

export type ExportRegistrationsCsvResult = {
	readonly csvData: string;
};

export type ExportRegistrationsCsvDeps = {
	registrationRepo: RegistrationRepository;
};

export type ExportRegistrationsCsvUseCase = (
	deps: ExportRegistrationsCsvDeps
) => (
	input: ExportRegistrationsCsvInput
) => Promise<Result<ExportRegistrationsCsvResult, RegistrationError>>;

// ============================================================================
// Use Case Implementation
// ============================================================================

/**
 * 事前登録CSVエクスポートユースケース
 *
 * 管理者向けに事前登録データをCSV形式でエクスポートします。
 * 検索、フィルタリングに対応しています。
 *
 * @param deps - ユースケースが利用する依存関係
 * @returns 関数型のユースケース実行関数
 */
export const exportRegistrationsCsvUseCase: ExportRegistrationsCsvUseCase =
	(deps: ExportRegistrationsCsvDeps) =>
	async (
		input: ExportRegistrationsCsvInput
	): Promise<Result<ExportRegistrationsCsvResult, RegistrationError>> => {
		try {
			// 事前登録データを取得
			const result = await deps.registrationRepo.search({
				query: input.q,
				fromDate: input.from ? new Date(input.from) : undefined,
				toDate: input.to ? new Date(input.to) : undefined,
				referralSource: input.source,
				limit: input.limit,
				offset: input.offset
			});

			if (!result.ok) {
				return result;
			}

			// CSVデータを生成
			const csvData = generateCsvData(result.value.items);

			return {
				ok: true,
				value: {
					csvData
				}
			};
		} catch (error) {
			return {
				ok: false,
				error: {
					type: "InfraError",
					message: "Failed to export registrations CSV",
					cause: error
				}
			};
		}
	};

/**
 * CSVデータを生成
 */
function generateCsvData(registrations: Registration[]): string {
	const headers = [
		"ID",
		"Email",
		"Referral Source",
		"Status",
		"Locale",
		"Created At"
	];
	const rows = registrations.map((reg) => [
		reg.id,
		reg.email,
		reg.referralSource || "",
		reg.status,
		reg.locale,
		new Date(reg.createdAt * 1000).toISOString()
	]);

	const csvContent = [headers, ...rows]
		.map((row) =>
			row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
		)
		.join("\n");

	return csvContent;
}
