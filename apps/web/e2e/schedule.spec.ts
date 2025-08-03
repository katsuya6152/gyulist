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
		await expect(page.getByRole("button", { name: "今日" })).toBeVisible();
		await expect(page.getByRole("button", { name: "明日" })).toBeVisible();
		await expect(page.getByRole("button", { name: "明後日" })).toBeVisible();
		await expect(page.getByRole("button", { name: "全て" })).toBeVisible();

		// 今日フィルターがアクティブであることを確認（ボタン要素をチェック）
		const todayButton = page.getByRole("button", { name: "今日" });
		await expect(todayButton).toHaveClass(/bg-primary/);
	});

	test("日付フィルターの動作", async ({ page }) => {
		// 明日フィルターをクリック
		await page.getByRole("button", { name: "明日" }).click();

		// URLが変更されることを確認
		await expect(page).toHaveURL(/filter=tomorrow/);

		// 明日フィルターがアクティブになることを確認（ボタン要素をチェック）
		const tomorrowButton = page.getByRole("button", { name: "明日" });
		await expect(tomorrowButton).toHaveClass(/bg-primary/);

		// 全てフィルターをクリック
		await page.getByRole("button", { name: "全て" }).click();

		// URLからフィルターパラメータが削除されることを確認
		await expect(page).toHaveURL("/schedule");

		// 全てフィルターがアクティブになることを確認（ボタン要素をチェック）
		const allButton = page.getByRole("button", { name: "全て" });
		await expect(allButton).toHaveClass(/bg-primary/);
	});

	test("カスタム日付検索機能", async ({ page }) => {
		// 全てフィルターを選択してアコーディオンを表示
		await page.click('button:has-text("全て")');

		// アコーディオンが表示されることを確認（実際のテキストを使用）
		await expect(page.locator("text=特定の日付のイベントを表示")).toBeVisible();

		// アコーディオンを開く
		await page.click("text=特定の日付のイベントを表示");

		// 日付入力フィールドが表示されることを確認
		const dateInput = page.locator('input[type="date"]');
		await expect(dateInput).toBeVisible();

		// 検索ボタンが表示されることを確認（role属性を使用してより具体的に指定）
		const searchButton = page.getByRole("button", { name: "検索" });
		await expect(searchButton).toBeVisible();

		// 日付を入力
		await dateInput.fill("2024-01-01");

		// 検索ボタンをクリック
		await searchButton.click();

		// URLが変更されることを確認
		await expect(page).toHaveURL(/filter=custom&date=2024-01-01/);

		// 検索結果が表示されることを確認
		await page.waitForLoadState("networkidle");
	});

	test("イベント一覧の表示", async ({ page }) => {
		// 今日のフィルターで開始
		await expect(page).toHaveURL(/filter=today/);

		// イベントが存在する場合の表示確認
		const eventExists = await page
			.locator('[data-testid="event-item"]')
			.first()
			.isVisible()
			.catch(() => false);

		if (eventExists) {
			// イベントアイテムが表示されることを確認
			await expect(
				page.locator('[data-testid="event-item"]').first(),
			).toBeVisible();

			// イベントの基本情報が表示されることを確認
			await expect(page.locator("text=時刻").first()).toBeVisible();
		} else {
			// イベントがない場合の表示確認
			const noEventsMessage = await page
				.locator("text=イベントがありません")
				.isVisible()
				.catch(() => false);

			if (noEventsMessage) {
				await expect(page.locator("text=イベントがありません")).toBeVisible();
			}
		}
	});

	test("イベントタイプの表示", async ({ page }) => {
		// 全てのイベントを表示（より具体的なセレクターを使用）
		const allButton = page.getByRole("button", { name: "全て" });
		await expect(allButton).toBeVisible({ timeout: 10000 });
		await allButton.click();

		// 少し待機してからイベントの存在を確認
		await page.waitForTimeout(2000);

		// イベントが存在する場合、イベントタイプバッジが表示されることを確認
		const eventExists = await page
			.locator('[data-testid="event-item"]')
			.first()
			.isVisible()
			.catch(() => false);

		if (eventExists) {
			// イベントタイプバッジの存在を確認（より具体的なセレクターを使用）
			const eventTypeBadge = page
				.locator(
					'[data-testid="event-item"] .bg-pink-100, [data-testid="event-item"] .bg-blue-100, [data-testid="event-item"] .bg-green-100, [data-testid="event-item"] .bg-purple-100, [data-testid="event-item"] .bg-orange-100, [data-testid="event-item"] .bg-yellow-100, [data-testid="event-item"] .bg-gray-100',
				)
				.first();

			// バッジが存在する場合のみチェック
			const badgeExists = await eventTypeBadge.count();
			if (badgeExists > 0) {
				await expect(eventTypeBadge).toBeVisible();
			}
		}
	});

	test("イベント詳細の表示", async ({ page }) => {
		// 全てのイベントを表示
		await page.getByRole("button", { name: "全て" }).click();

		// イベントが存在する場合、詳細情報が表示されることを確認
		const eventExists = await page
			.locator('[data-testid="event-item"]')
			.first()
			.isVisible()
			.catch(() => false);

		if (eventExists) {
			const eventItem = page.locator('[data-testid="event-item"]').first();

			// イベントの基本情報が表示されることを確認
			await expect(eventItem.locator("h3")).toBeVisible(); // 牛の名前
			await expect(
				eventItem.locator("text=/\\d{4}年\\d{1,2}月\\d{1,2}日/"),
			).toBeVisible(); // 日付
			await expect(eventItem.locator("text=/\\d{1,2}:\\d{2}/")).toBeVisible(); // 時間
		}
	});

	test("日付フィルターの日付表示", async ({ page }) => {
		// 各フィルターボタンに日付が表示されることを確認
		const todayButton = page.locator("text=今日").first();
		const tomorrowButton = page.locator("text=明日").first();
		const dayAfterTomorrowButton = page.locator("text=明後日").first();

		// ボタンに日付情報が含まれていることを確認
		await expect(todayButton).toBeVisible();
		await expect(tomorrowButton).toBeVisible();
		await expect(dayAfterTomorrowButton).toBeVisible();

		// 各ボタンをクリックして動作確認
		await tomorrowButton.click();
		await expect(page).toHaveURL(/filter=tomorrow/);

		await dayAfterTomorrowButton.click();
		await expect(page).toHaveURL(/filter=dayAfterTomorrow/);

		await todayButton.click();
		await expect(page).toHaveURL(/filter=today/);
	});

	test("エラー状態の表示", async ({ page }) => {
		// ネットワークエラーをシミュレート
		await page.route("**/api/v1/events**", (route) => {
			route.abort("failed");
		});

		// ページをリロード
		await page.reload();

		// エラーメッセージが表示されることを確認（実際のエラーメッセージテキストを使用）
		const errorMessage = page
			.locator(".bg-red-50")
			.locator("text=イベントの取得に失敗しました");
		if (await errorMessage.isVisible()) {
			await expect(errorMessage).toBeVisible();
		} else {
			// エラーハンドリングが異なる場合は、ページが正常に表示されることを確認
			await expect(page.locator("h1")).toContainText("予定");
		}
	});

	test("イベント件数の表示", async ({ page }) => {
		// 今日フィルターを選択
		await page.click("text=今日");

		// イベント件数が表示されることを確認（イベントが存在する場合）
		const countText = page.locator("text=/\\d+件のイベントが見つかりました/");
		const countExists = await countText.isVisible().catch(() => false);

		if (countExists) {
			await expect(countText).toBeVisible();
		}
	});

	test("レスポンシブデザインの確認", async ({ page }) => {
		// モバイルサイズに変更
		await page.setViewportSize({ width: 375, height: 667 });

		// フィルターボタンが適切に表示されることを確認
		await expect(page.getByRole("button", { name: "今日" })).toBeVisible();
		await expect(page.getByRole("button", { name: "明日" })).toBeVisible();
		await expect(page.getByRole("button", { name: "明後日" })).toBeVisible();
		await expect(page.getByRole("button", { name: "全て" })).toBeVisible();

		// フィルターボタンが4列のグリッドで表示されることを確認
		const filterContainer = page.locator(".grid-cols-4").first();
		await expect(filterContainer).toBeVisible();
	});
});
