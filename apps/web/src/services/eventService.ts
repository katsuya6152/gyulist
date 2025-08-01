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

export type SearchEventsQuery = {
	cattleId?: number;
	eventType?: string;
	startDate?: string;
	endDate?: string;
	limit?: number;
	cursor?: number;
};

// API response type for search events
export type SearchEventsResType = {
	results: Array<{
		eventId: number;
		cattleId: number;
		eventType: string;
		eventDatetime: string;
		notes: string | null;
		createdAt: string;
		updatedAt: string;
		cattleName: string;
		cattleEarTagNumber: string;
	}>;
	nextCursor: number | null;
	hasNext: boolean;
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

export async function SearchEvents(
	query: SearchEventsQuery = {},
): Promise<SearchEventsResType> {
	return fetchWithAuth<SearchEventsResType>((token) =>
		client.api.v1.events.$get(
			{
				query: {
					cattleId: query.cattleId?.toString(),
					eventType: query.eventType,
					startDate: query.startDate,
					endDate: query.endDate,
					limit: query.limit?.toString() || "20",
					cursor: query.cursor?.toString(),
				},
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		),
	);
}
