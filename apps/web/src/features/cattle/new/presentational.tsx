"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { createCattleAction } from "./actions";
import { createCattleSchema } from "./schema";

export function CattleNewPresentation() {
	const router = useRouter();
	const [lastResult, action, isPending] = useActionState(
		createCattleAction,
		null,
	);

	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(createCattleSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: createCattleSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	// トースト通知の処理
	useEffect(() => {
		if (lastResult) {
			if (lastResult.status === "success") {
				// 成功時は牛一覧ページにリダイレクト
				toast.success("牛の登録が完了しました", {
					description: "新しい牛が正常に登録されました",
					duration: 10000,
					style: {
						background: "#f0fdf4",
						border: "1px solid #bbf7d0",
						color: "#166534",
					},
				});
				router.push("/cattle");
			} else if (lastResult.status === "error") {
				// エラーメッセージ
				toast.error("登録に失敗しました", {
					description: "入力内容を確認してください",
					duration: 10000,
					style: {
						background: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#dc2626",
					},
				});
			}
		}
	}, [lastResult, router]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">新規牛登録</h1>
				<p className="text-sm text-gray-500 mt-1">
					* がついている項目は必須入力です
				</p>
			</div>

			{form.errors && form.errors.length > 0 && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
					{form.errors.map((error) => (
						<p key={error} className="text-sm text-red-600">
							{error}
						</p>
					))}
				</div>
			)}

			<form
				id={form.id}
				onSubmit={form.onSubmit}
				action={action}
				noValidate
				className="space-y-6"
			>
				<div>
					<label
						htmlFor="identificationNumber"
						className="block text-sm font-medium mb-2"
					>
						個体識別番号<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="text"
						key={fields.identificationNumber.key}
						name={fields.identificationNumber.name}
						defaultValue={fields.identificationNumber.initialValue}
						placeholder="個体識別番号を入力"
						className={`w-full rounded-md border px-3 py-2 ${
							fields.identificationNumber.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.identificationNumber.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.identificationNumber.errors}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="earTagNumber"
						className="block text-sm font-medium mb-2"
					>
						耳標番号<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="text"
						key={fields.earTagNumber.key}
						name={fields.earTagNumber.name}
						defaultValue={fields.earTagNumber.initialValue}
						placeholder="耳標番号を入力"
						className={`w-full rounded-md border px-3 py-2 ${
							fields.earTagNumber.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.earTagNumber.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.earTagNumber.errors}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="name" className="block text-sm font-medium mb-2">
						名号<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="text"
						key={fields.name.key}
						name={fields.name.name}
						defaultValue={fields.name.initialValue}
						placeholder="名号を入力"
						className={`w-full rounded-md border px-3 py-2 ${
							fields.name.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.name.errors && (
						<p className="text-sm text-red-600 mt-1">{fields.name.errors}</p>
					)}
				</div>

				<div>
					<label htmlFor="gender" className="block text-sm font-medium mb-2">
						性別<span className="text-red-500 ml-1">*</span>
					</label>
					<select
						key={fields.gender.key}
						name={fields.gender.name}
						defaultValue={fields.gender.initialValue}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.gender.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					>
						<option value="">選択してください</option>
						<option value="オス">オス</option>
						<option value="メス">メス</option>
					</select>
					{fields.gender.errors && (
						<p className="text-sm text-red-600 mt-1">{fields.gender.errors}</p>
					)}
				</div>

				<div>
					<label htmlFor="birthDate" className="block text-sm font-medium mb-2">
						出生日<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="date"
						key={fields.birthDate.key}
						name={fields.birthDate.name}
						defaultValue={fields.birthDate.initialValue}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.birthDate.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.birthDate.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.birthDate.errors}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="growthStage"
						className="block text-sm font-medium mb-2"
					>
						成長段階<span className="text-red-500 ml-1">*</span>
					</label>
					<select
						key={fields.growthStage.key}
						name={fields.growthStage.name}
						defaultValue={fields.growthStage.initialValue}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.growthStage.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					>
						<option value="">選択してください</option>
						<option value="CALF">仔牛</option>
						<option value="GROWING">育成牛</option>
						<option value="FATTENING">肥育牛</option>
						<option value="FIRST_CALVED">初産牛</option>
						<option value="MULTI_PAROUS">経産牛</option>
					</select>
					{fields.growthStage.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.growthStage.errors}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="breed" className="block text-sm font-medium mb-2">
						品種
					</label>
					<input
						type="text"
						key={fields.breed.key}
						name={fields.breed.name}
						defaultValue={fields.breed.initialValue}
						placeholder="品種を入力"
						className="w-full rounded-md border border-input bg-background px-3 py-2"
					/>
				</div>

				<div>
					<label htmlFor="notes" className="block text-sm font-medium mb-2">
						備考
					</label>
					<textarea
						key={fields.notes.key}
						name={fields.notes.name}
						defaultValue={fields.notes.initialValue}
						placeholder="備考を入力"
						className="w-full rounded-md border border-input bg-background px-3 py-2 resize-none"
						rows={4}
					/>
				</div>

				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" asChild>
						<Link href="/cattle">キャンセル</Link>
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "登録中..." : "登録"}
					</Button>
				</div>
			</form>
		</div>
	);
}
