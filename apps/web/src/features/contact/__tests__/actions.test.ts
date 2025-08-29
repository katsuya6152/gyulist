import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitContactForm } from "../actions";

// console.logをモック
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("submitContactForm", () => {
	beforeEach(() => {
		consoleSpy.mockClear();
	});

	it("有効なデータで送信が成功する", async () => {
		const validData = {
			name: "テスト太郎",
			email: "test@example.com",
			subject: "general",
			message: "テストメッセージです"
		};

		const result = await submitContactForm(validData);

		expect(result.success).toBe(true);
		expect(result.error).toBeUndefined();
		expect(consoleSpy).toHaveBeenCalledWith("=== お問い合わせ受信 ===");
		expect(consoleSpy).toHaveBeenCalledWith("お名前: テスト太郎");
		expect(consoleSpy).toHaveBeenCalledWith("メールアドレス: test@example.com");
		expect(consoleSpy).toHaveBeenCalledWith("件名: general");
		expect(consoleSpy).toHaveBeenCalledWith("お問い合わせ内容:");
		expect(consoleSpy).toHaveBeenCalledWith("テストメッセージです");
	});

	it("名前が空の場合にエラーを返す", async () => {
		const invalidData = {
			name: "",
			email: "test@example.com",
			subject: "general",
			message: "テストメッセージです"
		};

		const result = await submitContactForm(invalidData);

		expect(result.success).toBe(false);
		expect(result.error).toBe("すべての項目を入力してください");
	});

	it("メールアドレスが空の場合にエラーを返す", async () => {
		const invalidData = {
			name: "テスト太郎",
			email: "",
			subject: "general",
			message: "テストメッセージです"
		};

		const result = await submitContactForm(invalidData);

		expect(result.success).toBe(false);
		expect(result.error).toBe("すべての項目を入力してください");
	});

	it("件名が空の場合にエラーを返す", async () => {
		const invalidData = {
			name: "テスト太郎",
			email: "test@example.com",
			subject: "",
			message: "テストメッセージです"
		};

		const result = await submitContactForm(invalidData);

		expect(result.success).toBe(false);
		expect(result.error).toBe("すべての項目を入力してください");
	});

	it("メッセージが空の場合にエラーを返す", async () => {
		const invalidData = {
			name: "テスト太郎",
			email: "test@example.com",
			subject: "general",
			message: ""
		};

		const result = await submitContactForm(invalidData);

		expect(result.success).toBe(false);
		expect(result.error).toBe("すべての項目を入力してください");
	});

	it("無効なメールアドレスの場合にエラーを返す", async () => {
		const invalidData = {
			name: "テスト太郎",
			email: "invalid-email",
			subject: "general",
			message: "テストメッセージです"
		};

		const result = await submitContactForm(invalidData);

		expect(result.success).toBe(false);
		expect(result.error).toBe("正しいメールアドレスを入力してください");
	});

	it("無効なメールアドレス（@なし）の場合にエラーを返す", async () => {
		const invalidData = {
			name: "テスト太郎",
			email: "testexample.com",
			subject: "general",
			message: "テストメッセージです"
		};

		const result = await submitContactForm(invalidData);

		expect(result.success).toBe(false);
		expect(result.error).toBe("正しいメールアドレスを入力してください");
	});

	it("無効なメールアドレス（ドメインなし）の場合にエラーを返す", async () => {
		const invalidData = {
			name: "テスト太郎",
			email: "test@",
			subject: "general",
			message: "テストメッセージです"
		};

		const result = await submitContactForm(invalidData);

		expect(result.success).toBe(false);
		expect(result.error).toBe("正しいメールアドレスを入力してください");
	});
});
