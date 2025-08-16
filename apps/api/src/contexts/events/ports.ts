import type { Brand } from "../../shared/brand";

export type EventId = Brand<number, "EventId">;
export type CattleId = Brand<number, "CattleId">;
export type UserId = Brand<number, "UserId">;

export type EventType = "INSEMINATION" | "CALVING" | "ESTRUS" | (string & {});

export type Event = {
	eventId: EventId;
	cattleId: CattleId;
	eventType: EventType;
	eventDatetime: string;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	cattleName?: string | null;
	cattleEarTagNumber?: number | null;
};

export interface EventsRepoPort {
	findById(eventId: EventId, ownerUserId: UserId): Promise<Event | null>;
	listByCattleId(cattleId: CattleId, ownerUserId: UserId): Promise<Event[]>;
	search(q: {
		ownerUserId: UserId;
		cattleId?: CattleId;
		eventType?: EventType;
		startDate?: string;
		endDate?: string;
		cursor?: number | null;
		limit: number;
	}): Promise<{
		results: Event[];
		nextCursor: number | null;
		hasNext: boolean;
	}>;
	create(
		dto: Omit<Event, "eventId" | "createdAt" | "updatedAt">
	): Promise<Event>;
	update(eventId: EventId, partial: Partial<Event>): Promise<Event>;
	delete(eventId: EventId): Promise<void>;
}
