import { DEMO_USER_ID } from "@/constants/app";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthToken(): Promise<string> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	return token;
}

export async function fetchWithAuth<T>(
	fetchFn: (token: string) => Promise<Response>
): Promise<T> {
	const token = await getAuthToken();
	const res = await fetchFn(token);

	if (!res.ok) {
		if (res.status === 401 || res.status === 403) {
			redirect("/login");
		}

		// エラーの詳細を取得
		let errorMessage = `API request failed: ${res.status} ${res.statusText}`;
		try {
			const errorData = (await res.json()) as { error?: string };
			console.error("API Error details:", errorData);
			if (errorData.error) {
				errorMessage = errorData.error;
			}
		} catch {
			// JSON解析に失敗した場合はデフォルトメッセージを使用
		}

		throw new Error(errorMessage);
	}

	// Handle 204 No Content and empty bodies gracefully
	if (res.status === 204) {
		return undefined as unknown as T;
	}
	const contentLength = res.headers.get("content-length");
	if (contentLength === "0" || contentLength === null) {
		try {
			return (await res.json()) as T;
		} catch {
			return undefined as unknown as T;
		}
	}

	return res.json();
}

export function isDemo(userId: number): boolean {
	return userId === DEMO_USER_ID;
}

export function createDemoResponse(type: "success"): {
	status: "success";
	message: "demo";
};
export function createDemoResponse(type: true): {
	success: true;
	message: "demo";
};
export function createDemoResponse(
	type: "success" | true
): { status: "success"; message: "demo" } | { success: true; message: "demo" } {
	if (type === "success") {
		return { status: "success" as const, message: "demo" };
	}
	return { success: true, message: "demo" };
}
