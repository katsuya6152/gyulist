import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { update as updateUC } from "../contexts/cattle/domain/services/update";
import { updateStatus as updateCattleStatusUC } from "../contexts/cattle/domain/services/updateStatus";
import {
	createEventSchema,
	searchEventSchema,
	updateEventSchema
} from "../contexts/events/domain/codecs/input";
import {
	eventResponseSchema,
	eventsOfCattleResponseSchema,
	eventsSearchResponseSchema
} from "../contexts/events/domain/codecs/output";
import { create as createEventUC } from "../contexts/events/domain/services/create";
import { delete_ as deleteEventUC } from "../contexts/events/domain/services/delete";
import { createEventHandlerService } from "../contexts/events/domain/services/eventHandlers";
import type { EventHandlerInput } from "../contexts/events/domain/services/eventHandlers";
import { getById as getEventByIdUC } from "../contexts/events/domain/services/get";
import { listByCattle as listEventsByCattleUC } from "../contexts/events/domain/services/list";
import { search as searchEventsUC } from "../contexts/events/domain/services/search";
import { update as updateEventUC } from "../contexts/events/domain/services/update";
import { jwtMiddleware } from "../middleware/jwt";
import { makeDeps } from "../shared/config/di";
import { executeUseCase } from "../shared/http/route-helpers";
import type { Bindings } from "../types";

// ヘルパー関数: 繁殖イベントかどうかを判定
function isBreedingEvent(eventType: string): boolean {
	return ["CALVING", "INSEMINATION", "PREGNANCY_CHECK", "ESTRUS"].includes(
		eventType
	);
}

