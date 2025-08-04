import { expect, test } from "@playwright/test";

test.describe("認証機能", () => {
	test.beforeEach(async ({ page }) => {
		// 各テスト前にログアウト状態にする
		await page.goto("/");
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});
		await page.context().clearCookies();
	});

	test("デモログインフロー", async ({ page }) => {
		await page.goto("/login");

		// デモログインボタンが表示されることを確認
		await expect(page.locator("text=体験用アカウントでログイン")).toBeVisible();

		// デモログインボタンをクリック
		await page.click("text=体験用アカウントでログイン");

		// ログイン処理の完了を待つ
		await page.waitForLoadState("networkidle", { timeout: 30000 });

		// スケジュールページにリダイレクトされることを確認
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");
	});

	test("未認証ユーザーの保護されたページへのアクセス", async ({ page }) => {
		// 保護されたページにアクセス
		await page.goto("/schedule");

		// ログインページにリダイレクトされることを確認
		await page.waitForURL("/login");
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
	});

	test("ログインページの基本表示", async ({ page }) => {
		await page.goto("/login");

		// ログインページの基本要素が表示されることを確認
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('input[name="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
		await expect(page.locator("text=体験用アカウントでログイン")).toBeVisible();
	});

	test("ログアウトフロー", async ({ page }) => {
		// まずデモログインを実行
		await page.goto("/login");
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });

		// 設定ページに移動
		await page.click("text=設定");
		await page.waitForURL("/settings");

		// ダイアログハンドラーを設定
		let dialogAccepted = false;
		page.on("dialog", (dialog) => {
			expect(dialog.message()).toContain("ログアウトしますか？");
			dialog.accept();
			dialogAccepted = true;
		});

		// ログアウトボタンを確実に特定してクリック
		const logoutButton = page.getByRole("button", { name: "ログアウト" });
		await expect(logoutButton).toBeVisible();
		await logoutButton.click();

		// 少し待ってからダイアログの確認
		await page.waitForTimeout(1000);
		expect(dialogAccepted).toBe(true);

		// ログアウト処理の完了を待つ
		try {
			await page.waitForURL("/login", { timeout: 15000 });
		} catch {
			// URLの変更を待てない場合は、ログインページの要素を確認
			await page.waitForSelector('[class*="text-2xl"]', { timeout: 15000 });
		}

		// ログインページにいることを確認
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");

		// 保護されたページにアクセスできないことを確認
		await page.goto("/schedule");
		await page.waitForURL("/login");
	});
});
