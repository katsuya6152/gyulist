import type { AnyD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";

type Bindings = {
	DB: AnyD1Database;
};

const app = new Hono<{ Bindings: Bindings }>().get("/", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
