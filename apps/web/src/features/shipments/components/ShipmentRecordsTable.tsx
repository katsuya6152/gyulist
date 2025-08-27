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
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export type ShipmentRecord = {
	shipmentId: string;
	cattleId: number;
	cattleName: string | null;
	shipmentDate: string;
	price: number;
	weight: number | null;
	ageAtShipment: number | null;
	buyer: string | null;
	notes: string | null;
};

type Props = {
	data: ShipmentRecord[] | undefined;
	onEdit: (record: ShipmentRecord) => void;
	onDelete: (shipmentId: string) => void;
};

export function ShipmentRecordsTable({ data, onEdit, onDelete }: Props) {
	const router = useRouter();

	const handleCattleClick = (cattleId: number) => {
		router.push(`/cattle/${cattleId}`);
	};

	// データのソート処理
	const sortedData = data
		? [...data].sort((a, b) => {
				// デフォルトは出荷日で降順
				return (
					new Date(b.shipmentDate).getTime() -
					new Date(a.shipmentDate).getTime()
				);
			})
		: [];

	if (!data || data.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				出荷実績がありません
			</div>
		);
	}

	return (
		<div className="hidden lg:block rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>牛名</TableHead>
						<TableHead>出荷日</TableHead>
						<TableHead>価格</TableHead>
						<TableHead>体重</TableHead>
						<TableHead>出荷時月齢</TableHead>
						<TableHead>買主</TableHead>
						<TableHead>メモ</TableHead>
						<TableHead className="text-right">操作</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedData.map((record) => (
						<TableRow key={record.shipmentId}>
							<TableCell className="font-medium">
								<button
									type="button"
									onClick={() => handleCattleClick(record.cattleId)}
									className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
								>
									{record.cattleName || "-"}
								</button>
							</TableCell>
							<TableCell>
								{new Date(record.shipmentDate).toLocaleDateString("ja-JP")}
							</TableCell>
							<TableCell className="font-semibold">
								{record.price.toLocaleString()}円
							</TableCell>
							<TableCell>
								{record.weight ? `${record.weight}kg` : "-"}
							</TableCell>
							<TableCell>
								{record.ageAtShipment ? `${record.ageAtShipment}ヶ月` : "-"}
							</TableCell>
							<TableCell>{record.buyer || "-"}</TableCell>
							<TableCell>
								{record.notes ? (
									<div className="max-w-xs truncate" title={record.notes}>
										{record.notes}
									</div>
								) : (
									"-"
								)}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(record)}
										className="h-8 w-8 p-0"
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDelete(record.shipmentId)}
										className="h-8 w-8 p-0 text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
