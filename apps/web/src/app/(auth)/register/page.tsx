"use client";

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
import { AlertCircle, ArrowRight, CheckCircle, Mail } from "lucide-react";
import { useActionState } from "react";
import { register } from "./actions";

export const runtime = "edge";

const initialState = {
	success: false,
	message: ""
};

export default function RegisterPage() {
	const [state, formAction] = useActionState(register, initialState);

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/30 animate-fade-in">
			<div className="w-full max-w-md animate-fade-in-up">
				{/* ヘッダー */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4">
						<Mail className="w-8 h-8 text-primary-foreground" />
					</div>
					<h1 className="text-3xl font-bold text-foreground mb-2">
						ギュウリストへようこそ
					</h1>
					<p className="text-muted-foreground">
						畜産管理をより簡単に、より効率的に
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
							会員登録を開始
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							メールアドレスを入力して、確認メールをお送りします
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={formAction} className="space-y-6">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-sm font-medium text-foreground"
								>
									メールアドレス
								</label>
								<Input
									id="email"
									type="email"
									name="email"
									placeholder="your@email.com"
									required
									className="h-12 text-base transition-all duration-200 focus:shadow-md"
								/>
							</div>

							<Button
								type="submit"
								className="w-full h-12 font-semibold text-base"
							>
								確認メールを送信
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</form>

						{/* 結果表示 */}
						{state.message && (
							<Alert
								variant={state.success ? "default" : "destructive"}
								className="mt-6"
							>
								{state.success ? (
									<CheckCircle className="h-4 w-4" />
								) : (
									<AlertCircle className="h-4 w-4" />
								)}
								<AlertTitle>{state.success ? "送信完了" : "エラー"}</AlertTitle>
								<AlertDescription>{state.message}</AlertDescription>
							</Alert>
						)}

						{/* フッター */}
						<div className="mt-8 pt-6 border-t border-border text-center">
							<p className="text-sm text-muted-foreground">
								既にアカウントをお持ちですか？{" "}
								<a
									href="/login"
									className="text-primary hover:text-primary/80 font-medium hover:underline"
								>
									ログイン
								</a>
							</p>
						</div>
					</CardContent>
				</Card>

				{/* 特徴説明 */}
				<div className="mt-8 grid grid-cols-1 gap-4 text-center">
					<div className="text-sm text-muted-foreground">
						<p className="font-medium text-foreground mb-1">
							✨ 簡単な畜産管理
						</p>
						<p>直感的な操作で畜産データを管理</p>
					</div>
					<div className="text-sm text-muted-foreground">
						<p className="font-medium text-foreground mb-1">📊 詳細な分析</p>
						<p>繁殖成績や生産性を可視化</p>
					</div>
					<div className="text-sm text-muted-foreground">
						<p className="font-medium text-foreground mb-1">🔔 スマート通知</p>
						<p>重要なイベントを自動でお知らせ</p>
					</div>
				</div>
			</div>
		</div>
	);
}
