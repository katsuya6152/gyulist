import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/lib/rpc";
import { AlertCircle, ArrowRight, CheckCircle, Lock, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type CompleteRegistrationResponse = {
	message: string;
	success?: boolean;
};

export default function CompleteRegistrationForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const router = useRouter();

	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	if (!token) {
		return (
			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/30 animate-fade-in">
				<Card
					variant="gradient"
					animation="scale"
					className="shadow-xl hover:shadow-2xl max-w-md w-full"
				>
					<CardContent className="p-8 text-center">
						<AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-foreground mb-2">
							エラー
						</h2>
						<p className="text-muted-foreground">トークンが見つかりません</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await client.api.v1.auth.complete.$post({
				json: { token, name, password }
			});
			const data = (await res.json()) as CompleteRegistrationResponse;
			setMessage(data.message);
			if (data.success) {
				setTimeout(() => {
					router.push("/registration-complete");
				}, 1500);
			}
		} catch (err) {
			console.error(err);
			setMessage("エラーが発生しました");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/30 animate-fade-in">
			<div className="w-full max-w-md animate-fade-in-up">
				{/* ヘッダー */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4">
						<User className="w-8 h-8 text-primary-foreground" />
					</div>
					<h1 className="text-3xl font-bold text-foreground mb-2">
						アカウントを完成
					</h1>
					<p className="text-muted-foreground">
						最後のステップで、あなたのアカウントを完成させましょう
					</p>
				</div>

				{/* メインカード */}
				<Card
					variant="gradient"
					animation="scale"
					className="shadow-xl hover:shadow-2xl"
				>
					<CardHeader className="text-center pb-6">
						<CardTitle className="text-xl text-foreground">
							会員登録の完了
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							名前とパスワードを設定してください
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label
									htmlFor="name"
									className="text-sm font-medium text-foreground"
								>
									お名前
								</Label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										id="name"
										type="text"
										placeholder="山田 太郎"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										className="h-12 text-base transition-all duration-200 focus:shadow-md pl-10"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-sm font-medium text-foreground"
								>
									パスワード
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										id="password"
										type="password"
										placeholder="8文字以上で入力"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										minLength={8}
										className="h-12 text-base transition-all duration-200 focus:shadow-md pl-10"
									/>
								</div>
								<p className="text-xs text-muted-foreground">
									セキュリティのため、8文字以上のパスワードを設定してください
								</p>
							</div>

							<Button
								type="submit"
								disabled={loading}
								className="w-full h-12 font-semibold text-base"
							>
								{loading ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										登録中...
									</>
								) : (
									<>
										アカウントを完成
										<ArrowRight className="w-4 h-4 ml-2" />
									</>
								)}
							</Button>
						</form>

						{/* 結果表示 */}
						{message && (
							<Alert
								variant={message.includes("完了") ? "default" : "destructive"}
								className="mt-6"
							>
								{message.includes("完了") ? (
									<CheckCircle className="h-4 w-4" />
								) : (
									<AlertCircle className="h-4 w-4" />
								)}
								<AlertTitle
									className={
										message.includes("完了") ? "text-green-800" : "text-red-800"
									}
								>
									{message.includes("完了") ? "成功" : "エラー"}
								</AlertTitle>
								<AlertDescription
									className={
										message.includes("完了") ? "text-green-700" : "text-red-700"
									}
								>
									{message}
								</AlertDescription>
							</Alert>
						)}

						{/* セキュリティ情報 */}
						<div className="mt-6 p-4 bg-muted/50 rounded-lg">
							<h3 className="text-sm font-medium text-foreground mb-2">
								🔒 セキュリティについて
							</h3>
							<ul className="text-xs text-muted-foreground space-y-1">
								<li>• パスワードは暗号化して保存されます</li>
								<li>• 個人情報は適切に保護されます</li>
								<li>• 24時間以内にメール認証を完了してください</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
