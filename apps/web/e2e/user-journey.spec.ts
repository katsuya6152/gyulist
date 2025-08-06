import { expect, test } from "@playwright/test";

test.describe("ユーザージャーニー", () => {
	test.beforeEach(async ({ page }) => {
		// 各テスト前にクリーンな状態にする
		await page.goto("/");
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});
		await page.context().clearCookies();
	});

	test("新規ユーザーの完全なフロー", async ({ page }) => {
		// 1. ランディングページから開始
		await page.goto("/");
		await expect(page.locator("h1")).toContainText(
			"畜産管理を、もっとスマートに",
		);

		// 2. ログインページへ移動
		await page.click("text=無料で始める");
		await page.waitForURL("/login");
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");

		// 3. デモログインを実行
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });

		// 4. スケジュールページの確認
		await expect(page.locator("h1")).toContainText("予定");
		await expect(page.getByRole("button", { name: /今日/ })).toHaveClass(
			/bg-gradient-primary/,
		);

		// 5. 牛の一覧ページに移動
		await page.click("text=一覧");
		await page.waitForURL("/cattle");
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 6. 牛の詳細を確認
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });
		await cattleItems.first().click();
		await expect(page).toHaveURL(/\/cattle\/\d+/);
		await expect(page.getByRole("tab", { name: "基本情報" })).toBeVisible();

		// 7. スケジュールに戻る
		console.log("Current URL before clicking 予定:", page.url());

		// フッターナビゲーションの予定リンクを確実にクリック
		await page
			.locator('.fixed.bottom-0 a[href="/schedule?filter=today"]')
			.click();

		// URLの変更を待つ
		await page.waitForURL(/\/schedule/, { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");

		// 8. 設定ページを確認
		await page.click("text=設定");
		await page.waitForURL("/settings");
		await expect(page.locator("h1")).toContainText("設定");
	});

	test("日常的な使用フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });

		// 2. 今日の予定を確認
		await expect(page.locator("h1")).toContainText("予定");
		await expect(page.getByRole("button", { name: /今日/ })).toHaveClass(
			/bg-gradient-primary/,
		);

		// イベント件数の確認
		const countText = page.locator("text=/\\d+件のイベントが見つかりました/");
		await expect(countText).toBeVisible();

		// 3. 明日の予定に切り替え
		const tomorrowButton = page.getByRole("button", { name: /明日/ });
		await tomorrowButton.click();
		await expect(page).toHaveURL(/filter=tomorrow/);
		await expect(tomorrowButton).toHaveClass(/bg-gradient-primary/);

		// 4. 全ての予定を確認
		const allButton = page.getByRole("button", { name: /全て/ });
		await allButton.click();
		await expect(page).toHaveURL("/schedule");
		await expect(allButton).toHaveClass(/bg-gradient-primary/);

		// 5. カスタム日付検索を使用
		await expect(page.locator("text=特定の日付のイベントを表示")).toBeVisible();
		await page.click("text=特定の日付のイベントを表示");

		const dateInput = page.locator('input[type="date"]');
		await expect(dateInput).toBeVisible();
		await dateInput.fill("2024-02-01");

		const scheduleSearchButton = page.getByRole("button", { name: "検索" });
		await scheduleSearchButton.click();
		await expect(page).toHaveURL(/filter=custom&date=2024-02-01/);

		// 6. 牛の管理ページで検索
		await page.click("text=一覧");
		await page.waitForURL("/cattle");

		const searchInput = page.locator('input[placeholder="検索..."]');
		// 牛一覧ページの検索フォーム内の検索ボタンを指定
		const cattleSearchButton = page
			.locator('form button[type="submit"]')
			.first();

		await searchInput.fill("たろう");
		await cattleSearchButton.click();

		await expect(page).toHaveURL(/search=/);

		// 検索をクリア
		const clearSearchButton = page.locator('button:has-text("検索をクリア")');
		const hasClearSearchButton = await clearSearchButton
			.isVisible()
			.catch(() => false);

		if (hasClearSearchButton) {
			await clearSearchButton.click();
		} else {
			await searchInput.clear();
			await cattleSearchButton.click();
		}
	});

	test("モバイル基本操作フロー", async ({ page }) => {
		// モバイルサイズに設定
		await page.setViewportSize({ width: 375, height: 667 });

		// 1. デモログインで開始
		await page.goto("/login");
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });

		// 2. モバイルでのスケジュール表示確認
		await expect(page.locator("h1")).toContainText("予定");

		// フィルターボタンがモバイルで適切に表示されることを確認
		await expect(page.getByRole("button", { name: /今日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /明日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /明後日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /全て/ })).toBeVisible();

		// フィルターボタンが4列のグリッドで表示されることを確認
		const filterContainer = page.locator(".grid-cols-4").first();
		await expect(filterContainer).toBeVisible();

		// 3. フッターナビゲーションの確認
		await expect(page.locator(".fixed.bottom-0")).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=予定"),
		).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=一覧"),
		).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=個体登録"),
		).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=設定"),
		).toBeVisible();

		// 4. モバイルでの牛一覧表示
		await page.click("text=一覧");
		await page.waitForURL("/cattle");
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 牛のリストがモバイルで適切に表示されることを確認
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });

		// 5. モバイルでの詳細ページ表示
		await cattleItems.first().click();
		await expect(page).toHaveURL(/\/cattle\/\d+/);
		await expect(page.getByRole("tab", { name: "基本情報" })).toBeVisible();

		// 6. 戻るボタンの動作確認
		await page.goBack();
		await expect(page).toHaveURL("/cattle");

		// 7. 新規登録ページへの遷移確認
		await page.click("text=個体登録");
		await expect(page).toHaveURL("/cattle/new");
		await expect(page.locator("h1")).toContainText("新規牛登録");

		// フォームがモバイルで適切に表示されることを確認
		await expect(page.locator('input[name="name"]')).toBeVisible();
		await expect(page.locator('input[name="earTagNumber"]')).toBeVisible();
		await expect(page.locator('select[name="gender"]')).toBeVisible();
		await expect(page.locator('input[name="birthday"]')).toBeVisible();
	});
});
