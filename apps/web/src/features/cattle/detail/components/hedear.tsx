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
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getGrowthStage } from "@/lib/utils";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { updateCattleStatus } from "@/services/cattleService";
import classNames from "classnames";
import { CalendarPlus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCattleAction } from "../actions";

type CattleDetailHeaderProps = {
	cattle: GetCattleDetailResType;
};

const statusOptions = [
	{ value: "ACTIVE", label: "飼養中" },
	{ value: "SOLD", label: "出荷済み" },
	{ value: "DECEASED", label: "死亡" },
] as const;

export function CattleDetailHeader({ cattle }: CattleDetailHeaderProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [currentStatus, setCurrentStatus] = useState(cattle.status);
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState(cattle.status);
	const [reason, setReason] = useState("");
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [statusError, setStatusError] = useState<string | null>(null);

	const handleAddEvent = () => {
		router.push(`/events/new/${cattle.cattleId}`);
	};

	const handleEdit = () => {
		router.push(`/cattle/${cattle.cattleId}/edit`);
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		setDeleteError(null);

		try {
			const result = await deleteCattleAction(cattle.cattleId);

			if (result.success) {
				if ("message" in result && result.message === "demo") {
					toast.info("牛の削除が完了しました", {
						description: "デモアカウントのため、実際に削除はされていません",
					});
				} else {
					// 削除成功時のトースト表示
					toast.success("牛の削除が完了しました", {
						description: `${cattle.name}（個体識別番号: ${cattle.identificationNumber}）を削除しました`,
						// duration: 10000,
						style: {
							background: "#f0fdf4",
							border: "1px solid #bbf7d0",
							color: "#166534",
						},
					});
				}
				// 牛一覧ページにリダイレクト
				router.push("/cattle");
			} else {
				setDeleteError(result.error || "削除に失敗しました");
				toast.error("削除に失敗しました", {
					description: result.error || "エラーが発生しました",
					style: {
						background: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#dc2626",
					},
				});
			}
		} catch (error) {
			setDeleteError("削除中にエラーが発生しました");
			toast.error("削除中にエラーが発生しました", {
				description: "予期しないエラーが発生しました",
				style: {
					background: "#fef2f2",
					border: "1px solid #fecaca",
					color: "#dc2626",
				},
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const handleStatusUpdate = async () => {
		setIsUpdatingStatus(true);
		setStatusError(null);
		try {
			await updateCattleStatus(cattle.cattleId, newStatus, reason || undefined);
			setCurrentStatus(newStatus);
			toast.success("ステータスを更新しました");
			setStatusDialogOpen(false);
		} catch (error) {
			setStatusError("ステータスの更新に失敗しました");
			toast.error("ステータスの更新に失敗しました");
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	return (
		<div className="flex justify-between">
			{/* 左側: 個体情報 */}
			<div className="flex flex-col gap-1">
				<p className="font-black mr-2">{cattle.name}</p>
				<div className="flex items-center gap-1">
					<Badge variant="outline">
						<span
							className={classNames("font-semibold", {
								"text-blue-500": cattle.gender === "オス",
								"text-red-500": cattle.gender === "メス",
							})}
						>
							{cattle.gender}
						</span>
					</Badge>
					<Badge>{getGrowthStage(cattle.growthStage)}</Badge>
					<Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
						<DialogTrigger asChild>
							<Badge variant="outline" className="cursor-pointer">
								{statusOptions.find((opt) => opt.value === currentStatus)
									?.label || currentStatus}
							</Badge>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>ステータスを変更</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<Select value={newStatus} onValueChange={setNewStatus}>
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
									placeholder="理由 (任意)"
									value={reason}
									onChange={(e) => setReason(e.target.value)}
								/>
								{statusError && (
									<p className="text-sm text-red-600">{statusError}</p>
								)}
							</div>
							<DialogFooter>
								<Button
									onClick={handleStatusUpdate}
									disabled={isUpdatingStatus}
								>
									{isUpdatingStatus ? "更新中..." : "変更"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<Badge variant="outline">{cattle.healthStatus}</Badge>
				</div>
				<p className="text-xs">耳標番号：{cattle.earTagNumber}</p>
			</div>

			{/* 右側: イベント登録・編集・削除ボタン */}
			<div className="flex items-center space-x-2">
				{/* イベント登録ボタン */}
				<Button
					variant="outline"
					size="icon"
					aria-label="イベント登録"
					className="text-primary"
					onClick={handleAddEvent}
				>
					<CalendarPlus className="h-4 w-4" />
				</Button>

				{/* 編集ボタン */}
				<Button
					variant="outline"
					size="icon"
					aria-label="編集"
					onClick={handleEdit}
				>
					<Edit className="h-4 w-4" />
				</Button>

				{/* 削除ボタン（ドロワー） */}
				<Drawer>
					<DrawerTrigger asChild>
						<Button variant="outline" size="icon" aria-label="削除">
							<Trash2 className="h-4 w-4" />
						</Button>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle className="text-left">
								以下の個体情報を削除してもよろしいですか？
							</DrawerTitle>
							<DrawerDescription>
								個体識別番号: {cattle.identificationNumber}
								<br />
								名号: {cattle.name}
							</DrawerDescription>
						</DrawerHeader>
						<DrawerFooter>
							{deleteError && (
								<p className="text-sm text-red-600 mb-2">{deleteError}</p>
							)}
							<Button
								variant="destructive"
								aria-label={isDeleting ? "削除中..." : "削除"}
								onClick={handleDelete}
								disabled={isDeleting}
							>
								{isDeleting ? "削除中..." : "削除"}
							</Button>
							<DrawerClose asChild>
								<Button variant="outline" disabled={isDeleting}>
									キャンセル
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			</div>
		</div>
	);
}
