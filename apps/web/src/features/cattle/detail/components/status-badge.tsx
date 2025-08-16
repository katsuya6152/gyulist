"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import classNames from "classnames";
import { useState } from "react";
import { toast } from "sonner";
import {
	type CattleStatus,
	statusLabelMap,
	statusOptions
} from "../../constants";
import { updateCattleStatusAction } from "../actions";

interface StatusBadgeProps {
	cattleId: number;
	status: CattleStatus;
}

export function StatusBadge({ cattleId, status }: StatusBadgeProps) {
	const [currentStatus, setCurrentStatus] = useState<CattleStatus>(status);
	const [open, setOpen] = useState(false);
	const [newStatus, setNewStatus] = useState<CattleStatus>(status);
	const [reason, setReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showWarning, setShowWarning] = useState(false);

	// 最終ステータスかどうかをチェック
	const isFinalStatus = currentStatus === "SHIPPED" || currentStatus === "DEAD";

	const handleSubmit = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			const result = await updateCattleStatusAction(
				cattleId,
				newStatus,
				reason || undefined
			);
			if ("message" in result && result.message === "demo") {
				toast.info("ステータスを更新しました", {
					description: "デモアカウントのため、実際には更新されていません"
				});
			} else if (result.success) {
				toast.success("ステータスを更新しました");
				setCurrentStatus(newStatus);
				setOpen(false);
				setReason("");
				setShowWarning(false);
			} else {
				toast.error(result.error || "ステータスの更新に失敗しました");
			}
		} catch (e) {
			console.error(e);
			toast.error("ステータスの更新に失敗しました");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStatusChange = (value: CattleStatus) => {
		setNewStatus(value);
		// 最終ステータスから変更する場合は警告を表示
		if (isFinalStatus && value !== currentStatus) {
			setShowWarning(true);
		} else {
			setShowWarning(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Badge
					variant="outline"
					className={classNames(
						"cursor-pointer transition-all duration-200 ease-in-out",
						"hover:scale-105 hover:shadow-md",
						"focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
						"active:scale-95",
						"select-none",
						// タッチデバイス向けの改善
						"touch-manipulation", // タッチ操作の最適化
						"h-9 w-auto", // ボタンの高さに合わせる（h-9 = 36px）
						"flex items-center justify-center", // 中央揃え
						"px-3", // パディングを調整（pyは削除）
						// タッチ状態のスタイル
						"active:scale-95 active:shadow-inner",
						"active:opacity-80",
						// タッチデバイスでのホバー効果を無効化（タッチデバイスでは不要）
						"hover:scale-105 hover:shadow-md",
						// タッチデバイスでのフォーカスリングを調整
						"focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
						{
							"text-blue-500 border-blue-500 hover:bg-blue-50 hover:border-blue-600 active:bg-blue-100":
								currentStatus === "HEALTHY",
							"text-yellow-500 border-yellow-500 hover:bg-yellow-50 hover:border-yellow-600 active:bg-yellow-100":
								currentStatus === "PREGNANT",
							"text-green-500 border-green-500 hover:bg-green-50 hover:border-green-600 active:bg-green-100":
								currentStatus === "RESTING",
							"text-red-500 border-red-500 hover:bg-red-50 hover:border-red-600 active:bg-red-100":
								currentStatus === "TREATING",
							"text-gray-500 border-gray-500 hover:bg-gray-50 hover:border-gray-600 active:bg-gray-100":
								currentStatus === "SHIPPED",
							"text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 active:bg-red-100":
								currentStatus === "DEAD"
						}
					)}
					aria-label={`ステータスを変更: ${statusLabelMap[currentStatus]}`}
				>
					{statusLabelMap[currentStatus]}
				</Badge>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ステータス変更</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					{/* 現在のステータス表示 */}
					<div className="text-sm text-gray-600">
						現在のステータス:{" "}
						<span className="font-medium">{statusLabelMap[currentStatus]}</span>
					</div>

					{/* 警告メッセージ */}
					{showWarning && (
						<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-amber-400"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<title>警告アイコン</title>
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div>
									<h3 className="text-sm font-medium text-amber-800">
										注意: 最終ステータスからの変更
									</h3>
									<p className="mt-1 text-sm text-amber-700">
										{currentStatus === "SHIPPED"
											? "出荷済みの牛のステータスを変更しようとしています。この操作は適切ですか？"
											: "死亡の牛のステータスを変更しようとしています。この操作は適切ですか？"}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* 新しいステータス選択 */}
					<div>
						<label
							htmlFor="status-select"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							新しいステータス
						</label>
						<Select value={newStatus} onValueChange={handleStatusChange}>
							<SelectTrigger id="status-select">
								<SelectValue placeholder="ステータスを選択" />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* 理由入力 */}
					<div>
						<label
							htmlFor="reason-input"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							変更理由 <span className="text-gray-500">(任意)</span>
						</label>
						<Input
							id="reason-input"
							placeholder="ステータス変更の理由を入力してください"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setOpen(false);
							setReason("");
							setShowWarning(false);
						}}
						disabled={isSubmitting}
					>
						キャンセル
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting}
						className={showWarning ? "bg-amber-600 hover:bg-amber-700" : ""}
					>
						{isSubmitting ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
								更新中...
							</>
						) : showWarning ? (
							"注意して更新"
						) : (
							"更新"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
