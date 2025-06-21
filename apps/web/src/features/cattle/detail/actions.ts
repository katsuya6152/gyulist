"use server";

import { client } from "@/lib/rpc";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteCattleAction(cattleId: string) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			redirect("/not-found");
		}

		const response = await client.api.v1.cattle[":id"].$delete(
			{
				param: {
					id: cattleId,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (response.status !== 200) {
			const error = await response.text();
			return {
				success: false,
				error: error || "牛の削除に失敗しました",
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Failed to delete cattle:", error);
		return {
			success: false,
			error: "牛の削除に失敗しました",
		};
	}
}
