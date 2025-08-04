"use server";

import type { UpdateEventInput } from "@/services/eventService";
import { DeleteEventServer, UpdateEventServer } from "@/services/eventService";

export async function updateEventAction(
	eventId: number,
	data: UpdateEventInput,
) {
	return await UpdateEventServer(eventId, data);
}

export async function deleteEventAction(eventId: number) {
	return await DeleteEventServer(eventId);
}
