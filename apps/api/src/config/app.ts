import type { AnyD1Database } from "drizzle-orm/d1";

export type Bindings = {
	DB: AnyD1Database;
};

export const BASE_PATH = "/api";
