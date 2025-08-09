"use server";

import { verifyAndGetUserId } from "@/lib/jwt";
import type { UpdateEventInput } from "@/services/eventService";
import { DeleteEventServer, UpdateEventServer } from "@/services/eventService";
export async function updateEventAction(
	eventId: number,
	data: UpdateEventInput,
) {
	const userId = await verifyAndGetUserId();
	if (userId === 1) {
		return { success: true, message: "demo" };
	}
	return await UpdateEventServer(eventId, data);
}

export async function deleteEventAction(eventId: number) {
	const userId = await verifyAndGetUserId();
	if (userId === 1) {
		return { success: true, message: "demo" };
	}
	return await DeleteEventServer(eventId);
}
