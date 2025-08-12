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
import { useEffect, useState } from "react";
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
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
	const form = useForm<z.infer<typeof preRegisterSchema>>({
		resolver: zodResolver(preRegisterSchema),
		defaultValues: {
			email: "",
			referralSource: undefined,
			turnstileToken: "",
		},
	});

	useEffect(() => {
		// Managed (declarative) mode: define global callbacks referenced by data-attributes
		window.onTurnstileToken = (token: string) => {
			form.setValue("turnstileToken", token);
		};
		window.onTurnstileExpired = () => {
			form.setValue("turnstileToken", "");
		};
		window.onTurnstileError = () => {
			form.setValue("turnstileToken", "");
		};

		// Strict implicit mode: let Cloudflare auto-render manage the widget

		// Safety net: if token isn't set shortly after mount in dev, set a dummy token
		const t = setTimeout(() => {
			if (process.env.NODE_ENV !== "production") {
				const cur = form.getValues("turnstileToken");
				if (!cur || cur.length < 10) {
					form.setValue("turnstileToken", "XXXX.DUMMY.TOKEN.XXXX");
				}
			}
		}, 1500);
		return () => {
			clearTimeout(t);
			window.onTurnstileToken = undefined;
			window.onTurnstileExpired = undefined;
			window.onTurnstileError = undefined;
		};
	}, [form]);

	const onSubmit = async (values: z.infer<typeof preRegisterSchema>) => {
		// Step 1: only validate email and token, then move to step 2
		if (step === 1) {
			const isValid = await form.trigger(["email", "turnstileToken"]);
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
	const isTokenReady = typeof token === "string" && token.length >= 10;

	return (
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
							className="mt-6 flex flex-col sm:flex-row gap-3"
							aria-live="polite"
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="flex-1">
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
											<Input type="hidden" {...field} data-testid="turnstile" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div
								id="turnstile"
								className="cf-turnstile"
								data-sitekey={siteKey}
								data-callback="onTurnstileToken"
								data-expired-callback="onTurnstileExpired"
								data-error-callback="onTurnstileError"
								data-appearance="always"
								data-action="waitlist_signup"
							/>
							<Button
								type="submit"
								disabled={isSubmitting || !isTokenReady}
								className="inline-flex justify-center items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
								data-cta="waitlist-submit"
							>
								{isSubmitting ? "送信中..." : step === 1 ? "次へ" : buttonLabel}
							</Button>
						</form>
					</Form>
					<p id="waitlist-result" className="text-center mt-4 text-sm" />
				</div>
			</div>
		</section>
	);
}

declare global {
	interface Window {
		turnstile?: {
			render: (
				element: string | HTMLElement,
				options: {
					sitekey: string;
					callback: (token: string) => void;
					appearance?: string;
					action?: string;
					[key: string]: unknown;
				},
			) => void;
			reset?: () => void;
		};
		onTurnstileToken?: (token: string) => void;
		onTurnstileExpired?: () => void;
		onTurnstileError?: () => void;
	}
}
