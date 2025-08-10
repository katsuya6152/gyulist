"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import classNames from "classnames";
import { useState } from "react";
import { toast } from "sonner";
import { updateCattleStatusAction } from "../actions";

const statusOptions = [
	{ value: "HEALTHY", label: "健康" },
	{ value: "PREGNANT", label: "妊娠中" },
	{ value: "RESTING", label: "休息中" },
	{ value: "TREATING", label: "治療中" },
];

interface StatusBadgeProps {
	cattleId: number;
	status: string;
}

export function StatusBadge({ cattleId, status }: StatusBadgeProps) {
	const [open, setOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<string>(
		statusOptions.find((opt) => opt.label === status)?.value ?? "HEALTHY",
	);
	const [reason, setReason] = useState("");
	const [loading, setLoading] = useState(false);

	const colorClass = classNames("transition-all duration-200", {
		"border-blue-500 text-blue-500": status === "健康",
		"border-yellow-500 text-yellow-500": status === "妊娠中",
		"border-green-500 text-green-500": status === "休息中",
		"border-red-500 text-red-500": status === "治療中",
	});

	const handleSave = async () => {
		setLoading(true);
		try {
			const result = await updateCattleStatusAction(
				cattleId,
				selectedStatus as StatusBadgeProps["status"],
				reason || undefined,
			);
			if (result.success) {
				toast.success("ステータスを更新しました");
			} else {
				toast.error(result.error || "ステータスの更新に失敗しました");
			}
			setOpen(false);
		} catch (e) {
			toast.error("ステータスの更新に失敗しました");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Badge variant="outline" className={colorClass} asChild>
				<button type="button" onClick={() => setOpen(true)}>
					{status}
				</button>
			</Badge>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ステータスを変更</DialogTitle>
						<DialogDescription>
							新しいステータスと理由を入力してください
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
						<Textarea
							placeholder="理由（任意）"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={loading}
						>
							キャンセル
						</Button>
						<Button onClick={handleSave} disabled={loading}>
							保存
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
