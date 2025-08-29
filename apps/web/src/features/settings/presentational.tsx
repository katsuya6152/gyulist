"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/lib/theme-provider";
import { LogOut, MessageSquare, Monitor, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { logoutAction, updateThemeAction } from "./actions";

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

	const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
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
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">設定</h1>
					<p className="text-sm text-muted-foreground mt-1">
						アカウント設定とアプリケーションの設定を管理します
					</p>
				</div>
			</div>

			<div className="space-y-6">
				{/* アプリケーション設定 */}
				<Card>
					<CardHeader>
						<CardTitle>アプリケーション設定</CardTitle>
						<CardDescription>
							アプリケーションの動作に関する設定
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label className="text-base font-medium">テーマ</Label>
							<p className="text-sm text-muted-foreground">
								アプリケーションの見た目をカスタマイズします
							</p>
							<RadioGroup
								value={theme}
								onValueChange={(value) =>
									handleThemeChange(value as "light" | "dark" | "system")
								}
								className="grid grid-cols-1 gap-4 mt-4"
								disabled={isUpdatingTheme}
							>
								<div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
									<RadioGroupItem
										value="light"
										id="light"
										disabled={isUpdatingTheme}
									/>
									<Label
										htmlFor="light"
										className="flex items-center gap-2 cursor-pointer"
									>
										<Sun className="h-4 w-4" />
										ライトモード
										{isUpdatingTheme && (
											<span className="text-sm text-muted-foreground">
												(保存中...)
											</span>
										)}
									</Label>
								</div>
								<div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
									<RadioGroupItem
										value="dark"
										id="dark"
										disabled={isUpdatingTheme}
									/>
									<Label
										htmlFor="dark"
										className="flex items-center gap-2 cursor-pointer"
									>
										<Moon className="h-4 w-4" />
										ダークモード
										{isUpdatingTheme && (
											<span className="text-sm text-muted-foreground">
												(保存中...)
											</span>
										)}
									</Label>
								</div>
								<div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
									<RadioGroupItem
										value="system"
										id="system"
										disabled={isUpdatingTheme}
									/>
									<Label
										htmlFor="system"
										className="flex items-center gap-2 cursor-pointer"
									>
										<Monitor className="h-4 w-4" />
										システム設定に従う
										{isUpdatingTheme && (
											<span className="text-sm text-muted-foreground">
												(保存中...)
											</span>
										)}
									</Label>
								</div>
							</RadioGroup>
						</div>
					</CardContent>
				</Card>

				{/* サポート */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageSquare className="h-5 w-5" />
							サポート
						</CardTitle>
						<CardDescription>
							サポートとお問い合わせに関する設定
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-medium">お問い合わせ</h3>
							<p className="text-sm text-muted-foreground">
								ご質問やご要望がございましたら、お気軽にお問い合わせください
							</p>
						</div>
						<Button
							variant="outline"
							asChild
							className="flex items-center gap-2"
						>
							<Link href="/contact">
								<MessageSquare className="h-4 w-4" />
								お問い合わせ
							</Link>
						</Button>
					</CardContent>
				</Card>

				{/* アカウント設定 */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							アカウント
						</CardTitle>
						<CardDescription>
							アカウントに関する設定を管理します
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-medium">ログアウト</h3>
							<p className="text-sm text-muted-foreground">
								現在のセッションからログアウトします
							</p>
						</div>
						<Button
							variant="outline"
							onClick={handleLogout}
							disabled={isLoggingOut}
							className="flex items-center gap-2"
						>
							<LogOut className="h-4 w-4" />
							{isLoggingOut ? "ログアウト中..." : "ログアウト"}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
