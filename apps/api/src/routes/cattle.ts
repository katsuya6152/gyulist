import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { getCattleList } from "../services/cattleService";
import type { Bindings } from "../types";

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
	});

// 牛の新規登録
// .post("/", async (c) => {
// 	const userId = c.get("jwtPayload").userId;
// 	const input = c.req.valid("json");
// 	const cattle = await createCattle(c.env.DB, userId, input);
// 	return c.json(cattle);
// });

// 牛の詳細
// .get("/:id", async (c) => {
// 	const userId = c.get("jwtPayload").userId;
// 	const input = c.req.valid("json");
// 	const cattle = await getCattle(c.env.DB, userId, input);
// 	return c.json(cattle);
// });

// 牛の編集
// .put("/:id", async (c) => {
// 	const userId = c.get("jwtPayload").userId;
// 	const input = c.req.valid("json");
// 	const cattle = await updateCattle(c.env.DB, userId, input);
// 	return c.json(cattle);
// });

// 牛の削除
// .delete("/:id", async (c) => {
// 	const userId = c.get("jwtPayload").userId;
// 	const input = c.req.valid("json");
// 	const cattle = await deleteCattle(c.env.DB, userId, input);
// 	return c.json(cattle);
// });

export default app;
