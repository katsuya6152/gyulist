import { Hono } from 'hono';
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { users } from './db/schema';
import { eq } from "drizzle-orm";

type Bindings = {
  DB: AnyD1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get("/users/:id", async (c) => {
	try {
		const db = drizzle(c.env.DB);
    const { id } = c.req.param();
		const results = await db.select().from(users).where(eq(users.id, Number.parseInt(id)));
		return c.json(results);
	} catch (e) {
		return c.json({err:e},500);
	}
})

export default app
