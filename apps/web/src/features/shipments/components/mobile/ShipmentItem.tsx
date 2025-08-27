"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MotherShipmentDetail } from "@/services/shipmentService";
import { clsx } from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { memo, useState } from "react";

interface ShipmentItemProps {
	shipment: MotherShipmentDetail;
	index: number;
	onMotherClick: (motherId: number) => void;
	onCalfClick: (calfId: number) => void;
}

export const ShipmentItem = memo(
	({ shipment, index, onMotherClick, onCalfClick }: ShipmentItemProps) => {
		const [isExpanded, setIsExpanded] = useState(false);

		const handleMotherClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onMotherClick(shipment.motherId);
		};

		const handleCalfClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			onCalfClick(shipment.calfId);
		};

		const handleToggleExpand = () => {
			setIsExpanded(!isExpanded);
		};

		const formatPrice = (price: number | null) => {
			if (!price) return "-";
			return `¥${(price / 10000).toFixed(0)}万`;
		};

		const formatWeight = (weight: number | null) => {
			if (!weight) return "-";
			return `${weight}kg`;
		};

		return (
			<div
				className="animate-fade-in-up"
				style={{ animationDelay: `${index * 0.02}s` }}
			>
				<div className="bg-card border-b border-border hover:bg-muted/30 transition-colors duration-200">
					{/* クリック可能なヘッダー部分 */}
					<button
						type="button"
						className="w-full p-3 cursor-pointer text-left bg-transparent border-0"
						onClick={handleToggleExpand}
					>
						{/* メインヘッダー: 母牛 → 子牛 */}
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2 min-w-0 flex-1">
								<Button
									variant="ghost"
									className="p-0 h-auto text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
									onClick={handleMotherClick}
								>
									{shipment.motherName}
								</Button>
								<span className="text-muted-foreground text-sm">→</span>
								{shipment.calfName ? (
									<Button
										variant="ghost"
										className="p-0 h-auto text-left font-medium text-blue-600 hover:text-blue-800 hover:underline truncate"
										onClick={handleCalfClick}
									>
										{shipment.calfName}
									</Button>
								) : (
									<span className="text-muted-foreground text-sm">-</span>
								)}
								{shipment.sex && (
									<Badge variant="outline" className="ml-1 text-xs">
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
							{isExpanded ? (
								<ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							) : (
								<ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							)}
						</div>

						{/* 重要情報: 1行で表示 */}
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-4">
								<span className="text-muted-foreground">
									{shipment.shipmentDate || "-"}
								</span>
								<span className="font-semibold text-green-600">
									{formatPrice(shipment.price)}
								</span>
								<span className="text-muted-foreground">
									{formatWeight(shipment.shipmentWeight)}
								</span>
							</div>
							{shipment.buyer && (
								<span className="text-xs text-muted-foreground truncate max-w-20">
									{shipment.buyer}
								</span>
							)}
						</div>

						{/* 血統情報: コンパクト表示（主要なもののみ） - 常に表示 */}
						{shipment.pedigree.father && (
							<div className="mt-2 text-xs text-muted-foreground">
								父: {shipment.pedigree.father}
								{shipment.pedigree.motherFather && (
									<span className="ml-2">
										母父: {shipment.pedigree.motherFather}
									</span>
								)}
							</div>
						)}
					</button>

					{/* 展開可能な詳細情報 */}
					{isExpanded && (
						<div className="px-3 pb-3 border-t border-border bg-muted/20">
							<div className="pt-3 space-y-3">
								{/* 詳細血統情報 */}
								{(shipment.pedigree.motherGrandfather ||
									shipment.pedigree.motherMotherGrandfather) && (
									<div className="text-xs">
										<div className="font-medium text-muted-foreground mb-1">
											詳細血統
										</div>
										{shipment.pedigree.motherGrandfather && (
											<div className="text-muted-foreground">
												母祖父: {shipment.pedigree.motherGrandfather}
											</div>
										)}
										{shipment.pedigree.motherMotherGrandfather && (
											<div className="text-muted-foreground">
												母曾祖父: {shipment.pedigree.motherMotherGrandfather}
											</div>
										)}
									</div>
								)}

								{/* 日付情報 */}
								<div className="grid grid-cols-2 gap-3 text-xs">
									<div>
										<span className="text-muted-foreground">種付年月日:</span>
										<div className="font-medium">
											{shipment.breedingDate || "-"}
										</div>
									</div>
									<div>
										<span className="text-muted-foreground">分娩予定日:</span>
										<div className="font-medium">
											{shipment.expectedBirthDate || "-"}
										</div>
									</div>
									<div>
										<span className="text-muted-foreground">生年月日:</span>
										<div className="font-medium">
											{shipment.birthDate || "-"}
										</div>
									</div>
									<div>
										<span className="text-muted-foreground">出荷時日齢:</span>
										<div className="font-medium">
											{shipment.ageAtShipment
												? `${shipment.ageAtShipment}日`
												: "-"}
										</div>
									</div>
								</div>

								{/* 備考 */}
								{shipment.notes && (
									<div className="text-xs">
										<span className="text-muted-foreground">備考:</span>
										<div className="font-medium mt-1">{shipment.notes}</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
);

ShipmentItem.displayName = "ShipmentItem";
