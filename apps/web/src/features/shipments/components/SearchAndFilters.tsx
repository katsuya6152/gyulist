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
	currentSortOrder: string;
	onSortChange: (field: string) => void;
	currentLimit: number;
	onLimitChange: (limit: number) => void;
	onExportCsv: () => void;
};

export function SearchAndFilters({
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
		<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
			{/* 検索 */}
			<div className="flex gap-2 w-full lg:w-auto">
				<Input
					placeholder="母牛名で検索..."
					value={searchTerm}
					onChange={(e) => onSearchTermChange(e.target.value)}
					className="w-full lg:w-64"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							onSearch();
						}
					}}
				/>
				<Button onClick={onSearch} size="icon" variant="outline">
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
						<SelectItem value="motherName">母牛名</SelectItem>
						<SelectItem value="totalRevenue">総収益</SelectItem>
						<SelectItem value="averagePrice">平均価格</SelectItem>
						<SelectItem value="shipmentCount">出荷頭数</SelectItem>
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
