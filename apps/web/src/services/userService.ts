import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type { InferResponseType } from "hono";

export type GetUserResType = InferResponseType<
	(typeof client.api.v1.users)[":id"]["$get"],
	200
>;

export async function getUserById(userId: number): Promise<GetUserResType> {
	return fetchWithAuth<GetUserResType>((token) =>
		client.api.v1.users[":id"].$get(
			{
				param: { id: userId.toString() }
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}
