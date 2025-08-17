import { Hono } from "hono";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>().get("/health", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
