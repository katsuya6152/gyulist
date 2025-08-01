"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "./actions";

export function SettingsPresentation() {
	const [isLoggingOut, setIsLoggingOut] = useState(false);

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

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">設定</h1>
				<p className="text-sm text-gray-500 mt-1">
					アカウント設定とアプリケーションの設定を管理します
				</p>
			</div>

			<div className="space-y-6">
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
							<p className="text-sm text-gray-500">
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

				{/* その他の設定（将来の拡張用） */}
				<Card>
					<CardHeader>
						<CardTitle>アプリケーション設定</CardTitle>
						<CardDescription>
							アプリケーションの動作に関する設定
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-sm text-gray-500">
							設定項目は今後追加予定です
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
