import { zValidator } from "@hono/zod-validator";
import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { getUserById } from "../services/userService";
import { UserIdParamSchema } from "../validators/usersValidator";

type Bindings = {
	DB: AnyD1Database;
};

const app = new Hono<{ Bindings: Bindings }>().get(
	"/:id",
	zValidator("param", UserIdParamSchema),
	async (c) => {
		const { id } = c.req.valid("param");
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
	},
);

export default app;
