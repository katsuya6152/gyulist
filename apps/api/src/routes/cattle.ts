import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema,
	updateStatusSchema
} from "../contexts/cattle/domain/codecs/input";
import { jwtMiddleware } from "../middleware/jwt";
// legacy cattleService usage removed (FDMへ移行)
import type { Bindings } from "../types";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { AnyD1Database } from "drizzle-orm/d1";
import {
	cattleListResponseSchema,
	cattleResponseSchema,
	cattleStatusCountsResponseSchema,
	cattleStatusUpdateResponseSchema
} from "../contexts/cattle/domain/codecs/output";
import { create as createUC } from "../contexts/cattle/domain/services/create";
import { remove as deleteUC } from "../contexts/cattle/domain/services/delete";
import { search as searchUC } from "../contexts/cattle/domain/services/search";
import { update as updateUC } from "../contexts/cattle/domain/services/update";
import { updateStatus as updateStatusUC } from "../contexts/cattle/domain/services/updateStatus";
import {
	bloodline,
	breedingStatus,
	breedingSummary,
	motherInfo
} from "../db/schema";
import type { CattleId, UserId } from "../shared/brand";
import { makeDeps } from "../shared/config/di";
import { toHttpStatus } from "../shared/http/error-mapper";

// 血統・繁殖情報取得のヘルパー関数
async function getBloodlineData(db: AnyD1Database, cattleId: CattleId) {
	const d = drizzle(db);
	const rows = await d
		.select()
		.from(bloodline)
		.where(eq(bloodline.cattleId, cattleId as unknown as number))
		.limit(1);
	return rows[0] || null;
}

async function getMotherInfoData(db: AnyD1Database, cattleId: CattleId) {
	const d = drizzle(db);
	const rows = await d
		.select()
		.from(motherInfo)
		.where(eq(motherInfo.cattleId, cattleId as unknown as number))
		.limit(1);
	return rows[0] || null;
}

async function getBreedingStatusData(db: AnyD1Database, cattleId: CattleId) {
	const d = drizzle(db);
	const rows = await d
		.select()
		.from(breedingStatus)
		.where(eq(breedingStatus.cattleId, cattleId as unknown as number))
		.limit(1);
	return rows[0] || null;
}

async function getBreedingSummaryData(db: AnyD1Database, cattleId: CattleId) {
	const d = drizzle(db);
	const rows = await d
		.select()
		.from(breedingSummary)
		.where(eq(breedingSummary.cattleId, cattleId as unknown as number))
		.limit(1);
	return rows[0] || null;
}

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)

	// 牛の一覧（FDMユースケースへ委譲。API契約は維持: results/next_cursor/has_next）
	.get("/", zValidator("query", searchCattleSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;
		const deps = makeDeps(c.env.DB, { now: () => new Date() });

		// 無効なカーソルは無視して継続（既存E2Eの振る舞い維持）
		const safeDecodeCursor = (s: string | undefined) => {
			try {
				if (!s) return undefined;
				const decoded = Buffer.from(s, "base64").toString("utf8");
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

		try {
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
				status: q.status
			});
			if (!result.ok) {
				c.status(
					toHttpStatus(result.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: result.error });
			}

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
				nextCursor = Buffer.from(
					JSON.stringify({ id: lastItem.cattleId, value: cursorValue }),
					"utf8"
				).toString("base64");
			}

			return c.json(
				cattleListResponseSchema.parse({
					results: items,
					next_cursor: nextCursor,
					has_next: hasNext
				})
			);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// ステータス別頭数（詳細より先に定義して/:idに食われないように）
	.get("/status-counts", async (c) => {
		const userId = c.get("jwtPayload").userId as unknown as UserId;
		try {
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
			return c.json(cattleStatusCountsResponseSchema.parse({ counts: result }));
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// 牛の詳細（FDMリポジトリへ委譲）+ イベントデータを含める
	.get("/:id", async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const userId = c.get("jwtPayload").userId as unknown as UserId;
		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });

			// 牛の基本情報を取得
			const found = await deps.cattleRepo.findById(id);
			if (!found) {
				return c.json({ error: "Cattle not found" }, 404);
			}
			if (
				(found.ownerUserId as unknown as number) !==
				(userId as unknown as number)
			) {
				return c.json({ error: "Unauthorized" }, 403);
			}

			// 関連データを並行取得
			const [
				events,
				bloodlineData,
				motherInfoData,
				breedingStatusData,
				breedingSummaryData
			] = await Promise.all([
				deps.eventsRepo.listByCattleId(id, userId),
				getBloodlineData(c.env.DB, id),
				getMotherInfoData(c.env.DB, id),
				getBreedingStatusData(c.env.DB, id),
				getBreedingSummaryData(c.env.DB, id)
			]);

			// レスポンスに全ての関連データを含める
			const responseData = {
				...found,
				events: events,
				bloodline: bloodlineData,
				motherInfo: motherInfoData,
				breedingStatus: breedingStatusData,
				breedingSummary: breedingSummaryData
			};

			{
				const parsed = cattleResponseSchema.safeParse(responseData);
				return c.json(parsed.success ? parsed.data : responseData);
			}
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// 牛を新規登録（FDMユースケースへ完全移行。契約は維持）
	.post("/", zValidator("json", createCattleSchema), async (c) => {
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;
		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const result = await createUC({
				repo: deps.cattleRepo,
				clock: deps.clock
			})({
				...data,
				ownerUserId: userId
			} as unknown as import(
				"../contexts/cattle/domain/codecs/input"
			).NewCattleInput);
			if (!result.ok) {
				c.status(
					toHttpStatus(result.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: result.error });
			}
			const parsed = cattleResponseSchema.safeParse(result.value);
			return c.json(parsed.success ? parsed.data : result.value, 201);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// 牛を編集（FDMユースケースへ委譲。breedingの付帯更新はUC/Portへ集約済み）
	.patch("/:id", zValidator("json", updateCattleSchema), async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const patch = c.req.valid("json");
		const userId = c.get("jwtPayload").userId as unknown as UserId;
		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const result = await updateUC({
				repo: deps.cattleRepo,
				clock: deps.clock
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
			if (!result.ok) {
				c.status(
					toHttpStatus(result.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: result.error });
			}
			{
				const parsed = cattleResponseSchema.safeParse(result.value);
				return c.json(parsed.success ? parsed.data : result.value);
			}
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// ステータス更新
	.patch("/:id/status", zValidator("json", updateStatusSchema), async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const { status, reason } = c.req.valid("json");
		const userId = c.get("jwtPayload").userId as unknown as UserId;
		try {
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
			if (!result.ok) {
				c.status(
					toHttpStatus(result.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: result.error });
			}
			{
				const parsed = cattleStatusUpdateResponseSchema.safeParse(result.value);
				return c.json(parsed.success ? parsed.data : result.value);
			}
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// 牛を削除
	.delete("/:id", async (c) => {
		const id = Number.parseInt(c.req.param("id")) as unknown as CattleId;
		const userId = c.get("jwtPayload").userId as unknown as UserId;
		try {
			const deps = makeDeps(c.env.DB, { now: () => new Date() });
			const result = await deleteUC({ repo: deps.cattleRepo })({
				requesterUserId: userId,
				id
			});
			if (!result.ok) {
				c.status(
					toHttpStatus(result.error) as
						| 200
						| 201
						| 400
						| 401
						| 403
						| 404
						| 409
						| 500
				);
				return c.json({ error: result.error });
			}
			return c.json({ message: "Cattle deleted successfully" });
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	});

export default app;
