import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import { z } from "zod";
import { users } from "./db/schema";

type Bindings = {
	DB: AnyD1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

// --- スキーマ定義 ---

// パスパラメータ(id)をバリデするためのZodスキーマ
const UserIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, { message: "id must be a number string" }),
});

// --- エンドポイント定義 ---

const routes = app
	.use(
		"*",
		cors({
			origin: ["http://localhost:3000", "https://gyulist.pages.dev"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type"],
			credentials: true,
		}),
	)
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})

	.get("/users/:id", zValidator("param", UserIdParamSchema), async (c) => {
		try {
			const db = drizzle(c.env.DB);
			const { id } = c.req.valid("param");
			const results = await db
				.select()
				.from(users)
				.where(eq(users.id, Number.parseInt(id)));

			return c.json(results);
		} catch (e) {
			console.error(e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});

export type AppType = typeof routes;

type ClientType = typeof hc<AppType>;

export const createClient = (
	...args: Parameters<ClientType>
): ReturnType<ClientType> => {
	return hc<AppType>(...args);
};

export default app;
