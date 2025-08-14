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
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
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
