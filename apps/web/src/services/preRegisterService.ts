import { client } from "@/lib/rpc";
import { z } from "zod";

export const preRegisterSchema = z.object({
	email: z
		.string({ required_error: "必須項目です" })
		.trim()
		.toLowerCase()
		.email("無効なメールアドレスです"),
	referralSource: z.string().optional(),
	turnstileToken: z
		.string({ required_error: "必須項目です" })
		.min(10, "無効な検証トークンです")
});

export type PreRegisterInput = z.infer<typeof preRegisterSchema>;

export type PreRegisterSuccess = {
	ok: true;
	alreadyRegistered?: boolean;
};

export type PreRegisterError = {
	ok: false;
	code: string;
	fieldErrors?: Record<string, string>;
};

export type PreRegisterResponse = PreRegisterSuccess | PreRegisterError;

export async function preRegister(
	data: PreRegisterInput
): Promise<PreRegisterResponse> {
	try {
		const res = await client.api.v1["pre-register"].$post({
			json: data
		});

		if (!res.ok) {
			// HTTPエラーの場合
			return {
				ok: false,
				code: "HTTP_ERROR",
				fieldErrors: {
					email: `HTTP ${res.status}: ${res.statusText}`
				}
			};
		}

		const json = (await res.json()) as unknown as { data: PreRegisterResponse };

		// APIは{ data: { ok: true, ... } }の形式で返す
		if (json.data) {
			return json.data;
		}

		// 予期しないレスポンス形式
		console.warn("Unexpected API response format:", json);
		return {
			ok: false,
			code: "UNEXPECTED_RESPONSE",
			fieldErrors: {
				email: "予期しないレスポンス形式です"
			}
		};
	} catch (error) {
		console.error("Network error during pre-registration:", error);
		return {
			ok: false,
			code: "NETWORK_ERROR",
			fieldErrors: {
				email: "ネットワークエラーが発生しました"
			}
		};
	}
}

// Admin: List registrations (JSON) and CSV download
export type RegistrationsQuery = {
	q?: string;
	from?: string;
	to?: string;
	source?: string;
	limit?: number;
	offset?: number;
};

export type RegistrationListItem = {
	id: string;
	email: string;
	referralSource: string | null;
	status: string;
	locale: string;
	createdAt: number;
	updatedAt: number;
};

export type ListRegistrationsResponse = {
	items: RegistrationListItem[];
	total: number;
};

export async function listRegistrations(
	query: RegistrationsQuery,
	basicAuthToken: string
): Promise<ListRegistrationsResponse> {
	// TODO: APIエンドポイントが実装されていないため一時的にダミーデータを返す
	console.warn("listRegistrations: API endpoint not implemented yet");
	return {
		items: [],
		total: 0
	};
}

export async function downloadRegistrationsCsv(
	query: RegistrationsQuery,
	basicAuthToken: string
): Promise<Blob> {
	// TODO: APIエンドポイントが実装されていないため一時的にダミーデータを返す
	console.warn("downloadRegistrationsCsv: API endpoint not implemented yet");
	return new Blob(["dummy,csv,data"], { type: "text/csv" });
}
