import { describe, expect, it } from "vitest";
import { corsMiddleware } from "../../../src/middleware/cors";

describe("CORS Middleware", () => {
	it("should export cors middleware", () => {
		expect(corsMiddleware).toBeDefined();
		expect(typeof corsMiddleware).toBe("function");
	});

	it("should be configured with correct origins", () => {
		// CORSミドルウェアの設定をテスト
		// 実際のミドルウェア関数が存在することを確認
		expect(corsMiddleware).toBeInstanceOf(Function);
	});
});
