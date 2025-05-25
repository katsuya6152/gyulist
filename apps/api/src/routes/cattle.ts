import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import {
	createNewCattle,
	deleteCattleData,
	getCattleById,
	getCattleList,
	updateCattleData,
} from "../services/cattleService";
import type { Bindings } from "../types";
import {
	createCattleSchema,
	updateCattleSchema,
} from "../validators/cattleValidator";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)

	// 牛の一覧
	.get("/", async (c) => {
		const userId = c.get("jwtPayload").userId;
		try {
			const cattle = await getCattleList(c.env.DB, userId);
			return c.json(cattle);
		} catch (e) {
			console.error(e);
			return c.json({ message: "Internal Server Error" }, 500);
		}
	})

	// 牛の詳細
	.get("/:id", async (c) => {
		const cattleId = Number.parseInt(c.req.param("id"));
		const cattle = await getCattleById(c.env.DB, cattleId);
		if (!cattle) {
			return c.json({ error: "Cattle not found" }, 404);
		}
		return c.json(cattle);
	})

	// 牛を新規登録
	.post("/", zValidator("json", createCattleSchema), async (c) => {
		const data = c.req.valid("json");
		const userId = c.get("jwtPayload").userId;

		// ownerUserIdが一致することを確認
		if (data.ownerUserId !== userId) {
			return c.json({ error: "Unauthorized" }, 403);
		}

		const result = await createNewCattle(c.env.DB, data);
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
