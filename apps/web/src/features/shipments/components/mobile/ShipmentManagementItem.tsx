"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MotherShipmentDetail } from "@/services/shipmentService";
import { clsx } from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import { memo } from "react";

interface ShipmentManagementItemProps {
	shipment: MotherShipmentDetail;
	index: number;
	onMotherClick: (motherId: number) => void;
	onCalfClick: (calfId: number) => void;
	onEdit?: (shipment: MotherShipmentDetail) => void;
	onDelete?: (shipment: MotherShipmentDetail) => void;
	showActions?: boolean;
}

export const ShipmentManagementItem = memo(
	({
		shipment,
		index,
		onMotherClick,
		onCalfClick,
		onEdit,
		onDelete,
		showActions = false
	}: ShipmentManagementItemProps) => {
		const handleMotherClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onMotherClick(shipment.motherId);
		};

		const handleCalfClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onCalfClick(shipment.calfId);
		};

		const handleEdit = (e: React.MouseEvent) => {
			e.stopPropagation();
			onEdit?.(shipment);
		};

		const handleDelete = (e: React.MouseEvent) => {
			e.stopPropagation();
			onDelete?.(shipment);
		};

		return (
			<div
				className="animate-fade-in-up"
				style={{ animationDelay: `${index * 0.02}s` }}
			>
				<div className="bg-card border-b border-border p-4 hover:bg-muted/30 transition-colors duration-200">
					{/* ヘッダー部分: 母牛名と子牛名 */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2 min-w-0 flex-1">
							<Button
								variant="ghost"
								className="p-0 h-auto text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
								onClick={handleMotherClick}
							>
								{shipment.motherName}
							</Button>
							<span className="text-muted-foreground">→</span>
							{shipment.calfName ? (
								<Button
									variant="ghost"
									className="p-0 h-auto text-left font-medium text-blue-600 hover:text-blue-800 hover:underline truncate"
									onClick={handleCalfClick}
								>
									{shipment.calfName}
								</Button>
							) : (
								<span className="text-muted-foreground">子牛名不明</span>
							)}
							{shipment.sex && (
								<Badge
									variant="outline"
									className="text-xs transition-all duration-200 hover:shadow-sm"
								>
									<span
										className={clsx(
											"font-medium",
											shipment.sex === "雄" && "text-blue-500",
											shipment.sex === "去勢" && "text-gray-500",
											shipment.sex === "雌" && "text-red-500"
										)}
									>
										{shipment.sex}
									</span>
								</Badge>
							)}
						</div>
					</div>

					{/* 出荷情報 */}
					<div className="mb-3">
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">出荷日:</div>
							<div className="font-medium">
								{shipment.shipmentDate
									? new Date(shipment.shipmentDate).toLocaleDateString("ja-JP")
									: "-"}
							</div>
						</div>
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">価格:</div>
							<div className="text-lg font-bold text-green-600">
								{shipment.price ? `¥${shipment.price.toLocaleString()}` : "-"}
							</div>
						</div>
					</div>

					{/* 詳細情報 */}
					<div className="grid grid-cols-2 gap-3 text-sm mb-3">
						<div>
							<span className="text-muted-foreground">出荷体重:</span>
							<div className="font-medium">
								{shipment.shipmentWeight ? `${shipment.shipmentWeight}kg` : "-"}
							</div>
						</div>
						<div>
							<span className="text-muted-foreground">出荷日齢:</span>
							<div className="font-medium">
								{shipment.ageAtShipment ? `${shipment.ageAtShipment}日` : "-"}
							</div>
						</div>
						<div>
							<span className="text-muted-foreground">購買者:</span>
							<div className="font-medium">{shipment.buyer || "-"}</div>
						</div>
						<div>
							<span className="text-muted-foreground">耳標:</span>
							<div className="font-medium">{shipment.motherEarTag || "-"}</div>
						</div>
					</div>

					{/* 血統情報 */}
					<div className="mb-3">
						<div className="text-sm text-muted-foreground mb-1">血統:</div>
						<div className="text-sm space-y-1">
							<div>父: {shipment.pedigree.father || "-"}</div>
							<div>母の父: {shipment.pedigree.motherFather || "-"}</div>
							<div>母の祖父: {shipment.pedigree.motherGrandfather || "-"}</div>
							<div>
								母の母の祖父: {shipment.pedigree.motherMotherGrandfather || "-"}
							</div>
						</div>
					</div>

					{/* 繁殖情報 */}
					<div className="mb-3">
						<div className="text-sm text-muted-foreground mb-1">繁殖情報:</div>
						<div className="text-sm space-y-1">
							<div>
								種付年月日:{" "}
								{shipment.breedingDate
									? new Date(shipment.breedingDate).toLocaleDateString("ja-JP")
									: "-"}
							</div>
							<div>
								分娩予定日:{" "}
								{shipment.expectedBirthDate
									? new Date(shipment.expectedBirthDate).toLocaleDateString(
											"ja-JP"
										)
									: "-"}
							</div>
							<div>
								分娩日:{" "}
								{shipment.birthDate
									? new Date(shipment.birthDate).toLocaleDateString("ja-JP")
									: "-"}
							</div>
						</div>
					</div>

					{/* 備考 */}
					{shipment.notes && (
						<div className="mb-3">
							<span className="text-muted-foreground">備考:</span>
							<div className="font-medium text-sm line-clamp-2">
								{shipment.notes}
							</div>
						</div>
					)}

					{/* 操作ボタン */}
					{showActions && (onEdit || onDelete) && (
						<div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
							{onEdit && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleEdit}
									className="h-8 px-3 text-xs"
								>
									<Pencil className="h-3 w-3 mr-1" />
									編集
								</Button>
							)}
							{onDelete && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleDelete}
									className="h-8 px-3 text-xs text-destructive hover:text-destructive"
								>
									<Trash2 className="h-3 w-3 mr-1" />
									削除
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
		);
	}
);

ShipmentManagementItem.displayName = "ShipmentManagementItem";
