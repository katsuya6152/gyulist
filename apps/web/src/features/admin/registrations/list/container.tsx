import { headers } from "next/headers";
import AdminRegistrationsPresentation from "./presentational";

export const runtime = "edge";

interface Props {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminRegistrationsContainer({
	searchParams,
}: Props) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(searchParams)) {
		if (Array.isArray(value)) {
			params.set(key, value[0]);
		} else if (value) {
			params.set(key, value);
		}
	}
	const auth = headers().get("authorization") || "";
	const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
	const res = await fetch(
		`${apiBase}/api/v1/admin/registrations?${params.toString()}`,
		{
			headers: { authorization: auth },
			cache: "no-store",
		},
	);
	const data = await res.json();
	const registrations = data.results || [];
	return (
		<AdminRegistrationsPresentation
			registrations={registrations}
			params={params}
		/>
	);
}
