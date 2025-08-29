import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthCredentials } from "../types";

interface AuthCardProps {
	credentials: AuthCredentials;
	onCredentialsChange: (credentials: AuthCredentials) => void;
	onLogin: (e: React.FormEvent) => void;
}

export function AuthCard({
	credentials,
	onCredentialsChange,
	onLogin
}: AuthCardProps) {
	return (
		<div className="container max-w-lg mx-auto py-10">
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle className="text-xl">事前登録 管理ログイン</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onLogin} className="space-y-3">
						<Input
							placeholder="ユーザー"
							value={credentials.user}
							onChange={(e) =>
								onCredentialsChange({
									...credentials,
									user: e.target.value
								})
							}
						/>
						<Input
							placeholder="パスワード"
							type="password"
							value={credentials.pass}
							onChange={(e) =>
								onCredentialsChange({
									...credentials,
									pass: e.target.value
								})
							}
						/>
						<Button type="submit" className="w-full">
							ログイン
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
