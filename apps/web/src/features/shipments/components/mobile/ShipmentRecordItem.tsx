"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { memo } from "react";
import type { ShipmentRecord } from "../ShipmentRecordsTable";

interface ShipmentRecordItemProps {
	record: ShipmentRecord;
	index: number;
	onCattleClick: (cattleId: number) => void;
	onEdit: (record: ShipmentRecord) => void;
	onDelete: (shipmentId: string) => void;
}

export const ShipmentRecordItem = memo(
	({
		record,
		index,
		onCattleClick,
		onEdit,
		onDelete
	}: ShipmentRecordItemProps) => {
		const handleCattleClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onCattleClick(record.cattleId);
		};

		const handleEdit = (e: React.MouseEvent) => {
			e.stopPropagation();
			onEdit(record);
		};

		const handleDelete = (e: React.MouseEvent) => {
			e.stopPropagation();
			onDelete(record.shipmentId);
		};

		return (
			<div
				className="animate-fade-in-up"
				style={{ animationDelay: `${index * 0.02}s` }}
			>
				<div className="bg-card border-b border-border p-4 hover:bg-muted/30 transition-colors duration-200">
					{/* ヘッダー部分: 牛名と価格 */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2 min-w-0 flex-1">
							<Button
								variant="ghost"
								className="p-0 h-auto text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
								onClick={handleCattleClick}
							>
								{record.cattleName || "名前未設定"}
							</Button>
						</div>
						<div className="text-lg font-bold text-green-600">
							{record.price.toLocaleString()}円
						</div>
					</div>

					{/* 出荷日 */}
					<div className="mb-3">
						<div className="text-sm text-muted-foreground">出荷日</div>
						<div className="font-medium">
							{new Date(record.shipmentDate).toLocaleDateString("ja-JP")}
						</div>
					</div>

					{/* 詳細情報 */}
					<div className="grid grid-cols-2 gap-3 text-sm mb-3">
						<div>
							<span className="text-muted-foreground">体重:</span>
							<div className="font-medium">
								{record.weight ? `${record.weight}kg` : "-"}
							</div>
						</div>
						<div>
							<span className="text-muted-foreground">出荷時月齢:</span>
							<div className="font-medium">
								{record.ageAtShipment ? `${record.ageAtShipment}ヶ月` : "-"}
							</div>
						</div>
						<div>
							<span className="text-muted-foreground">買主:</span>
							<div className="font-medium">{record.buyer || "-"}</div>
						</div>
						<div>
							<span className="text-muted-foreground">メモ:</span>
							<div className="font-medium">
								{record.notes ? (
									<div className="truncate" title={record.notes}>
										{record.notes}
									</div>
								) : (
									"-"
								)}
							</div>
						</div>
					</div>

					{/* 操作ボタン */}
					<div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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

ShipmentRecordItem.displayName = "ShipmentRecordItem";
