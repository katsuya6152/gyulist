"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { client } from "@/lib/rpc";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { useEffect, useState } from "react";

export const runtime = "edge";

type Props = {
	searchParams: Promise<{ token?: string }>;
};

export default function VerifyPage({ searchParams }: Props) {
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		async function verifyToken() {
			try {
				const params = await searchParams;
				const token =
					typeof params?.token === "string" ? params.token : undefined;

				if (!token) {
					setStatus("error");
					setMessage("トークンが見つかりません");
					return;
				}

				const res = await client.api.v1.auth.verify.$post({ json: { token } });
				if (!res.ok) {
					setStatus("error");
					setMessage("トークンの検証に失敗しました");
					return;
				}

				const data = await res.json();
				setStatus("success");
				setMessage("メール認証が完了しました。次のステップに進みます...");

				// 少し待ってからリダイレクト
				setTimeout(() => {
					redirect(`/complete-registration?token=${token}`);
				}, 2000);
			} catch (error) {
				setStatus("error");
				setMessage("エラーが発生しました");
			}
		}

		verifyToken();
	}, [searchParams]);

	if (status === "loading") {
		return (
			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/30 animate-fade-in">
				<Card
					variant="gradient"
					animation="scale"
					className="shadow-xl hover:shadow-2xl max-w-md w-full"
				>
					<CardHeader className="text-center pb-6">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4">
							<Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
						</div>
						<CardTitle className="text-xl text-foreground">
							メール認証中
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							トークンを検証しています...
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
						<p className="text-muted-foreground mt-4">しばらくお待ちください</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/30 animate-fade-in">
				<Card
					variant="gradient"
					animation="scale"
					className="shadow-xl hover:shadow-2xl max-w-md w-full"
				>
					<CardHeader className="text-center pb-6">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-destructive rounded-full mb-4">
							<AlertCircle className="w-8 h-8 text-destructive-foreground" />
						</div>
						<CardTitle className="text-xl text-foreground">
							認証エラー
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							{message}
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-foreground mb-6">
							メールのリンクが正しくないか、期限が切れている可能性があります。
						</p>
						<a
							href="/register"
							className="inline-block bg-primary hover:bg-primary/80 text-primary-foreground font-medium px-6 py-3 rounded-lg transition-colors duration-200"
						>
							再度登録する
						</a>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/30 animate-fade-in">
			<Card
				variant="gradient"
				animation="scale"
				className="shadow-xl hover:shadow-2xl max-w-md w-full"
			>
				<CardHeader className="text-center pb-6">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
						<CheckCircle className="w-8 h-8 text-white" />
					</div>
					<CardTitle className="text-xl text-foreground">認証完了</CardTitle>
					<CardDescription className="text-muted-foreground">
						{message}
					</CardDescription>
				</CardHeader>
				<CardContent className="text-center">
					<div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto" />
					<p className="text-muted-foreground mt-4">
						次のステップに進んでいます...
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
