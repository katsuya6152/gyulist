"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getGrowthStage } from "@/lib/utils";
import type { GetCattleDetailResType } from "@/services/cattleService";
import classNames from "classnames";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCattleAction } from "../actions";

type CattleDetailHeaderProps = {
	cattle: GetCattleDetailResType;
};

export function CattleDetailHeader({ cattle }: CattleDetailHeaderProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const handleEdit = () => {
		router.push(`/cattle/${cattle.cattleId}/edit`);
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		setDeleteError(null);

		try {
			const result = await deleteCattleAction(cattle.cattleId.toString());

			if (result.success) {
				// 削除成功時のトースト表示
				toast.success("牛の削除が完了しました", {
					description: `${cattle.name}（個体識別番号: ${cattle.identificationNumber}）を削除しました`,
					duration: 10000,
					style: {
						background: "#f0fdf4",
						border: "1px solid #bbf7d0",
						color: "#166534",
					},
				});

				// 牛一覧ページにリダイレクト
				router.push("/cattle");
			} else {
				setDeleteError(result.error || "削除に失敗しました");
				toast.error("削除に失敗しました", {
					description: result.error || "エラーが発生しました",
					duration: 10000,
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
				duration: 10000,
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

	return (
		<div className="flex justify-between">
			{/* 左側: 個体情報 */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-1">
					<p className="font-black mr-2">{cattle.name}</p>
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
					<Badge variant="outline">{cattle.healthStatus}</Badge>
				</div>
				<p className="text-xs">耳標番号：{cattle.earTagNumber}</p>
			</div>

			{/* 右側: 編集・削除ボタン */}
			<div className="flex items-center space-x-2">
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
								aria-label="削除"
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
