import { client } from "@/lib/rpc";
import type { InferResponseType } from "hono";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type GetCattleListResType = InferResponseType<
	typeof client.api.v1.cattle.$get,
	200
>;

export async function GetCattleList(): Promise<GetCattleListResType> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	const res = await client.api.v1.cattle.$get(
		{},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!res.ok) {
		redirect("/login");
	}
	const data = await res.json();
	return data;
}