// ヘルパー関数: イベントデータを繁殖イベントにマッピング
function mapToBreedingEvent(
	data: Record<string, unknown>
): EventHandlerInput | null {
	const eventType = data.eventType as string;
	const cattleId = data.cattleId as number;
	const eventDatetime = data.eventDatetime as string;
	const notes = data.notes as string | null;

	switch (eventType) {
		case "CALVING":
			return {
				cattleId: cattleId as unknown as import("../shared/brand").CattleId,
				eventType: "Calve",
				eventData: {
					timestamp: new Date(eventDatetime),
					memo: notes,
					isDifficultBirth: (data.isDifficultBirth as boolean) || false
				}
			};
		case "INSEMINATION":
			return {
				cattleId: cattleId as unknown as import("../shared/brand").CattleId,
				eventType: "Inseminate",
				eventData: {
					timestamp: new Date(eventDatetime),
					memo: notes
				}
			};
		case "PREGNANCY_CHECK":
			return {
				cattleId: cattleId as unknown as import("../shared/brand").CattleId,
				eventType: "ConfirmPregnancy",
				eventData: {
					timestamp: new Date(eventDatetime),
					memo: notes,
					expectedCalvingDate: data.expectedCalvingDate
						? new Date(data.expectedCalvingDate as string)
						: undefined,
					scheduledPregnancyCheckDate: data.scheduledPregnancyCheckDate
						? new Date(data.scheduledPregnancyCheckDate as string)
						: undefined
				}
			};
		case "ESTRUS":
			return {
				cattleId: cattleId as unknown as import("../shared/brand").CattleId,
				eventType: "StartNewCycle",
				eventData: {
					timestamp: new Date(eventDatetime),
					memo: notes
				}
			};
		default:
			return null;
	}
}

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)

	// イベント一覧・検索（FDM repoへ委譲、契約維持）
	.get("/", zValidator("query", searchEventSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;

		return executeUseCase(
			c,
			async () => {
				const q = c.req.valid("query");
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const result = await searchEventsUC({ repo: deps.eventsRepo })(
					userId as unknown as import("../shared/brand").UserId,
					q
				);

				if (!result.ok) return result;

				// イベントデータの日時フィールドを文字列に変換
				const normalizedResults = result.value.results.map((event) => ({
					...event,
					eventDatetime: event.eventDatetime.toISOString(),
					createdAt: event.createdAt.toISOString(),
					updatedAt: event.updatedAt.toISOString()
				}));

				const normalizedValue = {
					...result.value,
					results: normalizedResults
				};

				return {
					ok: true,
					value: eventsSearchResponseSchema.parse(normalizedValue)
				};
			},
			{ envelope: "data" }
		);
	})

	// 特定の牛のイベント一覧（FDM repoへ委譲、契約維持）
	.get("/cattle/:cattleId", async (c) => {
		const cattleId = Number.parseInt(c.req.param("cattleId"));
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(cattleId)) {
			return executeUseCase(c, async () => ({
				ok: false,
				error: { type: "ValidationError", message: "無効な牛IDです" }
			}));
		}

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const res = await listEventsByCattleUC({ repo: deps.eventsRepo })(
					cattleId as unknown as import("../shared/brand").CattleId,
					userId as unknown as import("../shared/brand").UserId
				);

				if (!res.ok) return res;

				// イベントデータの日時フィールドを文字列に変換
				const normalizedResults = res.value.map((event) => ({
					...event,
					eventDatetime: event.eventDatetime.toISOString(),
					createdAt: event.createdAt.toISOString(),
					updatedAt: event.updatedAt.toISOString()
				}));

				return {
					ok: true,
					value: eventsOfCattleResponseSchema.parse({
						results: normalizedResults
					})
				};
			},
			{ envelope: "data" }
		);
	})

	// イベント詳細
	.get("/:id", async (c) => {
		const eventId = Number.parseInt(c.req.param("id"));
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(eventId)) {
			return executeUseCase(c, async () => ({
				ok: false,
				error: { type: "ValidationError", message: "無効なイベントIDです" }
			}));
		}

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const res = await getEventByIdUC({ repo: deps.eventsRepo })(
					eventId as unknown as import("../contexts/events/ports").EventId,
					userId as unknown as import("../contexts/events/ports").UserId
				);

				if (!res.ok) return res;

				// イベントデータの日時フィールドを文字列に変換
				const normalizedEvent = {
					...res.value,
					eventDatetime: res.value.eventDatetime.toISOString(),
					createdAt: res.value.createdAt.toISOString(),
					updatedAt: res.value.updatedAt.toISOString()
				};

				return {
					ok: true,
					value: eventResponseSchema.parse(normalizedEvent)
				};
			},
			{ envelope: "data" }
		);
	})

	// イベント新規作成
	.post("/", zValidator("json", createEventSchema), async (c) => {
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		console.log("Received event creation request:", data);

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const createdRes = await createEventUC({ repo: deps.eventsRepo })(data);
				if (!createdRes.ok) return createdRes;

				const created = createdRes.value;

				// 副作用: CALVING -> RESTING, SHIPMENT -> 日付により判別, DEATH -> DEAD（契約維持）
				if (
					data.eventType === "SHIPMENT" ||
					data.eventType === "CALVING" ||
					data.eventType === "DEATH"
				) {
					let newStatus: string;
					if (data.eventType === "SHIPMENT") {
						// 日付により出荷予定か出荷完了かを判別
						const eventDate = new Date(data.eventDatetime);
						const now = deps.clock.now();
						newStatus = eventDate > now ? "SCHEDULED_FOR_SHIPMENT" : "SHIPPED";
					} else if (data.eventType === "CALVING") {
						newStatus = "RESTING";
					} else {
						newStatus = "DEAD";
					}

					const res = await updateCattleStatusUC({
						repo: deps.cattleRepo,
						clock: deps.clock
					})({
						requesterUserId: userId as unknown as number,
						id: data.cattleId as unknown as number,
						newStatus,
						reason: null
					} as unknown as Parameters<
						ReturnType<typeof updateCattleStatusUC>
					>[0]);

					if (!res.ok) return res;
				}

				// 副作用: 繁殖イベントの自動計算処理
				if (isBreedingEvent(data.eventType)) {
					const eventHandlerService = createEventHandlerService({
						clock: deps.clock,
						breedingRepo: {
							findByCattleId: deps.breedingRepo.findByCattleId,
							getBreedingHistory: deps.breedingRepo.getBreedingHistory,
							save: (aggregate: unknown) =>
								deps.breedingRepo.save(
									aggregate as import(
										"../contexts/cattle/domain/model/breedingAggregate"
									).BreedingAggregate
								),
							updateBreedingStatusDays:
								deps.breedingRepo.updateBreedingStatusDays
						}
					});

					// イベントハンドラーで繁殖状態を更新
					const breedingEventInput = mapToBreedingEvent(data);
					if (breedingEventInput) {
						const breedingResult =
							await eventHandlerService.handleBreedingEvent(breedingEventInput);

						if (!breedingResult.ok) {
							console.warn(
								"Breeding event handling failed:",
								breedingResult.error
							);
							// イベント作成は成功しているので、警告のみで処理を継続
						} else {
							console.log(
								"Breeding status updated successfully:",
								breedingResult.value.processedEventType
							);
						}
					}
				}

				// 副作用: EXPECTED_CALVING -> 繁殖集約の更新（契約維持）
				if (data.eventType === "EXPECTED_CALVING") {
					// 繁殖集約の更新
					const breedingUpdate = await updateUC({
						repo: deps.cattleRepo,
						clock: deps.clock,
						breedingRepo: deps.breedingRepo
					})({
						requesterUserId: userId as unknown as number,
						id: data.cattleId as unknown as number,
						patch: {},
						breedingStatus: {
							expectedCalvingDate: data.eventDatetime,
							parity: null,
							scheduledPregnancyCheckDate: null,
							daysAfterCalving: null,
							daysOpen: null,
							pregnancyDays: null,
							daysAfterInsemination: null,
							inseminationCount: null,
							breedingMemo: data.notes || null,
							isDifficultBirth: null
						}
					} as unknown as Parameters<ReturnType<typeof updateUC>>[0]);

					if (!breedingUpdate.ok) return breedingUpdate;
				}

				// 副作用: EXPECTED_ESTRUS -> 繁殖集約の更新（契約維持）
				if (data.eventType === "EXPECTED_ESTRUS") {
					// 繁殖集約の更新
					const breedingUpdate = await updateUC({
						repo: deps.cattleRepo,
						clock: deps.clock,
						breedingRepo: deps.breedingRepo
					})({
						requesterUserId: userId as unknown as number,
						id: data.cattleId as unknown as number,
						patch: {},
						breedingStatus: {
							expectedCalvingDate: null,
							parity: null,
							scheduledPregnancyCheckDate: data.eventDatetime,
							daysAfterCalving: null,
							daysOpen: null,
							pregnancyDays: null,
							daysAfterInsemination: null,
							inseminationCount: null,
							breedingMemo: data.notes || null,
							isDifficultBirth: null
						}
					} as unknown as Parameters<ReturnType<typeof updateUC>>[0]);

					if (!breedingUpdate.ok) return breedingUpdate;
				}

				// 副作用: ESTRUS -> 21日後の発情予定イベントを自動作成（契約維持）
				if (data.eventType === "ESTRUS") {
					// 21日後の発情予定日を計算
					const estrusDate = new Date(data.eventDatetime);
					const expectedEstrusDate = new Date(estrusDate);
					expectedEstrusDate.setDate(estrusDate.getDate() + 21);

					// 発情予定イベントを作成
					const expectedEstrusEvent = {
						cattleId: data.cattleId,
						eventType: "EXPECTED_ESTRUS" as const,
						eventDatetime: expectedEstrusDate.toISOString(),
						notes: "前回発情から21日後の発情予定日（自動生成）"
					};

					const autoCreatedRes = await createEventUC({ repo: deps.eventsRepo })(
						expectedEstrusEvent
					);
					if (!autoCreatedRes.ok) {
						// 発情予定イベントの作成に失敗しても、元の発情イベントは成功とする
						// ログに記録するのみ
						console.warn(
							"発情予定イベントの自動作成に失敗:",
							autoCreatedRes.error
						);
					}
				}

				// 副作用: START_FATTENING -> 成長段階を肥育牛に更新（契約維持）
				if (data.eventType === "START_FATTENING") {
					const growthStageUpdate = await updateUC({
						repo: deps.cattleRepo,
						clock: deps.clock,
						breedingRepo: deps.breedingRepo
					})({
						requesterUserId: userId as unknown as number,
						id: data.cattleId as unknown as number,
						patch: {
							growthStage: "FATTENING"
						},
						breedingStatus: null
					} as unknown as Parameters<ReturnType<typeof updateUC>>[0]);

					if (!growthStageUpdate.ok) {
						// 成長段階の更新に失敗しても、元のイベントは成功とする
						// ログに記録するのみ
						console.warn("成長段階の更新に失敗:", growthStageUpdate.error);
					}
				}

				// イベントデータの日時フィールドを文字列に変換
				const normalizedCreated = {
					...created,
					eventDatetime: created.eventDatetime.toISOString(),
					createdAt: created.createdAt.toISOString(),
					updatedAt: created.updatedAt.toISOString()
				};

				const parsed = eventResponseSchema.safeParse(normalizedCreated);
				return {
					ok: true,
					value: parsed.success ? parsed.data : normalizedCreated
				};
			},
			{ successStatus: 201, envelope: "data" }
		);
	})

	// イベント更新
	.patch("/:id", zValidator("json", updateEventSchema), async (c) => {
		const eventId = Number.parseInt(c.req.param("id"));
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(eventId)) {
			return executeUseCase(c, async () => ({
				ok: false,
				error: { type: "ValidationError", message: "無効なイベントIDです" }
			}));
		}

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const updatedRes = await updateEventUC({ repo: deps.eventsRepo })(
					eventId as unknown as import("../shared/brand").Brand<
						number,
						"EventId"
					>,
					data
				);

				if (!updatedRes.ok) return updatedRes;

				// イベントデータの日時フィールドを文字列に変換
				const normalizedUpdated = {
					...updatedRes.value,
					eventDatetime: updatedRes.value.eventDatetime.toISOString(),
					createdAt: updatedRes.value.createdAt.toISOString(),
					updatedAt: updatedRes.value.updatedAt.toISOString()
				};

				const parsed = eventResponseSchema.safeParse(normalizedUpdated);
				return {
					ok: true,
					value: parsed.success ? parsed.data : normalizedUpdated
				};
			},
			{ envelope: "data" }
		);
	})

	// イベント削除
	.delete("/:id", async (c) => {
		const eventId = Number.parseInt(c.req.param("id"));
		const userId = c.get("jwtPayload").userId;

		if (Number.isNaN(eventId)) {
			return executeUseCase(c, async () => ({
				ok: false,
				error: { type: "ValidationError", message: "無効なイベントIDです" }
			}));
		}

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const del = await deleteEventUC({ repo: deps.eventsRepo })(
					eventId as unknown as import("../shared/brand").Brand<
						number,
						"EventId"
					>
				);

				if (!del.ok) return del;

				return {
					ok: true,
					value: { message: "イベントが正常に削除されました" }
				};
			},
			{ successStatus: 204, envelope: "none" }
		);
	});

export default app;
