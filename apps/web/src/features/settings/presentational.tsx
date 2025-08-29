"use client";

import { useTheme } from "@/lib/theme-provider";
import { useState } from "react";
import { toast } from "sonner";
import { logoutAction, updateThemeAction } from "./actions";
import { AccountSettingsCard } from "./components/AccountSettingsCard";
import { ApplicationSettingsCard } from "./components/ApplicationSettingsCard";
import { SettingsHeader } from "./components/SettingsHeader";
import { SupportCard } from "./components/SupportCard";
import type { ThemeOption } from "./constants";

export function SettingsPresentation() {
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
	const { theme, setTheme } = useTheme();

	const handleLogout = async () => {
		if (confirm("ログアウトしますか？")) {
			setIsLoggingOut(true);
			try {
				await logoutAction();
			} catch (error) {
				console.error("Logout error:", error);
				setIsLoggingOut(false);
			}
		}
	};

	const handleThemeChange = async (newTheme: ThemeOption) => {
		setIsUpdatingTheme(true);
		try {
			// ローカル状態を即座に更新
			setTheme(newTheme);

			// データベースに保存
			const result = await updateThemeAction(newTheme);

			if (result.success) {
				if ("message" in result && result.message === "demo") {
					toast.info("テーマを更新しました", {
						description:
							"デモアカウントのため、実際にデータベースには保存されていません"
					});
				} else {
					toast.success("テーマを更新しました");
				}
			} else {
				toast.error(result.error || "テーマの更新に失敗しました");
				// エラー時は元のテーマに戻す
				setTheme(theme);
			}
		} catch (error) {
			console.error("Failed to update theme:", error);
			toast.error("テーマの更新に失敗しました");
			// エラー時は元のテーマに戻す
			setTheme(theme);
		} finally {
			setIsUpdatingTheme(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<SettingsHeader />

			<div className="space-y-6">
				<ApplicationSettingsCard
					theme={theme}
					onThemeChange={handleThemeChange}
					isUpdatingTheme={isUpdatingTheme}
				/>

				<SupportCard />

				<AccountSettingsCard
					onLogout={handleLogout}
					isLoggingOut={isLoggingOut}
				/>
			</div>
		</div>
	);
}
