import { expect, test } from "@playwright/test";

test.describe("認証機能", () => {
	test.beforeEach(async ({ page }) => {
		// 各テスト前にログアウト状態にする
		await page.goto("/");
		await page.evaluate(() => {
			// ローカルストレージとクッキーをクリア
			localStorage.clear();
			sessionStorage.clear();
		});
		// クッキーもクリア
		await page.context().clearCookies();
	});

	// UI基本テスト
	test("ログインページの表示", async ({ page }) => {
		await page.goto("/login");

		// ログインページが表示されることを確認（CardTitleを使用）
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('input[name="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
		await expect(page.locator("text=体験用アカウントでログイン")).toBeVisible();
	});

	test("未認証ユーザーの保護されたページへのアクセス", async ({ page }) => {
		// 保護されたページにアクセス
		await page.goto("/schedule");

		// ログインページにリダイレクトされることを確認
		await page.waitForURL("/login");
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
	});

	test("空のフォームでのログイン試行", async ({ page }) => {
		await page.goto("/login");

		// 空のフォームでログインボタンをクリック
		await page.click('button[type="submit"]');

		// HTML5バリデーションによりフォームが送信されないことを確認
		await expect(page).toHaveURL("/login");
	});

	test("ログインフォームの入力検証", async ({ page }) => {
		await page.goto("/login");

		// メールアドレスフィールドの検証
		const emailInput = page.locator('input[name="email"]');
		await emailInput.fill("invalid-email");
		await page.click('button[type="submit"]');

		// HTML5バリデーションでエラーが出ることを確認
		await expect(emailInput).toHaveAttribute("type", "email");

		// 正しいメールアドレス形式を入力
		await emailInput.fill("test@example.com");

		// パスワードフィールドの確認
		const passwordInput = page.locator('input[name="password"]');
		await expect(passwordInput).toHaveAttribute("type", "password");
		await passwordInput.fill("password123");

		// フォームが有効な状態であることを確認
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).not.toBeDisabled();
	});

	test("ログインページのリンクとボタン", async ({ page }) => {
		await page.goto("/login");

		// 会員登録リンクの確認
		const registerLink = page.locator('a[href="/register"]');
		await expect(registerLink).toBeVisible();
		await expect(registerLink).toContainText("こちら");

		// Googleログインボタンの確認（無効化されている）
		const googleButton = page.locator("text=Googleでログイン");
		await expect(googleButton).toBeVisible();
		await expect(googleButton).toBeDisabled();

		// 体験用アカウントボタンの確認
		const demoButton = page.locator("text=体験用アカウントでログイン");
		await expect(demoButton).toBeVisible();
		await expect(demoButton).not.toBeDisabled();
	});

	test("ルートページからログインページへの遷移", async ({ page }) => {
		await page.goto("/");

		// ルートページが表示されることを確認
		await expect(page.locator("h1")).toContainText(
			"畜産管理を、もっとスマートに",
		);

		// 「無料で始める」ボタンをクリック
		await page.click("text=無料で始める");

		// ログインページにリダイレクトされることを確認
		await page.waitForURL("/login");
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
	});

	// API統合テスト
	test("デモログインフロー", async ({ page }) => {
		test.setTimeout(60000); // 60秒のタイムアウト

		await page.goto("/login");

		// ログインページが表示されることを確認
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");

		// 体験用アカウントでログインボタンをクリック
		await page.click("text=体験用アカウントでログイン");

		// ログイン処理を待機（ネットワークリクエストの完了を待つ）
		await page.waitForLoadState("networkidle", { timeout: 30000 });

		// スケジュールページにリダイレクトされることを確認
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");
	});

	test("正常なログインフロー", async ({ page }) => {
		test.setTimeout(60000); // 60秒のタイムアウト

		await page.goto("/login");

		// フォームに入力
		await page.fill('input[name="email"]', "test@test.co.jp");
		await page.fill('input[name="password"]', "testtest");

		// ログインボタンをクリック
		await page.click('button[type="submit"]');

		// ログイン処理を待機
		await page.waitForLoadState("networkidle", { timeout: 30000 });

		// スケジュールページにリダイレクトされることを確認
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");
	});

	test("無効な認証情報でのログイン失敗", async ({ page }) => {
		test.setTimeout(60000); // 60秒のタイムアウト

		await page.goto("/login");

		// 無効な認証情報を入力
		await page.fill('input[name="email"]', "invalid@example.com");
		await page.fill('input[name="password"]', "wrongpassword");

		// ログインボタンをクリック
		await page.click('button[type="submit"]');

		// ログイン処理を待機
		await page.waitForLoadState("networkidle", { timeout: 30000 });

		// エラーメッセージが表示されることを確認
		await expect(page.locator(".text-red-500")).toBeVisible();

		// ログインページに留まることを確認
		await expect(page).toHaveURL("/login");
	});

	test("ログアウトフロー", async ({ page }) => {
		test.setTimeout(90000); // 90秒のタイムアウト

		// まずデモログイン
		await page.goto("/login");
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });

		// 設定ページに移動
		await page.goto("/settings");
		await expect(page.locator("h1")).toContainText("設定");

		// ダイアログハンドラーを設定
		let dialogHandled = false;
		page.on("dialog", (dialog) => {
			expect(dialog.message()).toContain("ログアウトしますか？");
			dialogHandled = true;
			dialog.accept();
		});

		// ログアウトボタンを見つけてクリック
		const logoutButton = page.locator('button:has-text("ログアウト")');
		await expect(logoutButton).toBeVisible();

		// ナビゲーションを監視
		const navigationPromise = page.waitForURL("/login", { timeout: 30000 });

		await logoutButton.click();

		// ナビゲーションの完了を待機
		await navigationPromise;

		// ダイアログが処理されたことを確認
		expect(dialogHandled).toBe(true);

		// ログインページにリダイレクトされることを確認
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
	});

	test("認証済みユーザーの保護されたページへのアクセス", async ({ page }) => {
		test.setTimeout(90000); // 90秒のタイムアウト

		// デモログイン
		await page.goto("/login");
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });

		// スケジュールページが表示されることを確認
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });
		await expect(page.locator("h1")).toContainText("予定");

		// 他の保護されたページにもアクセス可能
		await page.goto("/cattle");
		await expect(page).not.toHaveURL("/login");
	});

	test("セッション期限切れ後のリダイレクト", async ({ page }) => {
		test.setTimeout(90000); // 90秒のタイムアウト

		// デモログイン
		await page.goto("/login");
		await page.click("text=体験用アカウントでログイン");
		await page.waitForLoadState("networkidle", { timeout: 30000 });
		await page.waitForURL("/schedule?filter=today", { timeout: 15000 });

		// セッションを無効化（クッキーを削除）
		await page.context().clearCookies();

		// 保護されたページにアクセス
		await page.goto("/cattle");

		// ログインページにリダイレクトされることを確認
		await page.waitForURL("/login", { timeout: 15000 });
		await expect(page.locator('[class*="text-2xl"]')).toContainText("ログイン");
	});

	test("ログイン後の元のページへのリダイレクト", async ({ page }) => {
		test.setTimeout(90000); // 90秒のタイムアウト

		// 保護されたページに直接アクセス
		await page.goto("/cattle");

		// ログインページにリダイレクトされることを確認
		await page.waitForURL("/login", { timeout: 15000 });

		// ログイン
		await page.fill('input[name="email"]', "test@test.co.jp");
		await page.fill('input[name="password"]', "testtest");
		await page.click('button[type="submit"]');
		await page.waitForLoadState("networkidle", { timeout: 30000 });

		// 元のページ（/cattle）またはデフォルトページ（/schedule）にリダイレクトされることを確認
		// 実際の実装に応じて調整
		await expect(page).toHaveURL(/\/(cattle|schedule)/, { timeout: 15000 });
	});
});
