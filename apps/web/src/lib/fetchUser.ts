import { client } from "./rpc";

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
	const res = await client.api.users[":id"].$get({ param: { id } });
	if (!res.ok) {
		throw new Error("Failed to fetch user");
	}
	return res.json();
}
