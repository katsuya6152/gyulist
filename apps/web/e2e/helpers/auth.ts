import { type Page, expect } from "@playwright/test";

/**
 * ログイン処理を行うヘルパー関数
 */
export async function login(
	page: Page,
	email = "test@test.co.jp",
	password = "testtest",
) {
	await page.goto("/login");

	// ログインページが表示されることを確認（CardTitleを使用）
	await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");

	// フォームに入力
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', password);

	// ログインボタンをクリック
	await page.click('button[type="submit"]');

	// スケジュールページにリダイレクトされることを確認
	await page.waitForURL("/schedule?filter=today");
}

/**
 * デモログインを行うヘルパー関数
 */
export async function demoLogin(page: Page) {
	await page.goto("/login");

	// ログインページが表示されることを確認（CardTitleを使用）
	await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");

	// 体験用アカウントでログインボタンをクリック
	await page.click("text=体験用アカウントでログイン");

	// スケジュールページにリダイレクトされることを確認
	await page.waitForURL("/schedule?filter=today");
}

/**
 * ログアウト処理を行うヘルパー関数
 */
export async function logout(page: Page) {
	// 設定ページに移動
	await page.goto("/settings");

	// ログアウトボタンをクリック
	await page.click("text=ログアウト");

	// 確認ダイアログでOKをクリック
	page.on("dialog", (dialog) => dialog.accept());

	// ログインページにリダイレクトされることを確認
	await page.waitForURL("/login");
}

/**
 * 認証状態をチェックするヘルパー関数
 */
export async function checkAuthenticated(page: Page) {
	// スケジュールページにアクセス
	await page.goto("/schedule");

	// スケジュールページが表示されることを確認
	await expect(page).toHaveURL(/\/schedule/);
	await expect(page.locator("h1")).toContainText("予定");
}

/**
 * 未認証状態をチェックするヘルパー関数
 */
export async function checkUnauthenticated(page: Page) {
	// 保護されたページにアクセス
	await page.goto("/schedule");

	// ログインページにリダイレクトされることを確認
	await page.waitForURL("/login");
	await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
}
