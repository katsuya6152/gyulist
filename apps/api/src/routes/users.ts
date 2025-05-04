import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwtMiddleware } from "../middleware/jwt";
import { getUserById } from "../services/userService";
import type { Bindings } from "../types";
import { UserIdParamSchema } from "../validators/usersValidator";

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
	});

export default app;
