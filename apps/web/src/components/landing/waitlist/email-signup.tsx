"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { trackWaitlistSignup } from "@/lib/analytics";
import { preRegister, preRegisterSchema } from "@/services/preRegisterService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface EmailSignupProps {
	buttonLabel?: string;
	sources?: string[];
	onSuccess?: () => void;
}

const defaultSources = ["Twitter/X", "検索", "友人", "ブログ記事", "その他"];

export function EmailSignup({
	buttonLabel = "登録する",
	sources = defaultSources,
	onSuccess
}: EmailSignupProps) {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2>(1);
	const [widgetId, setWidgetId] = useState<string | null>(null);
	const turnstileRef = useRef<HTMLDivElement>(null);

	const siteKey =
		process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
		(process.env.NODE_ENV !== "production" ? "1x00000000000000000000AA" : "");

	const form = useForm<z.infer<typeof preRegisterSchema>>({
		resolver: zodResolver(preRegisterSchema),
		defaultValues: {
			email: "",
			referralSource: undefined,
			turnstileToken: ""
		}
	});

	// Turnstileウィジェットの初期化
	useEffect(() => {
		const initTurnstile = () => {
			if (!window.turnstile || !turnstileRef.current || widgetId || !siteKey) {
				return;
			}

			try {
				const id = window.turnstile.render(turnstileRef.current, {
					sitekey: siteKey,
					size: "normal",
					callback: (token: string) => {
						form.setValue("turnstileToken", token);
					},
					"expired-callback": () => {
						form.setValue("turnstileToken", "");
					},
					"error-callback": () => {
						form.setValue("turnstileToken", "");
					}
				});
				setWidgetId(id);
			} catch (error) {
				console.warn("Failed to render Turnstile widget:", error);
			}
		};

		// スクリプト読み込み後の初期化
		if (window.turnstile) {
			initTurnstile();
		} else {
			// スクリプト読み込み待機
			const checkTurnstile = setInterval(() => {
				if (window.turnstile) {
					clearInterval(checkTurnstile);
					initTurnstile();
				}
			}, 100);

			// 3秒後にタイムアウト
			const fallbackTimer = setTimeout(() => {
				clearInterval(checkTurnstile);
				console.warn("Turnstile script loading timeout");
			}, 3000);

			return () => {
				clearInterval(checkTurnstile);
				clearTimeout(fallbackTimer);
			};
		}
	}, [siteKey, form, widgetId]);

	// クリーンアップ
	useEffect(() => {
		return () => {
			if (widgetId && window.turnstile?.remove) {
				window.turnstile.remove(widgetId);
			}
		};
	}, [widgetId]);

	const onSubmit = async (values: z.infer<typeof preRegisterSchema>) => {
		// Step 1: メール検証とTurnstileトークン取得
		if (step === 1) {
			const isEmailValid = await form.trigger(["email"]);
			if (!isEmailValid) return;

			// Turnstileトークンチェック
			const token = form.getValues("turnstileToken");
			if (!token || token.length < 10) {
				form.setError("turnstileToken", {
					message: "セキュリティ認証を完了してください。"
				});
				return;
			}

			setStep(2);
			return;
		}

		// Step 2: API送信
		console.log("Submitting pre-registration...", values);
		const res = await preRegister(values);
		console.log("Pre-registration response:", res);
		console.log("Response type:", typeof res);
		console.log("Response ok property:", res.ok);
		console.log("Response alreadyRegistered property:", res.alreadyRegistered);
		console.log("Full response object:", JSON.stringify(res, null, 2));

		// レスポンスの構造を確認して適切に処理
		let isSuccess = false;
		let isAlreadyRegistered = false;

		if (res && typeof res === "object") {
			isSuccess = res.ok === true;
			isAlreadyRegistered = res.alreadyRegistered === true;
		}

		if (isSuccess) {
			if (isAlreadyRegistered) {
				console.log("User already registered");
				form.setError("email", { message: "既に登録済みです" });
			} else {
				console.log("Pre-registration successful, redirecting to /waitlist...");
				trackWaitlistSignup();
				onSuccess?.();

				// 遷移処理を改善
				try {
					// フォームをリセット
					form.reset();

					// 少し待ってから遷移（UIの更新を確実にするため）
					setTimeout(() => {
						console.log("Executing router.push('/waitlist')...");
						// メールアドレスをクエリパラメータとして渡す
						router.push(`/waitlist?email=${encodeURIComponent(values.email)}`);
					}, 100);
				} catch (error) {
					console.error("Navigation error:", error);
					// フォールバック: window.locationを使用
					window.location.href = `/waitlist?email=${encodeURIComponent(values.email)}`;
				}
			}
			return;
		}

		// エラーハンドリング
		console.error("Pre-registration failed:", res);
		if (res.code === "VALIDATION_FAILED" || res.code === "TURNSTILE_FAILED") {
			for (const [key, msg] of Object.entries(res.fieldErrors ?? {})) {
				form.setError(key as keyof z.infer<typeof preRegisterSchema>, {
					message: msg
				});
			}
		} else {
			// 一般的なエラーはコンソールに記録
			console.error("Unexpected error during registration:", res);

			// レスポンスの構造が不明な場合のフォールバック処理
			if (res && typeof res === "object" && res.data) {
				console.log("Attempting to extract data from nested response...");
				const nestedData = res.data;
				if (nestedData.ok === true) {
					console.log("Found success in nested data, attempting redirect...");
					try {
						form.reset();
						setTimeout(() => {
							router.push(
								`/waitlist?email=${encodeURIComponent(values.email)}`
							);
						}, 100);
						return;
					} catch (error) {
						console.error("Fallback navigation failed:", error);
					}
				}
			}

			// ユーザーにもエラーを表示
			form.setError("email", {
				message:
					"登録処理中にエラーが発生しました。しばらく時間をおいて再度お試しください。"
			});
		}
	};

	const isSubmitting = form.formState.isSubmitting;
	const token = form.watch("turnstileToken");
	const canSubmit =
		step === 1 ||
		(step === 2 && typeof token === "string" && token.length >= 10);

	return (
		<>
			<Script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js"
				onError={() => console.warn("Failed to load Turnstile script")}
				strategy="afterInteractive"
			/>
			<section id="waitlist" className="py-12 md:py-16 bg-blue-50">
				<div className="container mx-auto px-4 max-w-2xl">
					<div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-blue-100">
						<h2 className="text-xl md:text-2xl font-bold text-center">
							正式開始の先行案内を受け取る
						</h2>
						<p className="mt-2 text-center text-gray-600">
							メールを登録すると、先行アクセスや特典のご案内をお送りします。
						</p>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="mt-6 space-y-4"
								aria-live="polite"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="sr-only">メールアドレス</FormLabel>
											<FormControl>
												<Input
													id="waitlist-email"
													type="email"
													placeholder="メールアドレス"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{step === 2 && (
									<FormField
										control={form.control}
										name="referralSource"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													どこでギュウリストを知りましたか？（任意）
												</FormLabel>
												<FormControl>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="選択してください" />
														</SelectTrigger>
														<SelectContent>
															{sources.map((src) => (
																<SelectItem key={src} value={src}>
																	{src}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
								<FormField
									control={form.control}
									name="turnstileToken"
									render={({ field }) => (
										<FormItem className="hidden">
											<FormControl>
												<Input
													type="hidden"
													{...field}
													data-testid="turnstile"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									disabled={isSubmitting || !canSubmit}
									className="w-full bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
									data-cta="waitlist-submit"
								>
									{isSubmitting
										? "送信中..."
										: step === 1
											? "次へ"
											: buttonLabel}
								</Button>
								<div className="flex justify-center py-2">
									<div ref={turnstileRef} />
								</div>
							</form>
						</Form>
					</div>
				</div>
			</section>
		</>
	);
}

declare global {
	interface Window {
		turnstile?: {
			render: (
				element: string | HTMLElement,
				options: {
					sitekey: string;
					callback?: (token: string) => void;
					"expired-callback"?: () => void;
					"error-callback"?: () => void;
					size?: "normal" | "compact" | "invisible";
				}
			) => string;
			remove: (widgetId: string) => void;
		};
	}
}
