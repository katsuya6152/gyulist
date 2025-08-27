"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import type { MotherShipmentDetail } from "@/services/shipmentService";
import { clsx } from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
	data: MotherShipmentDetail[];
	onEdit?: (shipment: MotherShipmentDetail) => void;
	onDelete?: (shipment: MotherShipmentDetail) => void;
	showActions?: boolean;
};

export function ShipmentManagementTable({
	data,
	onEdit,
	onDelete,
	showActions = false
}: Props) {
	const router = useRouter();

	const handleMotherClick = (motherId: number) => {
		router.push(`/cattle/${motherId}`);
	};

	const handleCalfClick = (calfId: number) => {
		router.push(`/cattle/${calfId}`);
	};

	if (data.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				出荷実績がありません
			</div>
		);
	}

	return (
		<div className="hidden lg:block rounded-md border overflow-x-auto">
			<Table className="min-w-full">
				<TableHeader>
					<TableRow>
						<TableHead className="whitespace-nowrap">母牛名</TableHead>
						<TableHead className="whitespace-nowrap">耳標</TableHead>
						<TableHead className="whitespace-nowrap sticky left-0 bg-background border-r shadow-[-2px_0_8px_rgba(0,0,0,0.1)] z-10">
							子牛名
						</TableHead>
						<TableHead className="whitespace-nowrap">性別</TableHead>
						<TableHead className="whitespace-nowrap">父</TableHead>
						<TableHead className="whitespace-nowrap">母の父</TableHead>
						<TableHead className="whitespace-nowrap">母の祖父</TableHead>
						<TableHead className="whitespace-nowrap">母の母の祖父</TableHead>
						<TableHead className="whitespace-nowrap">種付年月日</TableHead>
						<TableHead className="whitespace-nowrap">分娩予定日</TableHead>
						<TableHead className="whitespace-nowrap">分娩日</TableHead>
						<TableHead className="whitespace-nowrap">出荷日</TableHead>
						<TableHead className="text-right whitespace-nowrap">
							出荷体重
						</TableHead>
						<TableHead className="text-right whitespace-nowrap">
							出荷日齢
						</TableHead>
						<TableHead className="text-right whitespace-nowrap">価格</TableHead>
						<TableHead className="whitespace-nowrap">購買者</TableHead>
						<TableHead className="whitespace-nowrap">備考</TableHead>
						{showActions && (
							<TableHead className="text-right whitespace-nowrap sticky right-0 bg-background border-l shadow-[2px_0_8px_rgba(0,0,0,0.1)] z-10">
								操作
							</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((row, index) => (
						<TableRow key={`${row.motherId}-${row.calfId}-${index}`}>
							<TableCell className="font-medium whitespace-nowrap">
								<button
									type="button"
									onClick={() => handleMotherClick(row.motherId)}
									className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
								>
									{row.motherName}
								</button>
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.motherEarTag || "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap sticky left-0 bg-background border-r shadow-[-2px_0_8px_rgba(0,0,0,0.1)] z-10">
								{row.calfName ? (
									<button
										type="button"
										onClick={() => handleCalfClick(row.calfId)}
										className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
									>
										{row.calfName}
									</button>
								) : (
									"-"
								)}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.sex && (
									<Badge
										variant="outline"
										className="transition-all duration-200 hover:shadow-sm"
									>
										<span
											className={clsx(
												"text-sm font-medium",
												row.sex === "雄" && "text-blue-500",
												row.sex === "去勢" && "text-gray-500",
												row.sex === "雌" && "text-red-500"
											)}
										>
											{row.sex}
										</span>
									</Badge>
								)}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.pedigree.father || "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.pedigree.motherFather || "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.pedigree.motherGrandfather || "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.pedigree.motherMotherGrandfather || "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.breedingDate
									? new Date(row.breedingDate).toLocaleDateString("ja-JP")
									: "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.expectedBirthDate
									? new Date(row.expectedBirthDate).toLocaleDateString("ja-JP")
									: "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.birthDate
									? new Date(row.birthDate).toLocaleDateString("ja-JP")
									: "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.shipmentDate
									? new Date(row.shipmentDate).toLocaleDateString("ja-JP")
									: "-"}
							</TableCell>
							<TableCell className="text-right whitespace-nowrap">
								{row.shipmentWeight ? `${row.shipmentWeight}kg` : "-"}
							</TableCell>
							<TableCell className="text-right whitespace-nowrap">
								{row.ageAtShipment ? `${row.ageAtShipment}日` : "-"}
							</TableCell>
							<TableCell className="text-right whitespace-nowrap">
								{row.price ? `¥${row.price.toLocaleString()}` : "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.buyer || "-"}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{row.notes ? (
									<div className="max-w-xs truncate" title={row.notes}>
										{row.notes}
									</div>
								) : (
									"-"
								)}
							</TableCell>
							{showActions && (
								<TableCell className="text-right whitespace-nowrap sticky right-0 bg-background border-l shadow-[2px_0_8px_rgba(0,0,0,0.1)]">
									<div className="flex items-center justify-end gap-2">
										{onEdit && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => onEdit(row)}
												className="h-8 w-8 p-0"
											>
												<Pencil className="h-4 w-4" />
											</Button>
										)}
										{onDelete && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => onDelete(row)}
												className="h-8 w-8 p-0 text-destructive hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
