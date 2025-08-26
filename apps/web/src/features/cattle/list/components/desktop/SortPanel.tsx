"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
	ArrowUpDown,
	ChevronDown,
	ChevronUp,
	SortAsc,
	SortDesc,
	TrendingUp
} from "lucide-react";
import { useState } from "react";

interface SortPanelProps {
	currentSortBy: string;
	currentSortOrder: string;
	onSort: (sortBy: string, sortOrder: string) => void;
}

export function SortPanel({
	currentSortBy,
	currentSortOrder,
	onSort
}: SortPanelProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const sortOptions = [
		{ value: "cattle_id", label: "個体番号" },
		{ value: "name", label: "名前" },
		{ value: "gender", label: "性別" },
		{ value: "growth_stage", label: "成長段階" },
		{ value: "status", label: "ステータス" },
		{ value: "created_at", label: "登録日" }
	];

	const sortOrderOptions = [
		{ value: "asc", label: "昇順", icon: SortAsc },
		{ value: "desc", label: "降順", icon: SortDesc }
	];

	const handleSortChange = (sortBy: string) => {
		onSort(sortBy, currentSortOrder);
	};

	const handleOrderChange = (sortOrder: string) => {
		onSort(currentSortBy, sortOrder);
	};

	const currentSortLabel =
		sortOptions.find((o) => o.value === currentSortBy)?.label || "未設定";
	const currentOrderLabel =
		sortOrderOptions.find((o) => o.value === currentSortOrder)?.label ||
		"未設定";

	return (
		<div className="hidden lg:block w-full">
			{/* コンパクトなソートヘッダー */}
			<div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">ソート</span>
					</div>

					{/* 現在のソート状態プレビュー */}
					<div className="flex items-center gap-2">
						<Separator orientation="vertical" className="h-4" />
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<ArrowUpDown className="h-3 w-3" />
							<span>{currentSortLabel}</span>
							<span className="text-muted-foreground">-</span>
							<span>{currentOrderLabel}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* クイックソートボタン */}
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onSort("cattle_id", "asc")}
							className="h-7 px-2 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
						>
							<SortAsc className="h-3 w-3 mr-1" />
							個体番号順
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onSort("name", "asc")}
							className="h-7 px-2 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
						>
							<SortAsc className="h-3 w-3 mr-1" />
							名前順
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onSort("created_at", "desc")}
							className="h-7 px-2 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
						>
							<SortDesc className="h-3 w-3 mr-1" />
							新着順
						</Button>
					</div>

					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
						className="h-7 px-2 text-xs"
					>
						{isExpanded ? (
							<ChevronUp className="h-3 w-3" />
						) : (
							<ChevronDown className="h-3 w-3" />
						)}
					</Button>
				</div>
			</div>

			{/* 展開時のソートオプション */}
			{isExpanded && (
				<div className="mt-3 p-4 bg-background border rounded-lg shadow-sm">
					<div className="grid grid-cols-2 gap-6">
						{/* ソート項目 */}
						<div className="space-y-2">
							<Label className="text-xs font-semibold text-foreground flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
								ソート項目
							</Label>
							<RadioGroup
								value={currentSortBy}
								onValueChange={handleSortChange}
								className="space-y-1"
							>
								{sortOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2 group"
									>
										<RadioGroupItem
											value={option.value}
											id={`sort-${option.value}`}
											className="text-blue-500 border-muted-foreground/30"
										/>
										<Label
											htmlFor={`sort-${option.value}`}
											className="text-xs font-normal cursor-pointer group-hover:text-blue-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						{/* ソート順序 */}
						<div className="space-y-2">
							<Label className="text-xs font-semibold text-foreground flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
								ソート順序
							</Label>
							<RadioGroup
								value={currentSortOrder}
								onValueChange={handleOrderChange}
								className="space-y-1"
							>
								{sortOrderOptions.map((option) => {
									const Icon = option.icon;
									return (
										<div
											key={option.value}
											className="flex items-center space-x-2 group"
										>
											<RadioGroupItem
												value={option.value}
												id={`order-${option.value}`}
												className="text-green-500 border-muted-foreground/30"
											/>
											<Label
												htmlFor={`order-${option.value}`}
												className="text-xs font-normal cursor-pointer group-hover:text-green-600 transition-colors flex items-center gap-2"
											>
												<Icon className="h-3 w-3" />
												{option.label}
											</Label>
										</div>
									);
								})}
							</RadioGroup>
						</div>
					</div>

					{/* 現在のソート状態表示 */}
					<div className="mt-4 pt-3 border-t">
						<Label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-2">
							<span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
							現在のソート
						</Label>
						<div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
							<div className="flex items-center gap-2 text-xs text-purple-700">
								<ArrowUpDown className="h-3 w-3" />
								<span className="font-medium">{currentSortLabel}</span>
								<span className="text-purple-500">-</span>
								<span className="font-medium">{currentOrderLabel}</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
