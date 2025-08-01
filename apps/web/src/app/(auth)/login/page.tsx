"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect } from "react";
import { type LoginActionResult, loginAction } from "./actions";

export const runtime = "edge";

export default function LoginPage() {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState<
		LoginActionResult,
		FormData
	>(loginAction, { success: false, message: "" });

	// 成功時のリダイレクト処理
	useEffect(() => {
		if (state?.success) {
			router.push("/cattle");
		}
	}, [state, router]);

	const handleDemoLogin = () => {
		// デモログイン用のFormDataを作成
		const demoFormData = new FormData();
		demoFormData.append("email", "test@test.co.jp");
		demoFormData.append("password", "testtest");

		// startTransitionでラップしてログインアクションを呼び出し
		startTransition(() => {
			formAction(demoFormData);
		});
	};

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className={cn("flex flex-col gap-6")}>
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">ログイン</CardTitle>
							<CardDescription>
								登録したメールアドレスとパスワードを入力してください。
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form action={formAction} className="flex flex-col gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">メールアドレス</Label>
									<Input
										id="email"
										type="email"
										name="email"
										placeholder="m@example.com"
										required
									/>
								</div>
								<div className="grid gap-2">
									<div className="flex items-center">
										<Label htmlFor="password">パスワード</Label>
										<a
											href="/"
											className="text-gray-400 ml-auto inline-block text-xs underline-offset-4 underline pointer-events-none"
										>
											パスワードをお忘れですか？
										</a>
									</div>
									<Input
										id="password"
										type="password"
										name="password"
										placeholder="6文字以上のパスワード"
										required
									/>
								</div>
								{state && !state.success && (
									<div className="text-red-500 text-xs text-center">
										{state.message}
									</div>
								)}
								<Button type="submit" className="w-full" disabled={isPending}>
									{isPending ? "送信中..." : "ログイン"}
								</Button>
								<Button variant="outline" className="w-full" disabled>
									Googleでログイン
								</Button>
								<div className="mt-4 text-center text-sm">
									会員登録がお済みでない方は
									<a href="/register" className="underline underline-offset-4">
										こちら
									</a>
								</div>
								<p className="text-center text-sm font-bold mt-2">もしくは↓</p>
								<Button
									type="button"
									onClick={handleDemoLogin}
									className="w-full bg-green-500 font-bold mt-2"
									disabled={isPending}
								>
									体験用アカウントでログイン
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
