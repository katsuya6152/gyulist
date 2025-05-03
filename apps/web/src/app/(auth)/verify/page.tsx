import { client } from "@/lib/rpc";
import { notFound, redirect } from "next/navigation";

type Props = {
	searchParams: Promise<{ token?: string }>;
};

export default async function VerifyPage({ searchParams }: Props) {
	const params = await searchParams;
	const token = typeof params?.token === "string" ? params.token : undefined;

	if (!token) {
		notFound();
	}

	const res = await client.api.v1.auth.verify.$post({ json: { token } });
	const data = await res.json();

	if (!data.success) {
		return <div className="p-6 text-center">{data.message}</div>;
	}

	redirect(`/complete-registration?token=${token}`);
}
