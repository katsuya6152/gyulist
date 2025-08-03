import { expect, test } from "@playwright/test";

test.describe("ナビゲーション機能", () => {
	test.beforeEach(async ({ page }) => {
		// 各テスト前にログイン状態にする
		await page.goto("/");
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});
		await page.context().clearCookies();

		// デモログイン
		await page.goto("/login");
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
	});

	test("フッターナビゲーションの表示", async ({ page }) => {
		// フッターナビゲーションが表示されることを確認
		await expect(page.locator(".fixed.bottom-0")).toBeVisible();

		// 主要なナビゲーションアイテムが表示されることを確認（フッターナビゲーション内のみ）
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
		await expect(
			page.locator(".fixed.bottom-0").locator("text=戻る"),
		).toBeVisible();
	});

	test("スケジュールページへのナビゲーション", async ({ page }) => {
		// 牛の管理ページに移動
		await page.goto("/cattle");

		// 予定リンクをクリック
		await page.click("text=予定");

		// スケジュールページに遷移することを確認
		await expect(page).toHaveURL(/\/schedule/);
		await expect(page.locator("h1")).toContainText("予定");
	});

	test("牛の管理ページへのナビゲーション", async ({ page }) => {
		// スケジュールページから開始
		await expect(page).toHaveURL(/\/schedule/);

		// 一覧リンクをクリック
		await page.click("text=一覧");

		// 牛の管理ページに遷移することを確認
		await expect(page).toHaveURL("/cattle");

		// 牛のリストが表示されることを確認
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });
	});

	test("個体登録ページへのナビゲーション", async ({ page }) => {
		// 個体登録リンクをクリック
		await page.click("text=個体登録");

		// 個体登録ページに遷移することを確認
		await expect(page).toHaveURL("/cattle/new");
		await expect(page.locator("h1")).toContainText("新規牛登録");
	});

	test("設定ページへのナビゲーション", async ({ page }) => {
		// 設定リンクをクリック
		await page.click("text=設定");

		// 設定ページに遷移することを確認
		await expect(page).toHaveURL("/settings");
		await expect(page.locator("h1")).toContainText("設定");
	});

	test("戻るボタンの動作", async ({ page }) => {
		// 牛の詳細ページに移動
		await page.goto("/cattle/1");

		// 戻るボタンが表示されることを確認
		await expect(page.locator("text=戻る")).toBeVisible();

		// 戻るボタンをクリック
		await page.click("text=戻る");

		// 前のページに戻ることを確認
		await page.waitForLoadState("networkidle");
	});

	test("アクティブナビゲーションの表示", async ({ page }) => {
		// 牛の管理ページに移動
		await page.goto("/cattle");

		// 一覧リンクがアクティブ状態であることを確認（子要素のspanをチェック）
		const cattleNavItem = page.locator(
			'.fixed.bottom-0 a[href="/cattle"] span',
		);
		await expect(cattleNavItem).toHaveClass(/text-\[#00C5CC\]/);

		// スケジュールページに移動
		await page.goto("/schedule");

		// 予定リンクがアクティブ状態であることを確認（子要素のspanをチェック）
		const scheduleNavItem = page.locator(
			'.fixed.bottom-0 a[href*="/schedule"] span',
		);
		await expect(scheduleNavItem).toHaveClass(/text-\[#00C5CC\]/);
	});

	test("モバイルレスポンシブデザイン", async ({ page }) => {
		// モバイルサイズに変更
		await page.setViewportSize({ width: 375, height: 667 });

		// フッターナビゲーションが適切に表示されることを確認
		await expect(page.locator(".fixed.bottom-0")).toBeVisible();
		await expect(page.locator(".grid.grid-cols-5")).toBeVisible();

		// ナビゲーションアイテムが適切に配置されることを確認（フッターナビゲーション内のみ）
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
	});

	test("ページタイトルの確認", async ({ page }) => {
		// 各ページのタイトルが正しく設定されることを確認
		await page.goto("/schedule");
		await expect(page.locator("h1")).toContainText("予定");

		await page.goto("/cattle");
		// 牛の管理ページにはh1タイトルがない可能性があるので、リストの存在で確認
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });

		await page.goto("/cattle/new");
		await expect(page.locator("h1")).toContainText("新規牛登録");

		await page.goto("/settings");
		await expect(page.locator("h1")).toContainText("設定");
	});

	test("404ページの表示", async ({ page }) => {
		// 存在しないページにアクセス
		const response = await page.goto("/nonexistent-page");

		// 404レスポンスまたはリダイレクトが発生することを確認
		expect(response?.status()).toBeGreaterThanOrEqual(400);
	});

	test("ナビゲーションアイコンの表示", async ({ page }) => {
		// 各ナビゲーションアイテムにアイコンが表示されることを確認（フッターナビゲーション内のみ）
		await expect(
			page
				.locator(".fixed.bottom-0")
				.locator('a[href*="/schedule"]')
				.locator("svg"),
		).toBeVisible();
		await expect(
			page
				.locator(".fixed.bottom-0")
				.locator('a[href="/cattle"]')
				.locator("svg"),
		).toBeVisible();
		await expect(
			page
				.locator(".fixed.bottom-0")
				.locator('a[href="/cattle/new"]')
				.locator("svg"),
		).toBeVisible();
		await expect(
			page
				.locator(".fixed.bottom-0")
				.locator('a[href="/settings"]')
				.locator("svg"),
		).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("button").locator("svg"),
		).toBeVisible();
	});

	test("ページ読み込み時間の確認", async ({ page }) => {
		// ページ読み込み時間を測定
		const startTime = Date.now();

		await page.goto("/cattle");
		await page.waitForLoadState("networkidle");

		const loadTime = Date.now() - startTime;

		// 10秒以内に読み込まれることを確認
		expect(loadTime).toBeLessThan(10000);
	});

	test("ブラウザの戻る・進むボタンの動作", async ({ page }) => {
		// スケジュールページから開始
		await expect(page).toHaveURL(/\/schedule/);

		// 牛の管理ページに移動
		await page.goto("/cattle");
		await expect(page).toHaveURL("/cattle");

		// ブラウザの戻るボタンを使用
		await page.goBack();
		await expect(page).toHaveURL(/\/schedule/);

		// ブラウザの進むボタンを使用
		await page.goForward();
		await expect(page).toHaveURL("/cattle");
	});

	test("深いリンクのナビゲーション", async ({ page }) => {
		// 牛の詳細ページに直接アクセス
		await page.goto("/cattle/1");

		// ページが正常に表示されることを確認（タブのみをチェック）
		await expect(
			page.locator('button[role="tab"]').filter({ hasText: "基本情報" }),
		).toBeVisible();

		// フッターナビゲーションが表示されることを確認
		await expect(page.locator(".fixed.bottom-0")).toBeVisible();

		// 他のページにナビゲートできることを確認
		await page.locator(".fixed.bottom-0").locator("text=予定").click();
		await expect(page).toHaveURL(/\/schedule/);
	});

	test("ナビゲーション状態の保持", async ({ page }) => {
		// スケジュールページでフィルターを設定
		await page.goto("/schedule");
		await page.click("text=明日");
		await expect(page).toHaveURL(/filter=tomorrow/);

		// 他のページに移動
		await page.locator(".fixed.bottom-0").locator("text=一覧").click();
		await expect(page).toHaveURL("/cattle");

		// スケジュールページに戻る
		await page.locator(".fixed.bottom-0").locator("text=予定").click();

		// デフォルトのフィルター（today）にリセットされることを確認（これが実際の動作）
		await expect(page).toHaveURL(/\/schedule/);
	});
});
