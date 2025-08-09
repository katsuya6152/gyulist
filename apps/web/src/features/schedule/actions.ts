"use server";

import { createDemoResponse, isDemo } from "@/lib/api-client";
import { verifyAndGetUserId } from "@/lib/jwt";
import type { UpdateEventInput } from "@/services/eventService";
import { DeleteEventServer, UpdateEventServer } from "@/services/eventService";

export async function updateEventAction(
	eventId: number,
	data: UpdateEventInput,
) {
	const userId = await verifyAndGetUserId();
	if (isDemo(userId)) {
		return createDemoResponse(true);
	}
	return await UpdateEventServer(eventId, data);
}

export async function deleteEventAction(eventId: number) {
	const userId = await verifyAndGetUserId();
	if (isDemo(userId)) {
		return createDemoResponse(true);
	}
	return await DeleteEventServer(eventId);
}
