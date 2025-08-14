import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { getUserById, updateTheme } from "../services/userService";
import type { Bindings } from "../types";
import {
	UpdateThemeSchema,
	UserIdParamSchema
} from "../validators/usersValidator";

const app = new Hono<{ Bindings: Bindings }>()
	.use("*", jwtMiddleware)
	.get("/:id", zValidator("param", UserIdParamSchema), async (c) => {
		const { id } = c.req.valid("param");
		const userId = c.get("jwtPayload").userId;
		console.log(userId);

		try {
			const user = await getUserById(c.env.DB, Number(id));
			if (!user) {
				return c.json({ error: "User not found" }, 404);
			}
			return c.json(user);
		} catch (e) {
			console.error(e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.patch(
		"/:id/theme",
		zValidator("param", UserIdParamSchema),
		zValidator("json", UpdateThemeSchema),
		async (c) => {
			const { id } = c.req.valid("param");
			const { theme } = c.req.valid("json");
			const userId = c.get("jwtPayload").userId;

			// 自分のテーマのみ更新可能
			if (Number(id) !== userId) {
				return c.json({ error: "Unauthorized" }, 403);
			}

			try {
				await updateTheme(c.env.DB, userId, theme);
				return c.json({ success: true, theme });
			} catch (e) {
				console.error(e);
				return c.json({ error: "Internal Server Error" }, 500);
			}
		}
	);

export default app;
