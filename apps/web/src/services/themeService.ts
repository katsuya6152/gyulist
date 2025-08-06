import { client } from "@/lib/rpc";
import type { InferResponseType } from "hono";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Theme = "light" | "dark" | "system";

export type UpdateThemeInput = {
	theme: Theme;
};

export type UpdateThemeResType = InferResponseType<
	(typeof client.api.v1.users)[":id"]["theme"]["$patch"],
	200
>;

async function getAuthToken() {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	return token;
}

async function fetchWithAuth<T>(
	fetchFn: (token: string) => Promise<Response>,
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

export async function updateTheme(
	userId: number,
	theme: Theme,
): Promise<UpdateThemeResType> {
	return fetchWithAuth<UpdateThemeResType>((token) =>
		client.api.v1.users[":id"].theme.$patch(
			{
				param: { id: userId.toString() },
				json: { theme },
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		),
	);
}
