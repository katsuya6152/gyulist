"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { ArrowUpDown, Download, Search } from "lucide-react";

type Props = {
	searchTerm: string;
	onSearchTermChange: (value: string) => void;
	onSearch: () => void;
	currentSortBy: string;
	currentSortOrder: "asc" | "desc";
	onSortChange: (value: string) => void;
	currentLimit: number;
	onLimitChange: (value: number) => void;
	onExportCsv: () => void;
};

export function ShipmentRecordsSearchAndFilters({
	searchTerm,
	onSearchTermChange,
	onSearch,
	currentSortBy,
	currentSortOrder,
	onSortChange,
	currentLimit,
	onLimitChange,
	onExportCsv
}: Props) {
	return (
		<div className="flex flex-col lg:flex-row gap-4 w-full">
			{/* 検索 */}
			<div className="flex gap-2 flex-1">
				<Input
					placeholder="牛名、個体識別番号で検索..."
					value={searchTerm}
					onChange={(e) => onSearchTermChange(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && onSearch()}
					className="flex-1"
				/>
				<Button onClick={onSearch} size="icon">
					<Search className="h-4 w-4" />
				</Button>
			</div>

			{/* フィルター・ソート・エクスポート */}
			<div className="flex gap-2 w-full lg:w-auto">
				{/* ソート */}
				<Select value={currentSortBy} onValueChange={onSortChange}>
					<SelectTrigger className="w-full lg:w-40">
						<SelectValue placeholder="ソート" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="shipmentDate">出荷日</SelectItem>
						<SelectItem value="cattleName">牛名</SelectItem>
						<SelectItem value="price">価格</SelectItem>
						<SelectItem value="weight">体重</SelectItem>
						<SelectItem value="ageAtShipment">出荷時月齢</SelectItem>
						<SelectItem value="buyer">購買者</SelectItem>
					</SelectContent>
				</Select>

				<Button
					variant="outline"
					size="icon"
					onClick={() => onSortChange(currentSortBy)}
					title={`${currentSortOrder === "asc" ? "昇順" : "降順"}で並び替え`}
				>
					<ArrowUpDown className="h-4 w-4" />
				</Button>

				{/* 表示件数 */}
				<Select
					value={currentLimit.toString()}
					onValueChange={(value) => onLimitChange(Number(value))}
				>
					<SelectTrigger className="w-full lg:w-20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="50">50</SelectItem>
						<SelectItem value="100">100</SelectItem>
						<SelectItem value="200">200</SelectItem>
					</SelectContent>
				</Select>

				{/* CSVエクスポート */}
				<Button onClick={onExportCsv} variant="outline" size="icon">
					<Download className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
