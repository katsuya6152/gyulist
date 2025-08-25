import type { D1Database } from "@cloudflare/workers-types";
import type { D1DatabasePort } from "../../shared/ports/d1Database";
import { D1DatabaseAdapter } from "./adapters/D1DatabaseAdapter";

export const D1DatabaseFactory = {
	create(d1Database: D1Database): D1DatabasePort {
		return new D1DatabaseAdapter(d1Database);
	},

	createForEnvironment(env: string): D1DatabasePort {
		switch (env) {
			case "development":
			case "test":
				// 開発・テスト環境ではモックD1データベースを作成
				return D1DatabaseFactory.createMockD1Database();
			case "production":
				throw new Error(
					"Production environment requires actual D1 database instance"
				);
			default:
				throw new Error(`Unknown environment: ${env}`);
		}
	},

	createMockD1Database(): D1DatabasePort {
		// D1の動作を模倣するモックデータベース（Drizzle ORM対応）
		const mockD1: D1Database = {
			prepare: (sql: string) => ({
				bind: (...values: unknown[]) => ({
					first: async <T = unknown>() => null as T | null,
					all: async <T = unknown>() =>
						({
							results: [],
							meta: {
								duration: 0,
								size_after: 0,
								rows_read: 0,
								rows_written: 0
							},
							success: true
						}) as unknown,
					run: async () => ({
						success: true,
						lastInsertRowId: 1,
						changes: 0,
						duration: 0
					})
				}),
				first: async <T = unknown>() => null as T | null,
				all: async <T = unknown>() =>
					({
						results: [],
						meta: { duration: 0, size_after: 0, rows_read: 0, rows_written: 0 },
						success: true
					}) as unknown,
				run: async () => ({
					success: true,
					lastInsertRowId: 1,
					changes: 0,
					duration: 0
				})
			}),
			exec: async (sql: string) => ({
				success: true,
				lastInsertRowId: 1,
				changes: 0,
				duration: 0
			}),
			batch: async (statements: unknown[]) =>
				statements.map(() => ({
					success: true,
					lastInsertRowId: 1,
					changes: 0,
					duration: 0
				}))
		} as D1Database;

		return new D1DatabaseAdapter(mockD1);
	}
};
