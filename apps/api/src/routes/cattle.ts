import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema,
	updateStatusSchema
} from "../contexts/cattle/domain/codecs/input";
import { jwtMiddleware } from "../middleware/jwt";
import type { Bindings } from "../types";

import {
	cattleListResponseSchema,
	cattleResponseSchema,
	cattleStatusCountsResponseSchema,
	cattleStatusUpdateResponseSchema
} from "../contexts/cattle/domain/codecs/output";
import { create as createUC } from "../contexts/cattle/domain/services/create";
import { delete_ as deleteUC } from "../contexts/cattle/domain/services/delete";

import {
	type Deps as GetDetailDeps,
	get as getDetailUC
} from "../contexts/cattle/domain/services/getDetail";
import { search as searchUC } from "../contexts/cattle/domain/services/search";
import { update as updateUC } from "../contexts/cattle/domain/services/update";
import { updateStatus as updateStatusUC } from "../contexts/cattle/domain/services/updateStatus";
import type { CattleId, UserId } from "../shared/brand";
import { makeDeps } from "../shared/config/di";
import { executeUseCase } from "../shared/http/route-helpers";
import { decodeBase64Utf8, encodeBase64Utf8 } from "../shared/utils/base64";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)

	// 牛の一覧（FDMユースケースへ委譲。API契約は維持: results/next_cursor/has_next）
	.get("/", zValidator("query", searchCattleSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;

		// 無効なカーソルは無視して継続（既存E2Eの振る舞い維持）
		const safeDecodeCursor = (s: string | undefined) => {
			try {
				if (!s) return undefined;
				const decoded = decodeBase64Utf8(s);
				const parsed = JSON.parse(decoded);
				if (
					parsed &&
					typeof parsed.id === "number" &&
					Object.prototype.hasOwnProperty.call(parsed, "value")
				) {
					return parsed as { id: number; value: string | number };
				}
				return undefined;
			} catch (_e) {
				return undefined;
			}
		};

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const q = c.req.valid("query");

				const result = await searchUC({ repo: deps.cattleRepo })({
					ownerUserId: userId as unknown as UserId,
					cursor: safeDecodeCursor(q.cursor),
					limit: q.limit,
					sortBy: q.sort_by,
					sortOrder: q.sort_order,
					search: q.search,
					growthStage: q.growth_stage,
					gender: q.gender,
					status: q.status,
					hasAlert: q.has_alert
				});

				if (!result.ok) return result;

				const hasNext = result.value.length > q.limit;
				const items = hasNext ? result.value.slice(0, -1) : result.value;
				let nextCursor: string | null = null;
				if (hasNext && items.length > 0) {
					const lastItem = items[items.length - 1] as unknown as {
						cattleId: number;
						name: string | null;
						birthday: string | null;
					};
					const cursorValue =
						q.sort_by === "days_old"
							? Math.floor(
									(new Date().getTime() -
										new Date(lastItem.birthday ?? "").getTime()) /
										(1000 * 60 * 60 * 24)
								)
							: q.sort_by === "id"
								? lastItem.cattleId
								: lastItem.name;
					nextCursor = encodeBase64Utf8(
						JSON.stringify({ id: lastItem.cattleId, value: cursorValue })
					);
				}

				return {
					ok: true,
					value: cattleListResponseSchema.parse({
						results: items,
						next_cursor: nextCursor,
						has_next: hasNext
					})
				};
			},
			{ envelope: "data" }
		);
	})

	// ステータス別頭数（詳細より先に定義して/:idに食われないように）
	.get("/status-counts", async (c) => {
		const userId = c.get("jwtPayload").userId as unknown as UserId;

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const rows = await deps.cattleRepo.countByStatus(userId);
				const result: Record<string, number> = {
					HEALTHY: 0,
					PREGNANT: 0,
					RESTING: 0,
					TREATING: 0,
					SHIPPED: 0,
					DEAD: 0
				};
				for (const r of rows) {
					if (r.status) result[r.status as string] = r.count;
				}
				return {
					ok: true,
					value: cattleStatusCountsResponseSchema.parse({ counts: result })
				};
			},
			{ envelope: "data" }
		);
	})

	/**
	 * 牛の詳細情報取得エンドポイント
	 *
	 * 認証されたユーザーが所有する牛の詳細情報を取得します。
	 * 基本情報に加えて、関連するイベント、血統情報、母牛情報、繁殖状況も含まれます。
	 *
	 * @param c - Honoコンテキスト
	 * @returns 牛の詳細情報（JSON形式）
	 *
	 * @throws {401} 認証されていない場合
	 * @throws {403} 他のユーザーの牛にアクセスしようとした場合
	 * @throws {404} 指定された牛が見つからない場合
	 *
	 * @example
	 * ```bash
	 * GET /api/v1/cattle/123
	 * Authorization: Bearer <jwt_token>
	 * ```
	 *
	 * @example Response
	 * ```json
	 * {
	 *   "data": {
	 *     "cattleId": 123,
	 *     "name": "サンプル牛",
	 *     "identificationNumber": 1001,
	 *     "earTagNumber": 2001,
	 *     "gender": "FEMALE",
	 *     "birthday": "2020-01-15T00:00:00.000Z",
	 *     "growthStage": "FIRST_CALVED",
	 *     "status": "HEALTHY",
	 *     "events": [...],
	 *     "bloodline": {...},
	 *     "motherInfo": {...},
	 *     "breedingStatus": {...},
	 *     "breedingSummary": {...}
	 *   }
	 * }
	 * ```
	 */
	.get("/:id", async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const userId = c.get("jwtPayload").userId as unknown as UserId;

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const result = await getDetailUC({
					repo: deps.cattleRepo,
					eventsRepo: deps.eventsRepo,
					alertsRepo: deps.alertsRepo,
					details: deps.cattleDetails
				})({ id, requesterUserId: userId });

				if (!result.ok) return result;

				const parsed = cattleResponseSchema.parse(result.value);
				return { ok: true, value: parsed };
			},
			{ envelope: "data" }
		);
	})

	// 牛を新規登録（FDMユースケースへ完全移行。契約は維持）
	/**
	 * 牛の新規登録エンドポイント
	 *
	 * 認証されたユーザーの所有牛として、新しい牛レコードを作成します。
	 * 入力は `createCattleSchema` によりバリデーションされ、作成後は
	 * 作成された牛の情報を返します。`breedingStatus` が含まれる場合は、
	 * 繁殖初期データを関連ユースケースで初期化します。
	 *
	 * @remarks
	 * - リクエストボディ主要フィールドの一例:
	 *   - `name` (string | null): 名称
	 *   - `identificationNumber` (number): 識別番号（必須、正の数）
	 *   - `earTagNumber` (number | null): 耳標番号
	 *   - `gender` ("MALE" | "FEMALE")
	 *   - `birthday` (string | null, ISO8601): 生年月日
	 *   - `growthStage` (enum | null): 成育段階
	 *   - `status` (enum | null): 健康/出荷などの状態（未指定時は HEALTHY）
	 *   - `breedingStatus` (object | null): 初期繁殖データ（任意）
	 *
	 * @see ../contexts/cattle/domain/services/create.create
	 * @see ../contexts/cattle/domain/model/cattle.NewCattleProps
	 *
	 * @param c - Honoコンテキスト
	 * @returns 作成された牛の詳細（JSON形式）。成功時は 201 を返します。
	 *
	 * @throws {400} 入力バリデーションに失敗した場合
	 * @throws {401} 認証されていない場合
	 * @throws {403} 他ユーザーの資源に対する操作が行われた場合
	 * @throws {409} 競合（識別番号の重複など）が発生した場合
	 * @throws {500} サーバー内部エラー
	 *
	 * @example
	 * ```bash
	 * POST /api/v1/cattle
	 * Authorization: Bearer <jwt_token>
	 * Content-Type: application/json
	 *
	 * {
	 *   "name": "サンプル牛",
	 *   "identificationNumber": 1001,
	 *   "earTagNumber": 2001,
	 *   "gender": "FEMALE",
	 *   "birthday": "2020-01-15T00:00:00.000Z",
	 *   "growthStage": "FIRST_CALVED",
	 *   "status": "HEALTHY",
	 *   "breedingStatus": { "parity": 0, "breedingMemo": "初期登録" }
	 * }
	 * ```
	 *
	 * @example Response
	 * ```json
	 * {
	 *   "data": {
	 *     "cattleId": 456,
	 *     "name": "サンプル牛",
	 *     "identificationNumber": 1001,
	 *     "earTagNumber": 2001,
	 *     "gender": "FEMALE",
	 *     "birthday": "2020-01-15T00:00:00.000Z",
	 *     "growthStage": "FIRST_CALVED",
	 *     "status": "HEALTHY"
	 *   }
	 * }
	 * ```
	 */
	.post("/", zValidator("json", createCattleSchema), async (c) => {
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const result = await createUC({
					cattleRepo: deps.cattleRepo,
					clock: deps.clock
				})({
					...data,
					ownerUserId: userId as unknown as UserId,
					identificationNumber: data.identificationNumber as unknown as import(
						"../contexts/cattle/domain/model"
					).IdentificationNumber,
					earTagNumber: data.earTagNumber as unknown as import(
						"../contexts/cattle/domain/model"
					).EarTagNumber,
					birthday: data.birthday ? new Date(data.birthday) : null
				});

				if (!result.ok) return result;

				// Initialize breeding data via breeding UC when provided
				if (data.breedingStatus && result.value.cattleId) {
					const deps2 = makeDeps(c.env.DB, { now: () => new Date() });
					const { initializeBreeding } = await import(
						"../contexts/breeding/domain/services/breeding"
					);
					await initializeBreeding({
						breedingRepo: deps2.breedingRepo,
						clock: deps2.clock
					})({
						requesterUserId: userId as unknown as UserId,
						cattleId: result.value.cattleId as unknown as CattleId,
						initialParity: data.breedingStatus.parity ?? 0,
						memo: data.breedingStatus.breedingMemo ?? null
					});
				}

				const parsed = cattleResponseSchema.safeParse(result.value);
				return {
					ok: true,
					value: parsed.success ? parsed.data : result.value
				};
			},
			{ successStatus: 201, envelope: "data" }
		);
	})

	// 牛を編集（FDMユースケースへ委譲。breedingの付帯更新はUC/Portへ集約済み）
	.patch("/:id", zValidator("json", updateCattleSchema), async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const patch = c.req.valid("json");
		const userId = c.get("jwtPayload").userId as unknown as UserId;

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const result = await updateUC({
					repo: deps.cattleRepo,
					clock: deps.clock,
					breedingRepo: deps.breedingRepo
				})({
					requesterUserId: userId,
					id,
					patch: patch as Partial<
						Pick<
							import("../contexts/cattle/domain/model/cattle").Cattle,
							| "name"
							| "gender"
							| "birthday"
							| "growthStage"
							| "breed"
							| "status"
							| "producerName"
							| "barn"
							| "breedingValue"
							| "notes"
						>
					> & {
						breedingStatus?: {
							parity?: number | null;
							expectedCalvingDate?: string | null;
							scheduledPregnancyCheckDate?: string | null;
							daysAfterCalving?: number | null;
							daysOpen?: number | null;
							pregnancyDays?: number | null;
							daysAfterInsemination?: number | null;
							inseminationCount?: number | null;
							breedingMemo?: string | null;
							isDifficultBirth?: boolean | null;
						};
						breedingSummary?: {
							totalInseminationCount?: number | null;
							averageDaysOpen?: number | null;
							averagePregnancyPeriod?: number | null;
							averageCalvingInterval?: number | null;
							difficultBirthCount?: number | null;
							pregnancyHeadCount?: number | null;
							pregnancySuccessRate?: number | null;
						};
					}
				});

				if (!result.ok) return result;

				const parsed = cattleResponseSchema.safeParse(result.value);
				return {
					ok: true,
					value: parsed.success ? parsed.data : result.value
				};
			},
			{ envelope: "data" }
		);
	})

	// ステータス更新
	.patch("/:id/status", zValidator("json", updateStatusSchema), async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const { status, reason } = c.req.valid("json");
		const userId = c.get("jwtPayload").userId as unknown as UserId;

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const result = await updateStatusUC({
					repo: deps.cattleRepo,
					clock: deps.clock
				})({
					requesterUserId: userId,
					id,
					newStatus: status,
					reason: reason ?? null
				});

				if (!result.ok) return result;

				const parsed = cattleStatusUpdateResponseSchema.safeParse(result.value);
				return {
					ok: true,
					value: parsed.success ? parsed.data : result.value
				};
			},
			{ envelope: "data" }
		);
	})

	// 牛を削除
	.delete("/:id", async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const userId = c.get("jwtPayload").userId as unknown as UserId;

		return executeUseCase(
			c,
			async () => {
				const deps = makeDeps(c.env.DB, { now: () => new Date() });
				const result = await deleteUC({
					repo: deps.cattleRepo,
					breedingRepo: deps.breedingRepo,
					bloodlineRepo: deps.bloodlineRepo,
					motherInfoRepo: deps.motherInfoRepo
				})({
					requesterUserId: userId,
					id
				});

				if (!result.ok) return result;

				return {
					ok: true,
					value: { message: "Cattle deleted successfully" }
				};
			},
			{ successStatus: 204, envelope: "none" }
		);
	});

export default app;
