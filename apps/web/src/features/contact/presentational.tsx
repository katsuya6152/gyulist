"use client";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { submitContactForm } from "./actions";

export function ContactPresentation() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: ""
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.name ||
			!formData.email ||
			!formData.subject ||
			!formData.message
		) {
			toast.error("すべての項目を入力してください");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await submitContactForm(formData);

			if (result.success) {
				toast.success("お問い合わせを送信しました", {
					description: "内容を確認次第、担当者よりご連絡いたします"
				});
				// フォームをリセット
				setFormData({
					name: "",
					email: "",
					subject: "",
					message: ""
				});
			} else {
				toast.error(result.error || "送信に失敗しました");
			}
		} catch (error) {
			console.error("Contact form submission error:", error);
			toast.error("送信に失敗しました");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col items-center">
				<div className="mb-6 max-w-2xl w-full">
					<div className="flex items-center gap-3">
						<MessageSquare className="h-8 w-8 text-primary" />
						<div>
							<h1 className="text-2xl font-bold">お問い合わせ</h1>
							<p className="text-sm text-muted-foreground mt-1">
								ご質問やご要望がございましたら、お気軽にお問い合わせください
							</p>
						</div>
					</div>
				</div>

				<div className="max-w-2xl w-full">
					<Card>
						<CardHeader>
							<CardTitle>お問い合わせフォーム</CardTitle>
							<CardDescription>
								以下のフォームに必要事項をご記入の上、送信してください
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name" className="text-sm font-medium">
											お名前 <span className="text-red-500">*</span>
										</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) =>
												handleInputChange("name", e.target.value)
											}
											placeholder="山田太郎"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email" className="text-sm font-medium">
											メールアドレス <span className="text-red-500">*</span>
										</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) =>
												handleInputChange("email", e.target.value)
											}
											placeholder="example@email.com"
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="subject" className="text-sm font-medium">
										件名 <span className="text-red-500">*</span>
									</Label>
									<Select
										value={formData.subject}
										onValueChange={(value) =>
											handleInputChange("subject", value)
										}
										required
									>
										<SelectTrigger>
											<SelectValue placeholder="お問い合わせの種類を選択してください" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="general">
												一般的なお問い合わせ
											</SelectItem>
											<SelectItem value="technical">
												技術的なサポート
											</SelectItem>
											<SelectItem value="feature">機能のご要望</SelectItem>
											<SelectItem value="bug">バグの報告</SelectItem>
											<SelectItem value="billing">
												料金に関するお問い合わせ
											</SelectItem>
											<SelectItem value="other">その他</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="message" className="text-sm font-medium">
										お問い合わせ内容 <span className="text-red-500">*</span>
									</Label>
									<Textarea
										id="message"
										value={formData.message}
										onChange={(e) =>
											handleInputChange("message", e.target.value)
										}
										placeholder="お問い合わせの詳細をご記入ください"
										rows={6}
										required
									/>
								</div>

								<div className="pt-4">
									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full flex items-center gap-2"
										size="lg"
									>
										<Send className="h-4 w-4" />
										{isSubmitting ? "送信中..." : "送信する"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>

					{/* <div className="mt-6 text-center">
					<p className="text-sm text-muted-foreground">
						お急ぎの場合は、直接メールでご連絡ください
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						<a
							href="mailto:support@gyulist.com"
							className="text-primary hover:underline"
						>
							support@gyulist.com
						</a>
					</p>
				</div> */}
				</div>
			</div>
		</div>
	);
}
