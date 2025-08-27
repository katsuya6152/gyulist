"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp } from "lucide-react";
import { sortOptions } from "../../constants";

interface FilterSortButtonsProps {
	activeFilterCount: number;
	currentSortBy: string;
	currentSortOrder: string;
	onFilterClick: () => void;
	onSortClick: () => void;
}

export function FilterSortButtons({
	activeFilterCount,
	currentSortBy,
	currentSortOrder,
	onFilterClick,
	onSortClick
}: FilterSortButtonsProps) {
	const sortOrderOptions = [
		{ value: "asc", label: "昇順" },
		{ value: "desc", label: "降順" }
	];

	const currentSortLabel =
		sortOptions.find((o) => o.id === currentSortBy)?.label || "未設定";
	const currentOrderLabel =
		sortOrderOptions.find((o) => o.value === currentSortOrder)?.label ||
		"未設定";

	return (
		<div className="hidden lg:flex items-center gap-3">
			{/* フィルターボタン */}
			<Button
				variant="outline"
				size="sm"
				onClick={onFilterClick}
				className="h-9 px-4 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
			>
				<Filter className="h-4 w-4 mr-2 text-blue-600" />
				<span className="text-sm font-medium">フィルター</span>
				{activeFilterCount > 0 && (
					<Badge
						variant="secondary"
						className="ml-2 h-5 px-1.5 text-xs bg-blue-100 text-blue-700 border-blue-200"
					>
						{activeFilterCount}
					</Badge>
				)}
			</Button>

			{/* ソートボタン */}
			<Button
				variant="outline"
				size="sm"
				onClick={onSortClick}
				className="h-9 px-4 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
			>
				<TrendingUp className="h-4 w-4 mr-2 text-green-600" />
				<span className="text-sm font-medium">ソート</span>
				<div className="ml-2 flex items-center gap-1 text-xs text-gray-500">
					<span>{currentSortLabel}</span>
					<span>-</span>
					<span>{currentOrderLabel}</span>
				</div>
			</Button>
		</div>
	);
}
