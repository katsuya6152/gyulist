import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import {
	createNewCattle,
	deleteCattleData,
	getCattleById,
	getCattleStatusCounts,
	searchCattleList,
	updateCattleData,
	updateStatus
} from "../services/cattleService";
import type { Bindings } from "../types";
import {
	createCattleSchema,
	searchCattleSchema,
	updateCattleSchema,
	updateStatusSchema
} from "../validators/cattleValidator";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)

	// 牛の一覧
	.get("/", zValidator("query", searchCattleSchema), async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const query = c.req.valid("query");
			const result = await searchCattleList(c.env.DB, userId, query);
			return c.json(result);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// ステータス別頭数（詳細より先に定義して/:idに食われないように）
	.get("/status-counts", async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const counts = await getCattleStatusCounts(c.env.DB, userId);
			return c.json({ counts });
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// 牛の詳細
	.get("/:id", async (c) => {
		const cattleId = Number.parseInt(c.req.param("id"));
		const userId = c.get("jwtPayload").userId;
		const cattle = await getCattleById(c.env.DB, cattleId);

		if (!cattle) {
			return c.json({ error: "Cattle not found" }, 404);
		}

		if (cattle.ownerUserId !== userId) {
			return c.json({ error: "Unauthorized" }, 403);
		}

		return c.json(cattle);
	})

	// 牛を新規登録
	.post("/", zValidator("json", createCattleSchema), async (c) => {
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		// ownerUserIdをJWTペイロードから設定
		const cattleData = {
			...data,
			ownerUserId: userId
		};

		const result = await createNewCattle(c.env.DB, cattleData);
		return c.json(result, 201);
	})

	// 牛を編集
	.patch("/:id", zValidator("json", updateCattleSchema), async (c) => {
		const cattleId = Number.parseInt(c.req.param("id"));
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		// 既存の牛を取得して所有者を確認
		const existingCattle = await getCattleById(c.env.DB, cattleId);
		if (!existingCattle) {
			return c.json({ error: "Cattle not found" }, 404);
		}

		if (existingCattle.ownerUserId !== userId) {
			return c.json({ error: "Unauthorized" }, 403);
		}

		const result = await updateCattleData(c.env.DB, cattleId, data);
		return c.json(result);
	})

	// ステータス更新
	.patch("/:id/status", zValidator("json", updateStatusSchema), async (c) => {
		const cattleId = Number.parseInt(c.req.param("id"));
		const { status, reason } = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		const existingCattle = await getCattleById(c.env.DB, cattleId);
		if (!existingCattle) {
			return c.json({ error: "Cattle not found" }, 404);
		}
		if (existingCattle.ownerUserId !== userId) {
			return c.json({ error: "Unauthorized" }, 403);
		}

		const result = await updateStatus(
			c.env.DB,
			cattleId,
			status,
			userId,
			reason ?? undefined
		);
		return c.json(result);
	})

	// 牛を削除
	.delete("/:id", async (c) => {
		const cattleId = Number.parseInt(c.req.param("id"));
		const userId = c.get("jwtPayload").userId;

		// 既存の牛を取得して所有者を確認
		const existingCattle = await getCattleById(c.env.DB, cattleId);
		if (!existingCattle) {
			return c.json({ error: "Cattle not found" }, 404);
		}

		if (existingCattle.ownerUserId !== userId) {
			return c.json({ error: "Unauthorized" }, 403);
		}

		await deleteCattleData(c.env.DB, cattleId);
		return c.json({ message: "Cattle deleted successfully" });
	});

export default app;
