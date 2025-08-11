"use client";

import { useEffect, useState } from "react";
import { preRegisterSchema } from "./schema";

const options = ["Twitter/X", "検索", "友人", "ブログ記事", "その他"];

export function PreRegisterForm() {
	const [token, setToken] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		(window as unknown as { onTurnstile: (t: string) => void }).onTurnstile = (
			t,
		) => setToken(t);
		const script = document.createElement("script");
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
		script.async = true;
		document.head.appendChild(script);
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const input = {
			email: String(formData.get("email") || ""),
			referralSource: String(formData.get("referralSource") || ""),
			turnstileToken: token,
		};
		const parsed = preRegisterSchema.safeParse(input);
		if (!parsed.success) {
			setMessage("入力が正しくありません");
			return;
		}
		setLoading(true);
		const res = await fetch("/api/v1/pre-register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(parsed.data),
		});
		const data = await res.json();
		if (res.ok && data.ok) {
			if (data.alreadyRegistered) {
				setMessage("このメールは既に登録されています。");
			} else {
				setMessage("登録が完了しました。確認メールをご確認ください。");
			}
		} else {
			setMessage("エラーが発生しました");
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="email">メールアドレス</label>
				<input
					id="email"
					name="email"
					type="email"
					className="border p-2 w-full"
					required
				/>
			</div>
			<div>
				<label htmlFor="referral">どこで知ったか</label>
				<select
					id="referral"
					name="referralSource"
					className="border p-2 w-full"
				>
					<option value="">選択してください</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
			</div>
			<div
				className="cf-turnstile"
				data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
				data-callback="onTurnstile"
			/>
			<button type="submit" disabled={loading} className="border px-4 py-2">
				送信
			</button>
			{loading && <p>送信中...</p>}
			{message && <p>{message}</p>}
		</form>
	);
}
