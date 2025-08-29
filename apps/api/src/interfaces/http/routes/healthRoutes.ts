import { Hono } from "hono";
import type { Env } from "../../../types";

const app = new Hono<{ Bindings: Env }>().get("/", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
