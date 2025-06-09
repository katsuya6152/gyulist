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

type CattleDetailHeaderProps = {
	cattle: GetCattleDetailResType;
	// onDelete: () => void;
};

export function CattleDetailHeader({
	cattle,
	// onDelete,
}: CattleDetailHeaderProps) {
	const router = useRouter();
	const handleEdit = () => {
		router.push(`/cattle/${cattle.cattleId}/edit`);
	};
	const handleDelete = () => {
		router.push(`/cattle/${cattle.cattleId}/edit`);
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
							<Button
								variant="destructive"
								aria-label="削除"
								onClick={handleDelete}
							>
								削除
							</Button>
							<DrawerClose asChild>
								<Button variant="outline">キャンセル</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			</div>
		</div>
	);
}
