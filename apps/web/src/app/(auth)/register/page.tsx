"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { register } from "./actions";

export const runtime = "edge";

const initialState = {
	success: false,
	message: ""
};

export default function RegisterPage() {
	const [state, formAction] = useActionState(register, initialState);

	return (
		<div className="max-w-md mx-auto mt-10 p-4 border rounded-lg">
			<h1 className="text-xl mb-4 font-bold">会員登録（ステップ1）</h1>

			<form action={formAction} className="space-y-4">
				<Input
					type="email"
					name="email"
					placeholder="メールアドレス"
					required
				/>
				<Button type="submit">確認メールを送信</Button>
			</form>

			{state.message && (
				<Alert
					variant={state.success ? "default" : "destructive"}
					className="mt-4"
				>
					<AlertTitle>{state.success ? "成功" : "エラー"}</AlertTitle>
					<AlertDescription>{state.message}</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
