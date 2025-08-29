import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { LogOut } from "lucide-react";

interface AccountSettingsCardProps {
	onLogout: () => void;
	isLoggingOut: boolean;
}

export function AccountSettingsCard({
	onLogout,
	isLoggingOut
}: AccountSettingsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<LogOut className="h-5 w-5" />
					アカウント
				</CardTitle>
				<CardDescription>アカウントに関する設定を管理します</CardDescription>
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
					onClick={onLogout}
					disabled={isLoggingOut}
					className="flex items-center gap-2"
				>
					<LogOut className="h-4 w-4" />
					{isLoggingOut ? "ログアウト中..." : "ログアウト"}
				</Button>
			</CardContent>
		</Card>
	);
}
