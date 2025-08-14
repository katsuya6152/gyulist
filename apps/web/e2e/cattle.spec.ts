import { expect, test } from "@playwright/test";

test.describe("牛の管理機能", () => {
	test.beforeEach(async ({ page }) => {
		// 各テスト前にログアウト状態にする
		await page.goto("/");
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});
		await page.context().clearCookies();

		// デモログイン
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
	});

	test("牛の一覧ページの表示", async ({ page }) => {
		// 牛の一覧ページに移動
		await page.goto("/cattle");

		// ページの基本要素が表示されることを確認（h1はないので検索バーで確認）
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 検索バーの確認
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 並び替えボタンの確認
		await expect(page.locator("text=並び替え")).toBeVisible();

		// 絞り込みボタンの確認
		await expect(page.locator("text=絞り込み")).toBeVisible();

		// 牛のリストが表示されることを確認
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });

		// 牛カードの基本構造を確認
		const firstCattle = cattleItems.first();
		await expect(firstCattle.locator("text=/耳標番号/")).toBeVisible();
	});

	test("牛の検索機能", async ({ page }) => {
		await page.goto("/cattle");

		// 検索入力フィールドを見つける
		const searchInput = page.locator('input[placeholder="検索..."]');
		await expect(searchInput).toBeVisible();

		// 検索文字を入力
		await searchInput.fill("たろう");

		// 検索フォーム内の検索ボタンをクリック（より具体的なセレクター）
		const searchButton = page.locator('form button[type="submit"]').first();
		await expect(searchButton).toBeVisible();
		await searchButton.click();

		// URLに検索パラメータが含まれることを確認（エンコードされた形式）
		await expect(page).toHaveURL(/search=/);

		// 検索結果が表示されることを確認（結果があるかないかに関わらず）
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 5000 });

		// 検索をクリア（「検索をクリア」ボタンを優先的に使用）
		const clearSearchButton = page.locator('button:has-text("検索をクリア")');
		const hasClearSearchButton = await clearSearchButton
			.isVisible()
			.catch(() => false);

		if (hasClearSearchButton) {
			await clearSearchButton.click();
		} else {
			// フォールバック: 入力フィールドをクリアして再検索
			await searchInput.clear();
			await searchButton.click();
		}

		// 全ての牛が再表示されることを確認
		await expect(cattleItems.first()).toBeVisible();
	});

	test("牛の詳細ページへの遷移", async ({ page }) => {
		await page.goto("/cattle");

		// 牛のリストが表示されるまで待機
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });

		// 最初の牛カードをクリック
		const firstCattle = cattleItems.first();
		await firstCattle.click();

		// 詳細ページに遷移することを確認
		await expect(page).toHaveURL(/\/cattle\/\d+/);

		// 詳細ページの基本要素が表示されることを確認（h1ではなく牛の名前で確認）
		await expect(page.getByRole("tab", { name: "基本情報" })).toBeVisible();

		// イベント追加ボタンが表示されることを確認
		await expect(
			page.getByRole("button", { name: "イベント登録" })
		).toBeVisible();

		// 戻るボタンの動作確認
		await page.goBack();
		await expect(page).toHaveURL("/cattle");
	});

	test("牛の新規登録ページへの遷移", async ({ page }) => {
		// フッターナビゲーションの個体登録ボタンを使用
		await page.click("text=個体登録");

		// 新規登録ページに遷移することを確認
		await expect(page).toHaveURL("/cattle/new");

		// 新規登録ページの基本要素が表示されることを確認
		await expect(page.locator("h1")).toContainText("新規牛登録");

		// フォームの基本フィールドが表示されることを確認
		await expect(page.locator('input[name="name"]')).toBeVisible();
		await expect(page.locator('input[name="earTagNumber"]')).toBeVisible();
		await expect(page.locator('select[name="gender"]')).toBeVisible();
		await expect(page.locator('input[name="birthday"]')).toBeVisible();

		// 登録ボタンが表示されることを確認
		await expect(page.locator('button[type="submit"]')).toBeVisible();

		// キャンセルボタンが表示されることを確認
		await expect(page.locator("text=キャンセル")).toBeVisible();

		// フォームの基本的な入力検証
		const nameInput = page.locator('input[name="name"]');
		await nameInput.fill("テスト牛");
		await expect(nameInput).toHaveValue("テスト牛");

		// 耳標番号の入力
		const earTagInput = page.locator('input[name="earTagNumber"]');
		await earTagInput.fill("12345");
		await expect(earTagInput).toHaveValue("12345");

		// キャンセルボタンで一覧に戻る
		await page.click("text=キャンセル");
		await expect(page).toHaveURL("/cattle");
	});
});
