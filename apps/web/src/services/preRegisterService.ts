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
	try {
		const searchParams = new URLSearchParams();

		if (query.q) searchParams.set("q", query.q);
		if (query.from) searchParams.set("from", query.from);
		if (query.to) searchParams.set("to", query.to);
		if (query.source) searchParams.set("source", query.source);
		if (query.limit) searchParams.set("limit", query.limit.toString());
		if (query.offset) searchParams.set("offset", query.offset.toString());

		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
		const url = `${apiUrl}/api/v1/admin/registrations?${searchParams}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Basic ${basicAuthToken}`,
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			// エラーの詳細を取得
			let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
			try {
				const errorData = (await response.json()) as { error?: string };
				console.error("Admin API Error details:", errorData);
				if (errorData.error) {
					errorMessage = errorData.error;
				}
			} catch {
				// JSON解析に失敗した場合はデフォルトメッセージを使用
			}
			throw new Error(errorMessage);
		}

		const data = (await response.json()) as {
			data: { items: RegistrationListItem[]; total: number };
		};

		return {
			items: data.data.items || [],
			total: data.data.total || 0
		};
	} catch (error) {
		console.error("Error fetching registrations:", error);
		// エラー時は空の結果を返す（他のサービスと同様）
		return {
			items: [],
			total: 0
		};
	}
}

export async function downloadRegistrationsCsv(
	query: RegistrationsQuery,
	basicAuthToken: string
): Promise<Blob> {
	try {
		const searchParams = new URLSearchParams();

		if (query.q) searchParams.set("q", query.q);
		if (query.from) searchParams.set("from", query.from);
		if (query.to) searchParams.set("to", query.to);
		if (query.source) searchParams.set("source", query.source);
		if (query.limit) searchParams.set("limit", query.limit.toString());
		if (query.offset) searchParams.set("offset", query.offset.toString());

		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
		const url = `${apiUrl}/api/v1/admin/registrations.csv?${searchParams}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Basic ${basicAuthToken}`
			}
		});

		if (!response.ok) {
			// エラーの詳細を取得
			let errorMessage = `CSV download failed: ${response.status} ${response.statusText}`;
			try {
				const errorData = (await response.json()) as { error?: string };
				console.error("CSV download error details:", errorData);
				if (errorData.error) {
					errorMessage = errorData.error;
				}
			} catch {
				// JSON解析に失敗した場合はデフォルトメッセージを使用
			}
			throw new Error(errorMessage);
		}

		return await response.blob();
	} catch (error) {
		console.error("Error downloading CSV:", error);
		// エラー時は空のCSVを返す
		return new Blob([""], { type: "text/csv" });
	}
}
