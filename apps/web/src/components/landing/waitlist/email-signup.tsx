"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
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
	className?: string;
	buttonLabel?: string;
	sources?: string[];
	onSuccess?: () => void;
}

const defaultSources = ["Twitter/X", "検索", "友人", "ブログ記事", "その他"];

export function EmailSignup({
	className,
	buttonLabel = "登録する",
	sources = defaultSources,
	onSuccess,
}: EmailSignupProps) {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2>(1);
	const [isScriptLoaded, setIsScriptLoaded] = useState(false);
	const [widgetId, setWidgetId] = useState<string | null>(null);
	const turnstileRef = useRef<HTMLDivElement>(null);
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

	const form = useForm<z.infer<typeof preRegisterSchema>>({
		resolver: zodResolver(preRegisterSchema),
		defaultValues: {
			email: "",
			referralSource: undefined,
			turnstileToken: "",
		},
	});

	// Handle Turnstile script loading and widget rendering
	const handleScriptLoad = () => {
		setIsScriptLoaded(true);
	};

	// Render Turnstile widget after script loads
	useEffect(() => {
		if (
			isScriptLoaded &&
			window.turnstile &&
			turnstileRef.current &&
			!widgetId
		) {
			const id = window.turnstile.render(turnstileRef.current, {
				sitekey: siteKey,
				size: "invisible", // 非表示モード
				callback: (token: string) => {
					form.setValue("turnstileToken", token);
				},
				"expired-callback": () => {
					form.setValue("turnstileToken", "");
				},
				"error-callback": () => {
					form.setValue("turnstileToken", "");
				},
			});
			setWidgetId(id);
		}

		// Development fallback
		if (process.env.NODE_ENV !== "production") {
			const timer = setTimeout(() => {
				const currentToken = form.getValues("turnstileToken");
				if (!currentToken || currentToken.length < 10) {
					form.setValue("turnstileToken", "XXXX.DUMMY.TOKEN.XXXX");
				}
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, [isScriptLoaded, siteKey, form, widgetId]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (widgetId && window.turnstile?.remove) {
				window.turnstile.remove(widgetId);
			}
		};
	}, [widgetId]);

	const onSubmit = async (values: z.infer<typeof preRegisterSchema>) => {
		// Step 1: only validate email, then ensure token, then move to step 2
		if (step === 1) {
			const isEmailValid = await form.trigger(["email"]);
			if (!isEmailValid) return;

			// If a valid token already exists (e.g., tests or dev fallback), skip executing
			const existingToken = form.getValues("turnstileToken");
			if (existingToken && existingToken.length >= 10) {
				setStep(2);
				return;
			}

			// Execute invisible Turnstile challenge when token not present
			if (widgetId && window.turnstile) {
				try {
					// Execute the challenge programmatically
					window.turnstile.execute(widgetId);

					// Wait for token to be set (with timeout)
					const waitForToken = () => {
						return new Promise<void>((resolve, reject) => {
							let isResolved = false;

							const checkToken = () => {
								if (isResolved) return;
								const token = form.getValues("turnstileToken");
								if (token && token.length >= 10) {
									isResolved = true;
									clearInterval(interval);
									clearTimeout(timeout);
									resolve();
								}
							};

							// Check immediately
							checkToken();

							// Then check every 100ms for up to 10 seconds
							const interval = setInterval(checkToken, 100);
							const timeout = setTimeout(() => {
								if (!isResolved) {
									isResolved = true;
									clearInterval(interval);
									reject(new Error("Turnstile timeout"));
								}
							}, 10000);
						});
					};

					await waitForToken();
				} catch (error) {
					form.setError("turnstileToken", {
						message: "セキュリティ認証に失敗しました。もう一度お試しください。",
					});
					return;
				}
			}

			const isValid = await form.trigger(["turnstileToken"]);
			if (!isValid) return;
			setStep(2);
			return;
		}

		// Step 2: submit to API
		const res = await preRegister(values);
		const resultEl = document.getElementById("waitlist-result");
		if (res.ok) {
			if (res.alreadyRegistered) {
				form.setError("email", { message: "既に登録済みです" });
			} else {
				trackWaitlistSignup();
				onSuccess?.();
				router.push("/waitlist");
				return;
			}
			return;
		}
		if (res.code === "VALIDATION_FAILED" || res.code === "TURNSTILE_FAILED") {
			for (const [key, msg] of Object.entries(res.fieldErrors ?? {})) {
				form.setError(key as keyof z.infer<typeof preRegisterSchema>, {
					message: msg,
				});
			}
		} else if (resultEl) {
			resultEl.textContent = "エラーが発生しました";
		}
	};

	const isSubmitting = form.formState.isSubmitting;
	const token = form.watch("turnstileToken");
	// For invisible mode, we don't need to check token readiness for UI
	const canSubmit =
		step === 1 ||
		(step === 2 && typeof token === "string" && token.length >= 10);

	return (
		<>
			<Script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js"
				onLoad={handleScriptLoad}
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
								{/* Hidden Turnstile widget */}
								<div className="hidden">
									<div ref={turnstileRef} />
								</div>
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
							</form>
						</Form>
						<p id="waitlist-result" className="text-center mt-4 text-sm" />
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
					appearance?: "always" | "execute" | "interaction-only";
					theme?: "light" | "dark" | "auto";
					size?: "normal" | "compact" | "invisible";
					action?: string;
					cData?: string;
					[key: string]: unknown;
				},
			) => string;
			reset: (widgetId?: string) => void;
			remove: (widgetId: string) => void;
			execute: (widgetId?: string) => void;
			getResponse: (widgetId?: string) => string | undefined;
		};
	}
}
