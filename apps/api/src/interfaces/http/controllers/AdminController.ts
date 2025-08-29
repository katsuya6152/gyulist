/**
 * Admin Controller
 *
 * 管理者向けの管理機能のコントローラー
 */

import type { Context } from "hono";
import type { Dependencies } from "../../../infrastructure/config/dependencies";
import type { Env } from "../../../types";

export type AdminControllerDeps = {
	adminUseCases: Dependencies["adminUseCases"];
};

/**
 * 管理APIコントローラーのファクトリー関数
 */
export function makeAdminController(deps: AdminControllerDeps) {
	return new AdminController(deps);
}

/**
 * 管理APIコントローラー
 */
export class AdminController {
	constructor(private readonly deps: AdminControllerDeps) {}

	/**
	 * 事前登録一覧取得
	 * GET /admin/registrations
	 */
	async getRegistrations(c: Context<{ Bindings: Env }>) {
		try {
			const query = c.req.query();

			const result = await this.deps.adminUseCases.listRegistrationsUseCase({
				q: query.q,
				from: query.from ? Number.parseInt(query.from, 10) : undefined,
				to: query.to ? Number.parseInt(query.to, 10) : undefined,
				source: query.source,
				limit: Number.parseInt(query.limit || "20", 10),
				offset: Number.parseInt(query.offset || "0", 10)
			});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			return c.json({
				data: {
					items: result.value.items,
					total: result.value.total
				}
			});
		} catch (error) {
			console.error("Get registrations error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}

	/**
	 * 事前登録CSVエクスポート
	 * GET /admin/registrations.csv
	 */
	async exportRegistrationsCsv(c: Context<{ Bindings: Env }>) {
		try {
			const query = c.req.query();

			const result =
				await this.deps.adminUseCases.exportRegistrationsCsvUseCase({
					q: query.q,
					from: query.from ? Number.parseInt(query.from, 10) : undefined,
					to: query.to ? Number.parseInt(query.to, 10) : undefined,
					source: query.source,
					limit: Number.parseInt(query.limit || "20", 10),
					offset: Number.parseInt(query.offset || "0", 10)
				});

			if (!result.ok) {
				return c.json({ error: result.error.message }, 500);
			}

			// CSVヘッダーを設定
			c.header("Content-Type", "text/csv; charset=utf-8");
			c.header("Content-Disposition", "attachment; filename=registrations.csv");

			return c.text(result.value.csvData);
		} catch (error) {
			console.error("Export registrations CSV error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
}
