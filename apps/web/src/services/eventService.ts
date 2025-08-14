import { fetchWithAuth, getAuthToken } from "@/lib/api-client";
import { client } from "@/lib/rpc";
import { redirect } from "next/navigation";

type EventType =
	| "ESTRUS"
	| "INSEMINATION"
	| "CALVING"
	| "VACCINATION"
	| "SHIPMENT"
	| "HOOF_TRIMMING"
	| "PREGNANCY_CHECK"
	| "ABORTION"
	| "STILLBIRTH"
	| "DIAGNOSIS"
	| "TREATMENT_STARTED"
	| "TREATMENT_COMPLETED"
	| "MEDICATION"
	| "ARRIVAL"
	| "WEIGHT_MEASURED"
	| "WEANING"
	| "START_FATTENING"
	| "OTHER";

export type CreateEventInput = {
	cattleId: number;
	eventType: EventType;
	eventDatetime: string;
	notes?: string;
};

export type UpdateEventInput = {
	eventType: EventType;
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

export async function CreateEvent(data: CreateEventInput): Promise<void> {
	return fetchWithAuth<void>((token) =>
		client.api.v1.events.$post(
			{
				json: data
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

export async function SearchEvents(
	query: SearchEventsQuery = {}
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
					cursor: query.cursor?.toString()
				}
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)
	);
}

// Server Actions用の関数
export async function UpdateEventServer(
	eventId: number,
	data: UpdateEventInput
): Promise<{ success: boolean; error?: string }> {
	try {
		const token = await getAuthToken();
		const response = await client.api.v1.events[":id"].$patch(
			{
				param: { id: eventId.toString() },
				json: data
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		if (!response.ok) {
			if (
				(response.status as number) === 401 ||
				(response.status as number) === 403
			) {
				redirect("/login");
			}
			const error = await response.text();
			return {
				success: false,
				error: error || "イベントの更新に失敗しました"
			};
		}

		return {
			success: true
		};
	} catch (error) {
		console.error("Failed to update event:", error);
		return {
			success: false,
			error: "イベントの更新に失敗しました"
		};
	}
}

export async function DeleteEventServer(
	eventId: number
): Promise<{ success: boolean; error?: string }> {
	try {
		const token = await getAuthToken();
		const response = await client.api.v1.events[":id"].$delete(
			{
				param: { id: eventId.toString() }
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		if (!response.ok) {
			if (
				(response.status as number) === 401 ||
				(response.status as number) === 403
			) {
				redirect("/login");
			}
			const error = await response.text();
			return {
				success: false,
				error: error || "イベントの削除に失敗しました"
			};
		}

		return {
			success: true
		};
	} catch (error) {
		console.error("Failed to delete event:", error);
		return {
			success: false,
			error: "イベントの削除に失敗しました"
		};
	}
}
