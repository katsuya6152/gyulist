/**
 * Pre-Register Controller
 *
 * 事前登録のコントローラー
 */

import type { Context } from "hono";
import type { PreRegisterUserUseCase } from "../../../application/use-cases/registration/preRegisterUser";
import type { Env } from "../../../types";

export type PreRegisterControllerDeps = {
	useCases: {
		preRegisterUserUseCase: (input: {
			email: string;
			referralSource?: string;
			turnstileToken: string;
		}) => Promise<{
			ok: boolean;
			value?: { status: number; body: Record<string, unknown> };
			error?: { message: string };
		}>;
	};
};

/**
 * 事前登録APIコントローラーのファクトリー関数
 */
export function makePreRegisterController(deps: PreRegisterControllerDeps) {
	return new PreRegisterController(deps);
}

/**
 * 事前登録APIコントローラー
 */
export class PreRegisterController {
	constructor(private readonly deps: PreRegisterControllerDeps) {}

	/**
	 * 事前登録処理
	 * POST /pre-register
	 */
	async preRegister(c: Context<{ Bindings: Env }>) {
		try {
			const body = await c.req.json();

			const useCase = this.deps.useCases.preRegisterUserUseCase;
			const result = await useCase({
				email: body.email,
				referralSource: body.referralSource,
				turnstileToken: body.turnstileToken
			});

			if (!result.ok) {
				return c.json({ error: result.error?.message || "Unknown error" }, 400);
			}

			return c.json(
				{
					data: result.value?.body || {}
				},
				(result.value?.status as 200 | 201) || 200
			);
		} catch (error) {
			console.error("Pre-register error:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	}
}
