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
import { useEffect } from "react";
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
	const form = useForm<z.infer<typeof preRegisterSchema>>({
		resolver: zodResolver(preRegisterSchema),
		defaultValues: {
			email: "",
			referralSource: undefined,
			turnstileToken: "",
		},
	});

	useEffect(() => {
		const script = document.createElement("script");
		script.src =
			"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
		script.async = true;
		script.onload = () => {
			window.turnstile?.render("#turnstile", {
				sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
				callback: (token: string) => {
					form.setValue("turnstileToken", token);
				},
			});
		};
		document.head.appendChild(script);
		return () => {
			document.head.removeChild(script);
		};
	}, [form]);

	const onSubmit = async (values: z.infer<typeof preRegisterSchema>) => {
		const res = await preRegister(values);
		const resultEl = document.getElementById("waitlist-result");
		if (res.ok) {
			if (res.alreadyRegistered) {
				form.setError("email", { message: "既に登録済みです" });
			} else {
				trackWaitlistSignup();
				onSuccess?.();
				form.reset();
				if (resultEl) {
					resultEl.textContent = "登録完了メールを送信しました";
				}
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
							<FormField
								control={form.control}
								name="referralSource"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<SelectTrigger className="w-[140px]">
													<SelectValue placeholder="流入元" />
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
							<div id="turnstile" />
							<Button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex justify-center items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
								data-cta="waitlist-submit"
							>
								{isSubmitting ? "送信中..." : buttonLabel}
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
				options: { sitekey: string; callback: (token: string) => void },
			) => void;
		};
	}
}
