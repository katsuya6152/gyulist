/**
 * Cattle HTTP Controller
 *
 * 牛管理のHTTPエンドポイントを処理するコントローラー
 */

import type { Context } from "hono";
import type { NewCattleProps } from "../../../domain/types/cattle/Cattle";
import type {
	CattleName,
	EarTagNumber,
	Gender,
	GrowthStage,
	IdentificationNumber,
	Status
} from "../../../domain/types/cattle/CattleTypes";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import type { CattleId } from "../../../shared/brand";
import { executeUseCase } from "../../../shared/http/route-helpers";
import { toUserId } from "../../../shared/types/safe-cast";

/**
 * コントローラーの依存関係
 */
export type CattleControllerDeps = Dependencies;

/**
 * 牛管理コントローラー
 */
export const makeCattleController = (deps: CattleControllerDeps) => ({
	/**
	 * 牛の詳細取得
	 */
	async get(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const cattleId = Number.parseInt(c.req.param("id"), 10) as CattleId;

			const getCattleUseCase = deps.useCases.getCattleUseCase;
			const result = await getCattleUseCase({ cattleId });

			return result;
		});
	},

	/**
	 * ステータス別頭数取得
	 */
	async getStatusCounts(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);

			const getStatusCountsUseCase = deps.useCases.getStatusCountsUseCase;
			const result = await getStatusCountsUseCase({ ownerUserId: userId });

			return result;
		});
	},

	/**
	 * 牛の新規作成
	 */
	async create(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const input = (await c.req.json()) as Record<string, unknown>;

			const createCattleUseCase = deps.useCases.createCattleUseCase;
			const result = await createCattleUseCase({
				ownerUserId: userId,
				name: input.name as unknown as CattleName,
				identificationNumber:
					input.identificationNumber as unknown as IdentificationNumber,
				earTagNumber: input.earTagNumber as unknown as EarTagNumber,
				gender: input.gender as unknown as Gender,
				growthStage: input.growthStage as unknown as GrowthStage
			});

			return result;
		});
	},

	/**
	 * 牛の検索・一覧取得
	 */
	async search(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const query = c.req.query() as Record<string, unknown>;

			const searchCattleUseCase = deps.useCases.searchCattleUseCase;
			const result = await searchCattleUseCase({
				ownerUserId: userId,
				criteria: {
					ownerUserId: userId,
					gender: query.gender as Gender | undefined,
					growthStage: query.growthStage as GrowthStage | undefined,
					status: query.status as Status | undefined,
					hasAlert: query.hasAlert ? query.hasAlert === "true" : undefined,
					search: query.search as string | undefined
				},
				cursor: query.cursor ? JSON.parse(query.cursor as string) : undefined,
				limit: query.limit
					? Math.min(
							100,
							Math.max(1, Number.parseInt(query.limit as string, 10))
						)
					: 20,
				sortBy:
					(query.sortBy as "id" | "name" | "days_old" | "days_open") || "id",
				sortOrder: (query.sortOrder as "asc" | "desc") || "desc",
				hasAlert: query.hasAlert ? query.hasAlert === "true" : undefined,
				minAge: query.minAge
					? Number.parseInt(query.minAge as string, 10)
					: undefined,
				maxAge: query.maxAge
					? Number.parseInt(query.maxAge as string, 10)
					: undefined,
				barn: query.barn as string | undefined,
				breed: query.breed as string | undefined
			});

			return result;
		});
	},

	/**
	 * 牛の更新
	 */
	async update(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const cattleId = Number.parseInt(c.req.param("id"), 10) as CattleId;
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const input = (await c.req.json()) as Record<string, unknown>;

			// 更新可能なプロパティを抽出
			const updates: Partial<NewCattleProps> = {};
			if (input.name !== undefined) updates.name = input.name as string | null;
			if (input.identificationNumber !== undefined)
				updates.identificationNumber =
					input.identificationNumber as unknown as IdentificationNumber;
			if (input.earTagNumber !== undefined)
				updates.earTagNumber = input.earTagNumber as unknown as EarTagNumber;
			if (input.gender !== undefined)
				updates.gender = input.gender as unknown as Gender;
			if (input.growthStage !== undefined)
				updates.growthStage = input.growthStage as unknown as GrowthStage;
			if (input.birthday !== undefined)
				updates.birthday = input.birthday
					? new Date(input.birthday as string)
					: null;
			if (input.breed !== undefined)
				updates.breed = input.breed as string | null;
			if (input.status !== undefined)
				updates.status = input.status as unknown as Status;
			if (input.producerName !== undefined)
				updates.producerName = input.producerName as string | null;
			if (input.barn !== undefined) updates.barn = input.barn as string | null;
			if (input.breedingValue !== undefined)
				updates.breedingValue = input.breedingValue as string | null;
			if (input.notes !== undefined)
				updates.notes = input.notes as string | null;
			if (input.weight !== undefined)
				updates.weight = input.weight as number | null;
			if (input.score !== undefined)
				updates.score = input.score as number | null;

			const updateCattleUseCase = deps.useCases.updateCattleUseCase;
			const result = await updateCattleUseCase({
				cattleId,
				ownerUserId: userId,
				updates
			});

			return result;
		});
	},

	/**
	 * 牛の削除
	 */
	async delete(c: Context): Promise<Response> {
		return executeUseCase(c, async () => {
			const cattleId = Number.parseInt(c.req.param("id"), 10) as CattleId;
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);

			const deleteCattleUseCase = deps.useCases.deleteCattleUseCase;
			const result = await deleteCattleUseCase({
				cattleId,
				ownerUserId: userId
			});

			return result;
		});
	},

	/**
	 * 牛のステータス更新
	 */
	async updateStatus(c: Context): Promise<Response> {
		try {
			const cattleId = Number.parseInt(c.req.param("id"), 10) as CattleId;
			const jwtPayload = c.get("jwtPayload");
			const userId = toUserId(jwtPayload.userId);
			const input = (await c.req.json()) as Record<string, unknown>;

			const updateCattleUseCase = deps.useCases.updateCattleUseCase;
			const result = await updateCattleUseCase({
				cattleId,
				ownerUserId: userId,
				updates: {
					status: input.status as Status,
					notes: (input.reason as string) || undefined
				}
			});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// OpenAPI仕様に合わせたレスポンス形式
			return c.json({
				data: {
					cattleId: result.value.cattleId,
					ownerUserId: result.value.ownerUserId,
					identificationNumber: result.value.identificationNumber,
					earTagNumber: result.value.earTagNumber,
					name: result.value.name,
					gender: result.value.gender,
					birthday: result.value.birthday,
					growthStage: result.value.growthStage,
					breed: result.value.breed,
					status: result.value.status,
					producerName: result.value.producerName,
					barn: result.value.barn,
					breedingValue: result.value.breedingValue,
					notes: result.value.notes,
					weight: result.value.weight,
					score: result.value.score,
					createdAt: result.value.createdAt,
					updatedAt: result.value.updatedAt
				}
			});
		} catch (error) {
			console.error("Update cattle status error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
});
