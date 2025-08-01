import { client } from "@/lib/rpc";
import type { InferResponseType } from "hono";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type CreateEventInput = {
	cattleId: number;
	eventType:
		| "ESTRUS"
		| "INSEMINATION"
		| "CALVING"
		| "VACCINATION"
		| "SHIPMENT"
		| "HOOF_TRIMMING"
		| "OTHER";
	eventDatetime: string;
	notes?: string;
};

async function getAuthToken() {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/not-found");
	}

	return token;
}

async function fetchWithAuth<T>(
	fetchFn: (token: string) => Promise<Response>,
): Promise<T> {
	const token = await getAuthToken();
	const res = await fetchFn(token);

	if (!res.ok) {
		if (res.status === 403) {
			redirect("/not-found");
		}
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	}

	return res.json();
}

export async function CreateEvent(data: CreateEventInput): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.events.$post(
			{
				json: data,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		),
	);
}
