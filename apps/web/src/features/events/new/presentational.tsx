"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@/components/ui/popover";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	EVENT_GROUP_LABELS,
	EVENT_GROUP_ORDER,
	EVENT_TYPE_GROUPS,
	EVENT_TYPE_LABELS
} from "@repo/api";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createEventAction } from "./actions";
import { createEventSchema } from "./schema";

interface EventNewPresentationProps {
	cattle: GetCattleDetailResType;
}

export function EventNewPresentation({ cattle }: EventNewPresentationProps) {
	const router = useRouter();

	const [lastResult, action, isPending] = useActionState(
		createEventAction,
		null
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
			eventTime: new Date().toTimeString().slice(0, 5) // 現在時刻
		}
	});

	// トースト通知とリダイレクトの処理
	useEffect(() => {
		if (
			lastResult &&
			"status" in lastResult &&
			lastResult.status === "success" &&
			"message" in lastResult
		) {
			if (lastResult.message === "demo") {
				toast.info("イベントを登録しました", {
					description: "デモアカウントのため、実際に保存はされていません"
				});
			} else {
				toast.success(lastResult.message);
			}
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

	const [selectedType, setSelectedType] = useState<string>(
		fields.eventType.initialValue || ""
	);

	const GROUPS: { key: string; label: string; items: string[] }[] =
		EVENT_GROUP_ORDER.map((groupKey) => ({
			key: groupKey,
			label: EVENT_GROUP_LABELS[groupKey],
			items: [...EVENT_TYPE_GROUPS[groupKey]]
		}));

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

				{/* イベントタイプ（グルーピング＋折りたたみ） */}
				<div>
					<label
						id={`${fields.eventType.id}-label`}
						htmlFor={fields.eventType.id}
						className="block text-sm font-medium mb-2"
					>
						イベントタイプ<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						id={fields.eventType.id}
						type="hidden"
						name={fields.eventType.name}
						value={selectedType}
					/>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className="w-full justify-between"
								aria-labelledby={`${fields.eventType.id}-label`}
							>
								<span className="truncate">
									{selectedType
										? EVENT_TYPE_LABELS[
												selectedType as keyof typeof EVENT_TYPE_LABELS
											]
										: "イベントタイプを選択してください"}
								</span>
								<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[min(640px,90vw)] p-0" align="start">
							<div className="p-2">
								<Accordion type="single" collapsible>
									{GROUPS.map((group) => (
										<AccordionItem
											key={group.key}
											value={group.key}
											className="px-3"
										>
											<AccordionTrigger className="py-2">
												<span className="text-sm font-semibold">
													{group.label}
												</span>
											</AccordionTrigger>
											<AccordionContent>
												<div className="grid grid-cols-2 gap-2 py-2">
													{group.items.map((value) => (
														<button
															key={value}
															type="button"
															onClick={() => {
																setSelectedType(value);
															}}
															aria-pressed={selectedType === value}
															className={`relative text-left text-sm px-3 py-2 rounded border transition-colors hover:bg-accent ${
																selectedType === value
																	? "border-primary bg-primary/10"
																	: "border-input"
															}`}
														>
															{
																EVENT_TYPE_LABELS[
																	value as keyof typeof EVENT_TYPE_LABELS
																]
															}
															{selectedType === value && (
																<Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
															)}
														</button>
													))}
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</div>
						</PopoverContent>
					</Popover>

					{fields.eventType.errors && (
						<p className="text-sm text-red-600 mt-2">
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
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						className="flex-1"
					>
						キャンセル
					</Button>
				</div>
			</form>
		</div>
	);
}
