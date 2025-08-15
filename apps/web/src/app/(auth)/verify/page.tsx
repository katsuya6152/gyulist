import { client } from "@/lib/rpc";
import { notFound, redirect } from "next/navigation";

export const runtime = "edge";

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
	if (!res.ok) {
		return <div className="p-6 text-center">{res.statusText}</div>;
	}
	const data = await res.json();

	redirect(`/complete-registration?token=${token}`);
}
