import { cookies } from "next/headers";
import { client } from "../lib/rpc";

type User = {
	id: number;
	userName: string | null;
	email: string;
	passwordHash: string;
	isVerified: boolean | null;
	verificationToken: string | null;
	createdAt: string | null;
	updatedAt: string | null;
};

export async function fetchUser(id: string): Promise<User> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		throw new Error("認証トークンが見つかりません");
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
		throw new Error("ユーザー情報の取得に失敗しました");
	}

	return res.json();
}
