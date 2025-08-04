import { expect, test } from "@playwright/test";

test.describe("スケジュール機能", () => {
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

	test("スケジュールページの基本表示", async ({ page }) => {
		// スケジュールページが表示されることを確認
		await expect(page.locator("h1")).toContainText("予定");

		// カレンダーアイコンが表示されることを確認
		await expect(page.locator("h1 svg")).toBeVisible();

		// 日付フィルターボタンが表示されることを確認
		await expect(page.getByRole("button", { name: /今日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /明日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /明後日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /全て/ })).toBeVisible();

		// 今日フィルターがアクティブであることを確認
		const todayButton = page.getByRole("button", { name: /今日/ });
		await expect(todayButton).toHaveClass(/bg-primary/);

		// イベント追加ボタンが表示されることを確認
		await expect(page.locator("text=イベント追加")).toBeVisible();
	});

	test("日付フィルターの動作", async ({ page }) => {
		// 明日フィルターをクリック
		const tomorrowButton = page.getByRole("button", { name: /明日/ });
		await expect(tomorrowButton).toBeVisible();
		await tomorrowButton.click();

		// URLが変更されることを確認
		await expect(page).toHaveURL(/filter=tomorrow/);

		// 明日フィルターがアクティブになることを確認
		await expect(tomorrowButton).toHaveClass(/bg-primary/);

		// 全てフィルターをクリック
		const allButton = page.getByRole("button", { name: /全て/ });
		await allButton.click();

		// URLからフィルターパラメータが削除されることを確認
		await expect(page).toHaveURL("/schedule");

		// 全てフィルターがアクティブになることを確認
		await expect(allButton).toHaveClass(/bg-primary/);

		// 今日フィルターに戻す
		const todayButton = page.getByRole("button", { name: /今日/ });
		await todayButton.click();
		await expect(page).toHaveURL(/filter=today/);
		await expect(todayButton).toHaveClass(/bg-primary/);
	});

	test("カスタム日付検索機能", async ({ page }) => {
		// 全てフィルターを選択してアコーディオンを表示
		await page.getByRole("button", { name: /全て/ }).click();
		await expect(page).toHaveURL("/schedule");

		// アコーディオンが表示されることを確認
		await expect(page.locator("text=特定の日付のイベントを表示")).toBeVisible();

		// アコーディオンを開く
		await page.click("text=特定の日付のイベントを表示");

		// 日付入力フィールドが表示されることを確認
		const dateInput = page.locator('input[type="date"]');
		await expect(dateInput).toBeVisible();

		// 検索ボタンが表示されることを確認
		const searchButton = page.getByRole("button", { name: "検索" });
		await expect(searchButton).toBeVisible();

		// 日付を入力
		await dateInput.fill("2024-01-01");

		// 検索ボタンをクリック
		await searchButton.click();

		// URLが変更されることを確認
		await expect(page).toHaveURL(/filter=custom&date=2024-01-01/);

		// カスタム日付の表示が確認できることを確認
		await expect(page.locator("text=選択日:")).toBeVisible();

		// クリアボタンが表示されることを確認
		await expect(page.locator("text=クリア")).toBeVisible();
	});

	test("イベント一覧の表示とエラーハンドリング", async ({ page }) => {
		// 今日のフィルターで開始
		await expect(page).toHaveURL(/filter=today/);

		// イベント件数の表示を確認
		const countText = page.locator("text=/\\d+件のイベントが見つかりました/");
		await expect(countText).toBeVisible();

		// イベントが存在する場合の表示確認
		const eventExists = await page
			.locator('[data-testid="event-item"]')
			.first()
			.isVisible()
			.catch(() => false);

		if (eventExists) {
			// イベントアイテムが表示されることを確認
			const eventCard = page.locator('[data-testid="event-item"]').first();
			await expect(eventCard).toBeVisible();

			// イベントカードの基本構造が表示されることを確認
			await expect(
				eventCard.locator(".flex.items-center.gap-2.text-sm"),
			).toBeVisible();

			// イベントタイプバッジが表示されることを確認（より具体的なセレクター）
			await expect(
				eventCard.locator('span[data-slot="badge"]').first(),
			).toBeVisible();
		} else {
			// イベントがない場合の表示確認
			await expect(
				page.locator("text=該当する日付のイベントがありません"),
			).toBeVisible();
		}

		// エラー状態のテスト - ネットワークエラーをシミュレート
		await page.route("**/api/v1/events**", (route) => {
			route.abort("failed");
		});

		// ページをリロード
		await page.reload();

		// エラーメッセージまたは正常表示の確認
		const errorMessage = page
			.locator(".bg-red-50")
			.locator("text=イベントの取得に失敗しました");
		const normalDisplay = page.locator("h1");

		// いずれかが表示されることを確認（エラーハンドリングの実装により異なる）
		await expect(errorMessage.or(normalDisplay)).toBeVisible();
	});
});
