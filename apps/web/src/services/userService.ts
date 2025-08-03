import { client } from "@/lib/rpc";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type User = {
	id: number;
	userName: string | null;
	email: string;
	isVerified: boolean | null;
	verificationToken: string | null;
	lastLoginAt: string | null;
	createdAt: string | null;
	updatedAt: string | null;
};

export async function fetchUser(id: string): Promise<User> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	const res = await client.api.v1.users[":id"].$get(
		{ param: { id } },
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!res.ok) {
		if (res.status === 401 || res.status === 403) {
			redirect("/login");
		}
		throw new Error("ユーザー情報の取得に失敗しました");
	}

	return res.json();
}
