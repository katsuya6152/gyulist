"use client";

import { Button } from "@/components/ui/button";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updateCattleAction } from "./actions";
import { updateCattleSchema } from "./schema";

// 年齢表示用のユーティリティ関数（表示のみ）
const calculateAgeDisplay = (birthday: string) => {
	if (!birthday) return null;

	const today = new Date();
	const birthDate = new Date(birthday);
	const diffTime = today.getTime() - birthDate.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	const monthsOld = Math.floor(diffDays / 30);
	const age = Math.floor(diffDays / 365);

	return {
		daysOld: diffDays,
		monthsOld,
		age,
	};
};

interface CattleEditPresentationProps {
	cattle: GetCattleDetailResType;
}

export function CattleEditPresentation({
	cattle,
}: CattleEditPresentationProps) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [ageDisplay, setAgeDisplay] = useState<{
		daysOld: number;
		monthsOld: number;
		age: number;
	} | null>(null);
	const [growthStage, setGrowthStage] = useState<string>(
		cattle.growthStage || "",
	);

	const [lastResult, action, isPending] = useActionState(
		(prevState: unknown, formData: FormData) => {
			// 牛のIDをフォームデータに追加
			formData.append("cattleId", cattle.cattleId.toString());
			return updateCattleAction(prevState, formData);
		},
		null,
	);

	const [form, fields] = useForm({
		lastResult,
		constraint: getZodConstraint(updateCattleSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: updateCattleSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			identificationNumber: cattle.identificationNumber.toString(),
			earTagNumber: cattle.earTagNumber?.toString() || "",
			name: cattle.name || "",
			gender: cattle.gender || "",
			birthday: cattle.birthday || "",
			growthStage: cattle.growthStage || "",
			breed: cattle.breed || "",
			notes: cattle.notes || "",
			// 血統情報の初期値
			bloodline: {
				fatherCattleName: cattle.bloodline?.fatherCattleName || "",
				motherFatherCattleName: cattle.bloodline?.motherFatherCattleName || "",
				motherGrandFatherCattleName:
					cattle.bloodline?.motherGrandFatherCattleName || "",
				motherGreatGrandFatherCattleName:
					cattle.bloodline?.motherGreatGrandFatherCattleName || "",
			},
			// 繁殖状態の初期値
			breedingStatus: {
				expectedCalvingDate: cattle.breedingStatus?.expectedCalvingDate || "",
				scheduledPregnancyCheckDate:
					cattle.breedingStatus?.scheduledPregnancyCheckDate || "",
				breedingMemo: cattle.breedingStatus?.breedingMemo || "",
				isDifficultBirth:
					cattle.breedingStatus?.isDifficultBirth?.toString() || "",
			},
		},
	});

	// 生年月日と成長段階の変更を監視
	useEffect(() => {
		const handleFormChange = () => {
			if (formRef.current) {
				const formData = new FormData(formRef.current);
				const birthday = formData.get("birthday") as string;
				const currentGrowthStage = formData.get("growthStage") as string;

				if (birthday) {
					const ageInfo = calculateAgeDisplay(birthday);
					setAgeDisplay(ageInfo);
				} else {
					setAgeDisplay(null);
				}

				setGrowthStage(currentGrowthStage);
			}
		};

		const formElement = formRef.current;
		if (formElement) {
			formElement.addEventListener("change", handleFormChange);
			formElement.addEventListener("input", handleFormChange);

			// 初期表示
			if (cattle.birthday) {
				const ageInfo = calculateAgeDisplay(cattle.birthday);
				setAgeDisplay(ageInfo);
			}

			return () => {
				formElement.removeEventListener("change", handleFormChange);
				formElement.removeEventListener("input", handleFormChange);
			};
		}
	}, [cattle.birthday]);

	// トースト通知の処理
	useEffect(() => {
		if (lastResult) {
			if (lastResult.status === "success") {
				toast.success("牛の更新が完了しました", {
					description: "牛の情報が正常に更新されました",
					duration: 10000,
					style: {
						background: "#f0fdf4",
						border: "1px solid #bbf7d0",
						color: "#166534",
					},
				});
				router.push(`/cattle/${cattle.cattleId}`);
			} else if (lastResult.status === "error") {
				toast.error("更新に失敗しました", {
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
	}, [lastResult, router, cattle.cattleId]);

	// 子牛以外の場合のみ繁殖情報を表示
	const shouldShowBreedingInfo =
		growthStage &&
		(growthStage === "FIRST_CALVED" || growthStage === "MULTI_PAROUS");

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">牛の編集</h1>
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
				ref={formRef}
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
					<label htmlFor="birthday" className="block text-sm font-medium mb-2">
						出生日<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="date"
						key={fields.birthday.key}
						name={fields.birthday.name}
						defaultValue={fields.birthday.initialValue}
						className={`w-full rounded-md border px-3 py-2 ${
							fields.birthday.errors
								? "border-red-500 bg-red-50"
								: "border-input bg-background"
						}`}
					/>
					{fields.birthday.errors && (
						<p className="text-sm text-red-600 mt-1">
							{fields.birthday.errors}
						</p>
					)}
					{ageDisplay && (
						<p className="text-sm text-gray-600 mt-1">
							現在の日齢: {ageDisplay.daysOld}日
							{` (${ageDisplay.monthsOld}ヶ月)`}
							{` (${ageDisplay.age}歳)`}
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

				{/* 血統情報セクション */}
				<div className="border-t pt-6">
					<h2 className="text-lg font-semibold mb-4">血統情報</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="bloodline.fatherCattleName"
								className="block text-sm font-medium mb-2"
							>
								父牛名
							</label>
							<input
								type="text"
								name="bloodline.fatherCattleName"
								defaultValue={cattle.bloodline?.fatherCattleName || ""}
								placeholder="父牛名を入力"
								className="w-full rounded-md border border-input bg-background px-3 py-2"
							/>
						</div>

						<div>
							<label
								htmlFor="bloodline.motherFatherCattleName"
								className="block text-sm font-medium mb-2"
							>
								母の父牛名
							</label>
							<input
								type="text"
								name="bloodline.motherFatherCattleName"
								defaultValue={cattle.bloodline?.motherFatherCattleName || ""}
								placeholder="母の父牛名を入力"
								className="w-full rounded-md border border-input bg-background px-3 py-2"
							/>
						</div>

						<div>
							<label
								htmlFor="bloodline.motherGrandFatherCattleName"
								className="block text-sm font-medium mb-2"
							>
								母の祖父牛名
							</label>
							<input
								type="text"
								name="bloodline.motherGrandFatherCattleName"
								defaultValue={
									cattle.bloodline?.motherGrandFatherCattleName || ""
								}
								placeholder="母の祖父牛名を入力"
								className="w-full rounded-md border border-input bg-background px-3 py-2"
							/>
						</div>

						<div>
							<label
								htmlFor="bloodline.motherGreatGrandFatherCattleName"
								className="block text-sm font-medium mb-2"
							>
								母の曾祖父牛名
							</label>
							<input
								type="text"
								name="bloodline.motherGreatGrandFatherCattleName"
								defaultValue={
									cattle.bloodline?.motherGreatGrandFatherCattleName || ""
								}
								placeholder="母の曾祖父牛名を入力"
								className="w-full rounded-md border border-input bg-background px-3 py-2"
							/>
						</div>
					</div>
				</div>

				{/* 繁殖情報セクション - 子牛以外の場合のみ表示 */}
				{shouldShowBreedingInfo && (
					<div className="border-t pt-6">
						<h2 className="text-lg font-semibold mb-4">繁殖情報</h2>

						{/* 繁殖状態 */}
						<div className="mb-6">
							<h3 className="text-md font-medium mb-3">繁殖状態</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="breedingStatus.expectedCalvingDate"
										className="block text-sm font-medium mb-2"
									>
										分娩予定日
									</label>
									<input
										type="date"
										name="breedingStatus.expectedCalvingDate"
										defaultValue={
											cattle.breedingStatus?.expectedCalvingDate || ""
										}
										className="w-full rounded-md border border-input bg-background px-3 py-2"
									/>
								</div>

								<div>
									<label
										htmlFor="breedingStatus.scheduledPregnancyCheckDate"
										className="block text-sm font-medium mb-2"
									>
										妊娠鑑定予定日
									</label>
									<input
										type="date"
										name="breedingStatus.scheduledPregnancyCheckDate"
										defaultValue={
											cattle.breedingStatus?.scheduledPregnancyCheckDate || ""
										}
										className="w-full rounded-md border border-input bg-background px-3 py-2"
									/>
								</div>

								<div>
									<label
										htmlFor="breedingStatus.isDifficultBirth"
										className="block text-sm font-medium mb-2"
									>
										前回出産の難産判定
									</label>
									<select
										name="breedingStatus.isDifficultBirth"
										defaultValue={
											cattle.breedingStatus?.isDifficultBirth?.toString() || ""
										}
										className="w-full rounded-md border border-input bg-background px-3 py-2"
									>
										<option value="">選択してください</option>
										<option value="false">安産</option>
										<option value="true">難産</option>
									</select>
								</div>
							</div>

							<div className="mt-4">
								<label
									htmlFor="breedingStatus.breedingMemo"
									className="block text-sm font-medium mb-2"
								>
									繁殖メモ
								</label>
								<textarea
									name="breedingStatus.breedingMemo"
									defaultValue={cattle.breedingStatus?.breedingMemo || ""}
									placeholder="繁殖に関するメモを入力"
									className="w-full rounded-md border border-input bg-background px-3 py-2 resize-none"
									rows={3}
								/>
							</div>
						</div>
					</div>
				)}

				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" asChild>
						<Link href={`/cattle/${cattle.cattleId}`}>キャンセル</Link>
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "更新中..." : "更新"}
					</Button>
				</div>
			</form>
		</div>
	);
}
