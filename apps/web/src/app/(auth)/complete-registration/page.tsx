"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/rpc";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CompleteRegistrationPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const router = useRouter();

	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	if (!token) {
		return <div className="p-6 text-center">トークンが見つかりません</div>;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await client.api.v1.auth.complete.$post({
				json: { token, name, password },
			});
			const data = await res.json();
			setMessage(data.message);
			if (data.success) {
				setTimeout(() => {
					router.push("/registration-complete");
				}, 1500);
			}
		} catch (err) {
			console.error(err);
			setMessage("エラーが発生しました");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-4 border rounded-lg">
			<h1 className="text-xl mb-4 font-bold">会員登録（ステップ2）</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					type="text"
					placeholder="名前"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				<Input
					type="password"
					placeholder="パスワード（8文字以上）"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<Button type="submit" disabled={loading}>
					{loading ? "登録中..." : "登録を完了"}
				</Button>
			</form>
			{message && <p className="mt-4">{message}</p>}
		</div>
	);
}
