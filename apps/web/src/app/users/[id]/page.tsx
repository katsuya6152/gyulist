import { LogoutButton } from "@/components/logout-button";
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
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-xl font-bold">User Detail</h1>
				<LogoutButton />
			</div>
			<div className="bg-white rounded-lg shadow p-6">
				<p className="mb-2">
					<span className="font-semibold">ID:</span> {user.id}
				</p>
				<p className="mb-2">
					<span className="font-semibold">Name:</span> {user.userName}
				</p>
				<p className="mb-2">
					<span className="font-semibold">Email:</span> {user.email}
				</p>
			</div>
		</div>
	);
}
