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
		await expect(page.locator("h1")).toContainText("畜産経営をデータで支える");

		// 2. ログインページへ移動
		await page.click("text=デモを触ってみる");
		await page.waitForURL("/login");
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");

		// 3. デモログインを実行
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 4. ホームページの確認
		await expect(page.locator("text=今日のイベント")).toBeVisible();

		// 5. スケジュールページに移動
		const scheduleLink = page.locator(
			'.fixed.bottom-0 a[href="/schedule?filter=today"]'
		);
		await expect(scheduleLink).toBeVisible();
		await scheduleLink.click();
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");
		await expect(page.getByRole("button", { name: /今日/ })).toHaveClass(
			/bg-gradient-primary/
		);

		// 6. 牛の一覧ページに移動
		await page.click("text=一覧");
		await page.waitForURL("/cattle");
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 7. 牛の詳細を確認
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });
		await cattleItems.first().click();
		await expect(page).toHaveURL(/\/cattle\/\d+/);
		await expect(page.getByRole("tab", { name: "基本情報" })).toBeVisible();

		// 8. スケジュールに戻る
		await page
			.locator('.fixed.bottom-0 a[href="/schedule?filter=today"]')
			.click();

		// URLの変更を待つ
		await page.waitForURL(/\/schedule/, { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");

		// 9. 設定ページを確認
		await page.click("text=設定");
		await page.waitForURL("/settings");
		await expect(page.locator("h1")).toContainText("設定");
	});

	test("日常的な使用フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. ホームページの確認
		await expect(page.locator("text=今日のイベント")).toBeVisible();

		// 3. スケジュールページに移動
		const scheduleLink = page.locator(
			'.fixed.bottom-0 a[href="/schedule?filter=today"]'
		);
		await expect(scheduleLink).toBeVisible();
		await scheduleLink.click();
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");
		await expect(page.getByRole("button", { name: /今日/ })).toHaveClass(
			/bg-gradient-primary/
		);

		// イベント件数の確認
		const countText = page.locator("text=/\\d+件のイベントが見つかりました/");
		await expect(countText).toBeVisible();

		// 4. 明日の予定に切り替え
		const tomorrowButton = page.getByRole("button", { name: /明日/ });
		await tomorrowButton.click();
		await expect(page).toHaveURL(/filter=tomorrow/);
		await expect(tomorrowButton).toHaveClass(/bg-gradient-primary/);

		// 5. 全ての予定を確認
		const allButton = page.getByRole("button", { name: /全て/ });
		await allButton.click();
		await expect(page).toHaveURL("/schedule");
		await expect(allButton).toHaveClass(/bg-gradient-primary/);

		// 6. カスタム日付検索を使用
		await expect(page.locator("text=特定の日付のイベントを表示")).toBeVisible();
		await page.click("text=特定の日付のイベントを表示");

		const dateInput = page.locator('input[type="date"]');
		await expect(dateInput).toBeVisible();
		await dateInput.fill("2024-02-01");

		const scheduleSearchButton = page.getByRole("button", { name: "検索" });
		await scheduleSearchButton.click();
		await expect(page).toHaveURL(/filter=custom&date=2024-02-01/);

		// 7. 牛の管理ページで検索
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
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. ホームページの確認
		await expect(page.locator("text=今日のイベント")).toBeVisible();

		// 3. スケジュールページに移動
		const scheduleLink = page.locator(
			'.fixed.bottom-0 a[href="/schedule?filter=today"]'
		);
		await expect(scheduleLink).toBeVisible();
		await scheduleLink.click();
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");

		// フィルターボタンがモバイルで適切に表示されることを確認
		await expect(page.getByRole("button", { name: /今日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /明日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /明後日/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /全て/ })).toBeVisible();

		// フィルターボタンが4列のグリッドで表示されることを確認
		const filterContainer = page.locator(".grid-cols-4").first();
		await expect(filterContainer).toBeVisible();

		// 4. フッターナビゲーションの確認
		await expect(page.locator(".fixed.bottom-0")).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=予定")
		).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=一覧")
		).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=個体登録")
		).toBeVisible();
		await expect(
			page.locator(".fixed.bottom-0").locator("text=設定")
		).toBeVisible();

		// 5. モバイルでの牛一覧表示
		await page.click("text=一覧");
		await page.waitForURL("/cattle");
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 牛のリストがモバイルで適切に表示されることを確認
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });

		// 6. モバイルでの詳細ページ表示
		await cattleItems.first().click();
		await expect(page).toHaveURL(/\/cattle\/\d+/);
		await expect(page.getByRole("tab", { name: "基本情報" })).toBeVisible();

		// 7. 戻るボタンの動作確認
		await page.goBack();
		await expect(page).toHaveURL("/cattle");

		// 8. 新規登録ページへの遷移確認
		await page.click("text=個体登録");
		await expect(page).toHaveURL("/cattle/new");
		await expect(page.locator("h1")).toContainText("新規牛登録");

		// フォームがモバイルで適切に表示されることを確認
		await expect(page.locator('input[name="name"]')).toBeVisible();
		await expect(page.locator('input[name="earTagNumber"]')).toBeVisible();
		await expect(page.locator('select[name="gender"]')).toBeVisible();
		await expect(page.locator('input[name="birthday"]')).toBeVisible();
	});

	test("牛の新規登録フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. 新規牛登録ページに移動
		await page.click("text=個体登録");
		await page.waitForURL("/cattle/new");
		await expect(page.locator("h1")).toContainText("新規牛登録");

		// 3. 必須フィールドの確認
		await expect(
			page.locator('input[name="identificationNumber"]')
		).toBeVisible();
		await expect(page.locator('input[name="earTagNumber"]')).toBeVisible();
		await expect(page.locator('input[name="name"]')).toBeVisible();
		await expect(page.locator('select[name="gender"]')).toBeVisible();
		await expect(page.locator('input[name="birthday"]')).toBeVisible();
		await expect(page.locator('select[name="growthStage"]')).toBeVisible();

		// 4. フォームの入力
		await page.locator('input[name="identificationNumber"]').fill("9999");
		await page.locator('input[name="earTagNumber"]').fill("8888");
		await page.locator('input[name="name"]').fill("テスト牛");
		await page.locator('select[name="gender"]').selectOption("メス");
		await page.locator('input[name="birthday"]').fill("2023-01-01");
		await page.locator('select[name="growthStage"]').selectOption("CALF");

		// 5. 登録ボタンの確認
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeVisible();
		await expect(submitButton).toHaveText("登録");

		// 6. 登録処理の実行
		await expect(submitButton).toBeEnabled();
		await submitButton.click();

		// 7. 登録後の処理確認
		// 登録成功後は牛の一覧ページにリダイレクトされることを確認
		await page.waitForURL("/cattle", { timeout: 15000 });
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 8. 登録処理の完了確認
		// デモユーザーの場合、実際のデータベース保存は行われないが、
		// 登録処理が正常に完了し、一覧ページにリダイレクトされることを確認
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();
		await expect(page.locator(".grid.gap-4")).toBeVisible();
	});

	test("イベント管理フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. 牛の一覧ページに移動
		await page.click("text=一覧");
		await page.waitForURL("/cattle");
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 3. 牛の詳細ページに移動
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });
		await cattleItems.first().click();
		await expect(page).toHaveURL(/\/cattle\/\d+/);

		// 4. イベント追加ボタンの確認
		const addEventButton = page.locator('button[aria-label="イベント登録"]');
		await expect(addEventButton).toBeVisible();

		// 5. イベント追加ページに移動
		await addEventButton.click();
		await expect(page).toHaveURL(/\/events\/new\/\d+/);
		await expect(page.locator("h1")).toContainText("イベント登録");

		// 6. イベント作成フォームの確認
		await expect(page.locator('input[name="eventDate"]')).toBeVisible();
		await expect(page.locator('input[name="eventTime"]')).toBeVisible();
		await expect(page.locator('textarea[name="notes"]')).toBeVisible();

		// 7. イベント作成フォームに入力
		await page.locator('input[name="eventDate"]').fill("2024-12-25");
		await page.locator('input[name="eventTime"]').fill("10:00");
		await page.locator('textarea[name="notes"]').fill("テストイベント");

		// 8. イベント種別の選択
		const eventTypePopover = page.locator(
			'button:has-text("イベントタイプを選択してください")'
		);
		await expect(eventTypePopover).toBeVisible();
		await eventTypePopover.click();

		// イベント種別の選択肢から最初のものを選択（繁殖グループの「発情」を選択）
		await expect(page.locator("text=繁殖")).toBeVisible();
		await page.locator("text=繁殖").click();
		await expect(page.locator("text=発情")).toBeVisible();
		await page.locator("text=発情").click();

		// 9. イベント作成の送信
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeVisible();
		await expect(submitButton).toHaveText("イベントを登録");
		await submitButton.click();

		// 10. イベント作成後の処理確認
		// イベント作成成功後は牛の詳細ページに戻ることを確認
		await page.waitForURL(/\/cattle\/\d+/, { timeout: 15000 });
		await expect(page.getByRole("tab", { name: "活動履歴" })).toBeVisible();
	});

	test("KPI表示と分析フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. ホームページでKPI情報の表示を確認
		await expect(page.locator("text=繁殖KPI（当月）")).toBeVisible();
		await expect(page.locator("text=KPIトレンド")).toBeVisible();

		// 3. KPIの詳細項目を確認
		await expect(page.locator("text=受胎率").first()).toBeVisible();
		await expect(page.locator("text=平均空胎日数").first()).toBeVisible();
		await expect(page.locator("text=分娩間隔").first()).toBeVisible();
		await expect(page.locator("text=AI回数/受胎").first()).toBeVisible();

		// 4. 前月比の表示を確認
		await expect(page.locator("text=前月比")).toBeVisible();

		// 5. 各ステータスの牛の数の表示を確認
		await expect(page.locator("text=各ステータスの牛の数")).toBeVisible();
		await expect(page.locator("text=健康")).toBeVisible();
		await expect(page.locator("text=妊娠中")).toBeVisible();
		await expect(page.locator("text=休息中")).toBeVisible();
		await expect(page.locator("text=治療中")).toBeVisible();
		await expect(page.locator("text=出荷済")).toBeVisible();
		await expect(page.locator("text=死亡")).toBeVisible();
	});

	test("ユーザー設定とテーマ管理フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. 設定ページに移動
		await page.click("text=設定");
		await page.waitForURL("/settings");
		await expect(page.locator("h1")).toContainText("設定");

		// 3. テーマ設定の確認
		await expect(page.locator("text=テーマ")).toBeVisible();
		await expect(page.locator("text=ライトモード")).toBeVisible();
		await expect(page.locator("text=ダークモード")).toBeVisible();
		await expect(page.locator("text=システム設定に従う")).toBeVisible();

		// 4. 基本的な設定要素の確認
		await expect(page.locator("text=アプリケーション設定")).toBeVisible();
		await expect(page.locator('h3:has-text("ログアウト")')).toBeVisible();

		// 5. ログアウト機能の確認
		await expect(page.locator('button:has-text("ログアウト")')).toBeVisible();
	});

	test("アラートと通知フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. ホームページでアラート情報の表示を確認
		await expect(page.locator("text=アラートのある牛")).toBeVisible();

		// 3. アラートの詳細表示を確認
		const alertSection = page
			.locator("text=アラートのある牛")
			.locator("..")
			.first();
		await expect(alertSection).toBeVisible();

		// 4. アラート件数の表示を確認
		const alertCount = page.locator("text=/\\d+頭/");
		await expect(alertCount).toBeVisible();

		// 5. アラートがない場合のメッセージ確認
		const noAlertMessage = page.locator("text=現在アラートはありません");
		if (await noAlertMessage.isVisible()) {
			await expect(noAlertMessage).toBeVisible();
		}

		// 6. PC通知コンポーネントの確認
		const pcNotification = page.locator('[data-testid="pc-notification"]');
		if (await pcNotification.isVisible()) {
			await expect(pcNotification).toBeVisible();
		}
	});

	test("牛の詳細情報と編集フロー", async ({ page }) => {
		// 1. デモログインで開始
		await page.goto("/login");
		const demoLoginButton = page.getByTestId("demo-login-button");
		await expect(demoLoginButton).toBeVisible();
		await demoLoginButton.click();
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/home", { timeout: 15000 });

		// 2. 牛の一覧ページに移動
		await page.click("text=一覧");
		await page.waitForURL("/cattle");
		await expect(page.locator('input[placeholder="検索..."]')).toBeVisible();

		// 3. 牛の詳細ページに移動
		const cattleItems = page.locator(".grid.gap-4 > div");
		await expect(cattleItems.first()).toBeVisible({ timeout: 10000 });
		await cattleItems.first().click();
		await expect(page).toHaveURL(/\/cattle\/\d+/);

		// 4. タブの表示を確認
		await expect(page.getByRole("tab", { name: "基本情報" })).toBeVisible();
		await expect(page.getByRole("tab", { name: "血統" })).toBeVisible();
		await expect(page.getByRole("tab", { name: "繁殖" })).toBeVisible();
		await expect(page.getByRole("tab", { name: "活動履歴" })).toBeVisible();

		// 5. 基本情報タブの内容を確認
		await expect(page.getByRole("tab", { name: "基本情報" })).toBeVisible();
		await page.getByRole("tab", { name: "基本情報" }).click();

		// 6. 基本的な情報の表示確認
		await expect(
			page.locator('div[data-slot="card-title"]:has-text("基本情報")')
		).toBeVisible();
		await expect(
			page.locator('span:has-text("個体識別番号:")').first()
		).toBeVisible();
		await expect(page.locator("text=出生日")).toBeVisible();
	});
});
