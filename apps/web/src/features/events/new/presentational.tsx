"use client";

import { Button } from "@/components/ui/button";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createEventAction } from "./actions";
import { createEventSchema, eventTypes } from "./schema";

interface EventNewPresentationProps {
	cattle: GetCattleDetailResType;
}

export function EventNewPresentation({ cattle }: EventNewPresentationProps) {
	const router = useRouter();

	const [lastResult, action, isPending] = useActionState(
		createEventAction,
		null,
	);

	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(createEventSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: createEventSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			cattleId: cattle.cattleId.toString(),
			eventDate: new Date().toISOString().split("T")[0], // 今日の日付
			eventTime: new Date().toTimeString().slice(0, 5), // 現在時刻
		},
	});

	// トースト通知とリダイレクトの処理
	useEffect(() => {
		if (
			lastResult &&
			"status" in lastResult &&
			lastResult.status === "success" &&
			"message" in lastResult
		) {
			toast.success(lastResult.message);
			// 牛の詳細画面にリダイレクト
			router.push(`/cattle/${cattle.cattleId}`);
		} else if (
			lastResult &&
			"status" in lastResult &&
			lastResult.status === "error" &&
			"message" in lastResult
		) {
			toast.error(lastResult.message);
		}
	}, [lastResult, router, cattle.cattleId]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">イベント登録</h1>
				<p className="text-sm text-gray-500 mt-1">
					{cattle.name} ({cattle.earTagNumber}) のイベントを登録します
				</p>
				<p className="text-sm text-gray-500">
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
				{/* 隠しフィールド: 牛ID */}
				<input
					type="hidden"
					name={fields.cattleId.name}
					value={fields.cattleId.initialValue}
				/>

				{/* イベントタイプ */}
				<div>
					<label
						htmlFor={fields.eventType.id}
						className="block text-sm font-medium mb-2"
					>
						イベントタイプ<span className="text-red-500 ml-1">*</span>
					</label>
					<select
						id={fields.eventType.id}
						key={fields.eventType.key}
						name={fields.eventType.name}
						defaultValue={fields.eventType.initialValue}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.eventType.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					>
						<option value="">イベントタイプを選択してください</option>
						{eventTypes.map((type) => (
							<option key={type.value} value={type.value}>
								{type.label}
							</option>
						))}
					</select>
					{fields.eventType.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.eventType.errors}
						</p>
					)}
				</div>

				{/* イベント日付 */}
				<div>
					<label
						htmlFor={fields.eventDate.id}
						className="block text-sm font-medium mb-2"
					>
						イベント日付<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						id={fields.eventDate.id}
						type="date"
						key={fields.eventDate.key}
						name={fields.eventDate.name}
						defaultValue={fields.eventDate.initialValue}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.eventDate.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.eventDate.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.eventDate.errors}
						</p>
					)}
				</div>

				{/* イベント時刻 */}
				<div>
					<label
						htmlFor={fields.eventTime.id}
						className="block text-sm font-medium mb-2"
					>
						イベント時刻<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						id={fields.eventTime.id}
						type="time"
						key={fields.eventTime.key}
						name={fields.eventTime.name}
						defaultValue={fields.eventTime.initialValue}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.eventTime.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.eventTime.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.eventTime.errors}
						</p>
					)}
				</div>

				{/* メモ */}
				<div>
					<label
						htmlFor={fields.notes.id}
						className="block text-sm font-medium mb-2"
					>
						メモ
					</label>
					<textarea
						id={fields.notes.id}
						key={fields.notes.key}
						name={fields.notes.name}
						defaultValue={fields.notes.initialValue}
						placeholder="イベントに関するメモを入力してください"
						rows={4}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.notes.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.notes.errors && (
						<p className="text-sm text-red-600 mt-1">{fields.notes.errors}</p>
					)}
				</div>

				{/* ボタン */}
				<div className="flex gap-4">
					<Button type="submit" disabled={isPending} className="flex-1">
						{isPending ? "登録中..." : "イベントを登録"}
					</Button>
					<Button type="button" variant="outline" asChild className="flex-1">
						<Link href={`/cattle/${cattle.cattleId}`}>キャンセル</Link>
					</Button>
				</div>
			</form>
		</div>
	);
}
