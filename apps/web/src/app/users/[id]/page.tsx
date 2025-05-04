import { fetchUser } from "@/services/userService";
import { notFound } from "next/navigation";

export const runtime = "edge";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export default async function UserPage({ params }: Props) {
	const { id } = await params;

	let userList: Awaited<ReturnType<typeof fetchUser>>;

	try {
		userList = await fetchUser(id);
	} catch (e) {
		console.error(e);
		notFound();
	}

	if (!userList) {
		notFound();
	}

	const user = userList;

	return (
		<div className="p-6">
			<h1 className="text-xl font-bold">User Detail</h1>
			<p>ID: {user.id}</p>
			<p>Name: {user.userName}</p>
			<p>Email: {user.email}</p>
		</div>
	);
}
