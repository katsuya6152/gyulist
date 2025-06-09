import { client } from "@/lib/rpc";
import type { InferResponseType } from "hono";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type GetCattleListResType = InferResponseType<
	typeof client.api.v1.cattle.$get,
	200
>;

export type GetCattleDetailResType = InferResponseType<
	(typeof client.api.v1.cattle)[":id"]["$get"],
	200
>;

async function getAuthToken() {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/not-found");
	}

	return token;
}

async function fetchWithAuth<T>(
	fetchFn: (token: string) => Promise<Response>,
): Promise<T> {
	const token = await getAuthToken();
	const res = await fetchFn(token);

	if (!res.ok) {
		if (res.status === 403) {
			redirect("/not-found");
		}
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	}

	return res.json();
}

export async function GetCattleList(): Promise<GetCattleListResType> {
	return fetchWithAuth<GetCattleListResType>((token) =>
		client.api.v1.cattle.$get(
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		),
	);
}

export async function GetCattleDetail(
	id: number | string,
): Promise<GetCattleDetailResType> {
	return fetchWithAuth<GetCattleDetailResType>((token) =>
		client.api.v1.cattle[":id"].$get(
			{
				param: { id: id.toString() },
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		),
	);
}

export async function DeleteCattle(id: number | string): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.cattle[":id"].$delete(
			{
				param: { id: id.toString() },
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		),
	);
}
