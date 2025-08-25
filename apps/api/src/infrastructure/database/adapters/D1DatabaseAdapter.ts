import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { D1DatabasePort } from "../../../shared/ports/d1Database";

export class D1DatabaseAdapter implements D1DatabasePort {
	private readonly rawD1: D1Database;
	private readonly drizzleDb: ReturnType<typeof drizzle>;

	constructor(d1Database: D1Database) {
		this.rawD1 = d1Database;
		this.drizzleDb = drizzle(d1Database, { schema });
	}

	getRawD1(): D1Database {
		return this.rawD1;
	}

	getDrizzle() {
		return this.drizzleDb;
	}

	isConnected(): boolean {
		return true; // Cloudflare D1は常に接続されている
	}
}
