import { fetchWithAuth } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import type { UpdateThemeResponse } from "@repo/api";
import type { InferResponseType } from "hono";

export type Theme = "light" | "dark" | "system";

export type UpdateThemeInput = {
	theme: Theme;
};

export type UpdateThemeResType = UpdateThemeResponse;

export async function updateTheme(
	userId: number,
	theme: Theme
): Promise<UpdateThemeResType> {
	return fetchWithAuth<{ data: UpdateThemeResType }>((token) =>
		client.api.v1.users[":id"].theme.$patch(
			{
				param: { id: userId.toString() },
				json: { theme }
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	).then((r) => r.data);
}
