"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGrowthStage } from "@/lib/utils";
import type { ShipmentPlan } from "@/services/shipmentService";
import type { GrowthStage } from "@repo/api";
import { clsx } from "clsx";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { memo } from "react";

interface ShipmentPlanItemProps {
	plan: ShipmentPlan;
	index: number;
	onCattleClick: (cattleId: number) => void;
	onEdit: (plan: ShipmentPlan) => void;
	onDelete: (planId: string) => void;
	onConvertToRecord: (plan: ShipmentPlan) => void;
}

export const ShipmentPlanItem = memo(
	({
		plan,
		index,
		onCattleClick,
		onEdit,
		onDelete,
		onConvertToRecord
	}: ShipmentPlanItemProps) => {
		const handleCattleClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onCattleClick(plan.cattleId);
		};

		const handleEdit = (e: React.MouseEvent) => {
			e.stopPropagation();
			onEdit(plan);
		};

		const handleDelete = (e: React.MouseEvent) => {
			e.stopPropagation();
			onDelete(plan.planId);
		};

		const handleConvertToRecord = (e: React.MouseEvent) => {
			e.stopPropagation();
			onConvertToRecord(plan);
		};

		return (
			<div
				className="animate-fade-in-up"
				style={{ animationDelay: `${index * 0.02}s` }}
			>
				<div className="bg-card border-b border-border p-4 hover:bg-muted/30 transition-colors duration-200">
					{/* ヘッダー部分: 牛名と出荷予定月 */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2 min-w-0 flex-1">
							<Button
								variant="ghost"
								className="p-0 h-auto text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
								onClick={handleCattleClick}
							>
								{plan.cattleName || "名前未設定"}
							</Button>
							{plan.gender && (
								<Badge
									variant="outline"
									className="text-xs transition-all duration-200 hover:shadow-sm"
								>
									<span
										className={clsx(
											"font-medium",
											plan.gender === "雄" && "text-blue-500",
											plan.gender === "去勢" && "text-gray-500",
											plan.gender === "雌" && "text-red-500"
										)}
									>
										{plan.gender}
									</span>
								</Badge>
							)}
							{plan.growthStage && (
								<Badge
									variant="default"
									className="text-xs transition-all duration-200 hover:shadow-sm"
								>
									{getGrowthStage(plan.growthStage as GrowthStage)}
								</Badge>
							)}
						</div>
					</div>

					{/* 出荷予定月 */}
					<div className="mb-3">
						<div className="text-lg font-bold text-green-600">
							{plan.plannedShipmentMonth} 出荷予定
						</div>
					</div>

					{/* 詳細情報 */}
					<div className="grid grid-cols-2 gap-3 text-sm mb-3">
						<div>
							<span className="text-muted-foreground">個体識別番号:</span>
							<div className="font-medium">
								{plan.identificationNumber || "-"}
							</div>
						</div>
						<div>
							<span className="text-muted-foreground">登録日:</span>
							<div className="font-medium">
								{new Date(plan.createdAt).toLocaleDateString("ja-JP")}
							</div>
						</div>
					</div>

					{/* 操作ボタン */}
					<div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
						<Button
							variant="outline"
							size="sm"
							onClick={handleConvertToRecord}
							className="h-8 px-3 text-xs text-green-600 hover:text-green-700"
						>
							<ArrowRight className="h-3 w-3 mr-1" />
							実績化
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleEdit}
							className="h-8 px-3 text-xs"
						>
							<Pencil className="h-3 w-3 mr-1" />
							編集
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDelete}
							className="h-8 px-3 text-xs text-destructive hover:text-destructive"
						>
							<Trash2 className="h-3 w-3 mr-1" />
							削除
						</Button>
					</div>
				</div>
			</div>
		);
	}
);

ShipmentPlanItem.displayName = "ShipmentPlanItem";
