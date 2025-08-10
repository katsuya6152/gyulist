"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import classNames from "classnames";
import { useState } from "react";
import { toast } from "sonner";
import {
	type CattleStatus,
	statusLabelMap,
	statusOptions,
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

	const handleSubmit = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			const result = await updateCattleStatusAction(
				cattleId,
				newStatus,
				reason || undefined,
			);
			if ("message" in result && result.message === "demo") {
				toast.info("ステータスを更新しました", {
					description: "デモアカウントのため、実際には更新されていません",
				});
			} else if (result.success) {
				toast.success("ステータスを更新しました");
				setCurrentStatus(newStatus);
				setOpen(false);
				setReason("");
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

	return (
		<div className="flex items-center gap-2">
			<Badge
				variant="outline"
				className={classNames({
					"text-blue-500 border-blue-500": currentStatus === "HEALTHY",
					"text-yellow-500 border-yellow-500": currentStatus === "PREGNANT",
					"text-green-500 border-green-500": currentStatus === "RESTING",
					"text-red-500 border-red-500": currentStatus === "TREATING",
					"text-purple-500 border-purple-500": currentStatus === "SHIPPED",
					"text-gray-500 border-gray-500": currentStatus === "DEAD",
				})}
			>
				{statusLabelMap[currentStatus]}
			</Badge>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						ステータス変更
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ステータス変更</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<Select
							value={newStatus}
							onValueChange={(v) => setNewStatus(v as CattleStatus)}
						>
							<SelectTrigger>
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
						<Input
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="理由 (任意)"
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							キャンセル
						</Button>
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={isSubmitting}
						>
							更新
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
