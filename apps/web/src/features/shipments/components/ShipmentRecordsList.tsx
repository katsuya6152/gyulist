"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ShipmentRecordsSearchAndFilters } from "./ShipmentRecordsSearchAndFilters";
import { ShipmentRecordsTable } from "./ShipmentRecordsTable";
import type { ShipmentRecord } from "./ShipmentRecordsTable";

type Props = {
	initialData?: ShipmentRecord[];
	error?: string;
	initialSearchParams?: {
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
	};
	onEdit: (record: ShipmentRecord) => void;
	onDelete: (shipmentId: string) => void;
	onAddNew: () => void;
};

export function ShipmentRecordsList({
	initialData,
	error: initialError,
	initialSearchParams,
	onEdit,
	onDelete,
	onAddNew
}: Props) {
	const [data, setData] = useState<ShipmentRecord[] | undefined>(initialData);
	const [error, setError] = useState<string | null>(initialError || null);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentSortBy, setCurrentSortBy] = useState(
		initialSearchParams?.sortBy || "shipmentDate"
	);
	const [currentSortOrder, setCurrentSortOrder] = useState<"asc" | "desc">(
		initialSearchParams?.sortOrder || "desc"
	);
	const [currentLimit, setCurrentLimit] = useState(
		initialSearchParams?.limit || 50
	);

	// 検索処理
	const handleSearch = useCallback(() => {
		// 実際の実装では、APIを呼び出して検索結果を取得
		console.log("Searching for:", searchTerm);
	}, [searchTerm]);

	// ソート変更
	const handleSort = useCallback(
		(sortBy: string) => {
			const newSortOrder =
				currentSortBy === sortBy && currentSortOrder === "asc" ? "desc" : "asc";

			setCurrentSortBy(sortBy);
			setCurrentSortOrder(newSortOrder);
		},
		[currentSortBy, currentSortOrder]
	);

	// 表示件数変更
	const handleLimitChange = useCallback((limit: number) => {
		setCurrentLimit(limit);
	}, []);

	// CSVエクスポート
	const handleExport = useCallback(() => {
		if (!data) return;

		const headers = [
			"牛名",
			"出荷日",
			"価格",
			"体重",
			"出荷時月齢",
			"購買者",
			"備考"
		];

		const csvData = [
			headers.join(","),
			...data.map((record) =>
				[
					record.cattleName || "",
					record.shipmentDate,
					record.price,
					record.weight || "",
					record.ageAtShipment || "",
					record.buyer || "",
					record.notes || ""
				]
					.map((cell) => `"${cell}"`)
					.join(",")
			)
		].join("\n");

		const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `出荷実績_個別_${new Date().toISOString().split("T")[0]}.csv`;
		link.click();
	}, [data]);

	// 初期データが変更されたら状態を更新
	useEffect(() => {
		if (initialData) {
			setData(initialData);
		}
		if (initialError) {
			setError(initialError);
		}
	}, [initialData, initialError]);

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>エラーが発生しました</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive mb-4">{error}</p>
					<Button onClick={() => window.location.reload()} variant="outline">
						再試行
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* 検索・フィルター・テーブル */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>個別出荷実績一覧</CardTitle>
							<CardDescription>
								各牛の出荷実績を個別に表示します
							</CardDescription>
						</div>
						<Button onClick={onAddNew} className="flex items-center gap-2">
							<Plus className="h-4 w-4" />
							新規登録
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-6">
						<ShipmentRecordsSearchAndFilters
							searchTerm={searchTerm}
							onSearchTermChange={setSearchTerm}
							onSearch={handleSearch}
							currentSortBy={currentSortBy}
							currentSortOrder={currentSortOrder}
							onSortChange={handleSort}
							currentLimit={currentLimit}
							onLimitChange={handleLimitChange}
							onExportCsv={handleExport}
						/>
					</div>

					{/* テーブル */}
					<div className="mb-6">
						<ShipmentRecordsTable
							data={data}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
