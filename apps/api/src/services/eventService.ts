import type { AnyD1Database } from "drizzle-orm/d1";
import { findCattleById } from "../repositories/cattleRepository";
import {
	createEvent,
	deleteEvent,
	findEventById,
	findEventsByCattleId,
	searchEvents,
	updateEvent
} from "../repositories/eventRepository";
import type {
	CreateEventInput,
	SearchEventQuery,
	UpdateEventInput
} from "../validators/eventValidator";
import { updateStatus } from "./cattleService";

// イベント一覧取得（牛IDでフィルタ）
export async function getEventsByCattleId(
	db: AnyD1Database,
	cattleId: number,
	ownerUserId: number
) {
	// 牛の存在確認と所有者チェック
	const cattle = await findCattleById(db, cattleId);
	if (!cattle || cattle.ownerUserId !== ownerUserId) {
		throw new Error("牛が見つからないか、アクセス権限がありません");
	}

	return await findEventsByCattleId(db, cattleId, ownerUserId);
}

// イベント検索
export async function searchEventList(
	db: AnyD1Database,
	ownerUserId: number,
	query: SearchEventQuery
) {
	return await searchEvents(db, ownerUserId, query);
}

// イベント詳細取得
export async function getEventById(
	db: AnyD1Database,
	eventId: number,
	ownerUserId: number
) {
	const event = await findEventById(db, eventId, ownerUserId);
	if (!event) {
		throw new Error("イベントが見つからないか、アクセス権限がありません");
	}
	return event;
}

// イベント作成
export async function createNewEvent(
	db: AnyD1Database,
	data: CreateEventInput,
	ownerUserId: number
) {
	// 牛の存在確認と所有者チェック
	const cattle = await findCattleById(db, data.cattleId);
	if (!cattle || cattle.ownerUserId !== ownerUserId) {
		throw new Error("牛が見つからないか、アクセス権限がありません");
	}

	// イベント作成
	const newEvent = await createEvent(db, data);

	// ステータス更新
	if (data.eventType === "SHIPMENT") {
		await updateStatus(db, data.cattleId, "SHIPPED", ownerUserId);
	} else if (data.eventType === "CALVING") {
		await updateStatus(db, data.cattleId, "RESTING", ownerUserId);
	}

	// 作成されたイベントの詳細を取得して返す
	return await findEventById(db, newEvent.eventId, ownerUserId);
}

// イベント更新
export async function updateEventData(
	db: AnyD1Database,
	eventId: number,
	data: UpdateEventInput,
	ownerUserId: number
) {
	// イベントの存在確認と所有者チェック
	const existingEvent = await findEventById(db, eventId, ownerUserId);
	if (!existingEvent) {
		throw new Error("イベントが見つからないか、アクセス権限がありません");
	}

	// イベント更新
	const updatedEvent = await updateEvent(db, eventId, data);

	// 更新されたイベントの詳細を取得して返す
	return await findEventById(db, updatedEvent.eventId, ownerUserId);
}

// イベント削除
export async function deleteEventData(
	db: AnyD1Database,
	eventId: number,
	ownerUserId: number
) {
	// イベントの存在確認と所有者チェック
	const existingEvent = await findEventById(db, eventId, ownerUserId);
	if (!existingEvent) {
		throw new Error("イベントが見つからないか、アクセス権限がありません");
	}

	// イベント削除
	await deleteEvent(db, eventId);
}
