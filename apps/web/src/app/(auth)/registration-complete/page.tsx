"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { ArrowRight, BarChart3, Bell, CheckCircle, Home } from "lucide-react";
import Link from "next/link";

export const runtime = "edge";

export default function RegistrationCompletePage() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/30 animate-fade-in">
			<div className="w-full max-w-2xl animate-fade-in-up">
				{/* ヘッダー */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
						<CheckCircle className="w-10 h-10 text-white" />
					</div>
					<h1 className="text-4xl font-bold text-foreground mb-3">
						おめでとうございます！
					</h1>
					<p className="text-xl text-muted-foreground">
						ギュウリストの会員登録が完了しました
					</p>
				</div>

				{/* メインカード */}
				<Card
					variant="gradient"
					animation="scale"
					className="shadow-xl hover:shadow-2xl mb-8"
				>
					<CardHeader className="text-center pb-6">
						<CardTitle className="text-2xl text-foreground">
							会員登録完了
						</CardTitle>
						<CardDescription className="text-muted-foreground text-lg">
							これで、ギュウリストのすべての機能をご利用いただけます
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-foreground mb-6">
							畜産管理の効率化を始めましょう。データの入力から分析まで、
							<br />
							直感的な操作で畜産経営をサポートします。
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="/login">
								<Button
									variant="outline"
									className="h-12 px-8 font-semibold text-base"
								>
									ログイン
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* 機能紹介 */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="border-0 bg-muted/30 hover:bg-muted/50 transition-all duration-200">
						<CardContent className="p-6 text-center">
							<div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
								<BarChart3 className="w-6 h-6 text-blue-600" />
							</div>
							<h3 className="font-semibold text-foreground mb-2">データ管理</h3>
							<p className="text-sm text-muted-foreground">
								個体情報、繁殖記録、健康管理など、畜産に必要なデータを一元管理
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 bg-muted/30 hover:bg-muted/50 transition-all duration-200">
						<CardContent className="p-6 text-center">
							<div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
								<CheckCircle className="w-6 h-6 text-green-600" />
							</div>
							<h3 className="font-semibold text-foreground mb-2">繁殖管理</h3>
							<p className="text-sm text-muted-foreground">
								発情期の管理、人工授精の記録、妊娠診断の結果を効率的に管理
							</p>
						</CardContent>
					</Card>

					<Card className="border-0 bg-muted/30 hover:bg-muted/50 transition-all duration-200">
						<CardContent className="p-6 text-center">
							<div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
								<Bell className="w-6 h-6 text-orange-600" />
							</div>
							<h3 className="font-semibold text-foreground mb-2">通知機能</h3>
							<p className="text-sm text-muted-foreground">
								重要なイベントや作業予定を自動でお知らせ、見落としを防止
							</p>
						</CardContent>
					</Card>
				</div>

				{/* サポート情報 */}
				<div className="mt-8 text-center">
					<p className="text-muted-foreground mb-2">
						ご不明な点がございましたら、お気軽にお問い合わせください
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<a
							href="mailto:support@gyulist.com"
							className="text-primary hover:text-primary/80 font-medium hover:underline"
						>
							support@gyulist.com
						</a>
						<span className="text-muted-foreground">|</span>
						<a
							href="https://gyulist.com"
							className="text-primary hover:text-primary/80 font-medium hover:underline"
						>
							公式サイト
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
