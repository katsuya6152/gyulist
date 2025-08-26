"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUpDown, SortAsc, SortDesc, TrendingUp } from "lucide-react";
import { sortOptions } from "../../constants";

interface SortDialogProps {
	currentSortBy: string;
	currentSortOrder: string;
	onSort: (sortBy: string, sortOrder: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SortDialog({
	currentSortBy,
	currentSortOrder,
	onSort,
	open,
	onOpenChange
}: SortDialogProps) {
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

	const handleSubmit = () => {
		onOpenChange(false);
	};

	const currentSortLabel =
		sortOptions.find((o) => o.id === currentSortBy)?.label || "未設定";
	const currentOrderLabel =
		sortOrderOptions.find((o) => o.value === currentSortOrder)?.label ||
		"未設定";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-primary" />
						ソート設定
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* 現在のソート状態表示 */}
					<div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-sm font-medium text-purple-700">
								現在のソート
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-purple-700">
							<ArrowUpDown className="h-4 w-4" />
							<span className="font-medium">{currentSortLabel}</span>
							<span className="text-purple-500">-</span>
							<span className="font-medium">{currentOrderLabel}</span>
						</div>
					</div>

					{/* クイックソートボタン */}
					<div className="space-y-3">
						<Label className="text-sm font-semibold text-foreground">
							よく使うソート
						</Label>
						<div className="grid grid-cols-2 gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onSort("id", "asc")}
								className="h-9 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
							>
								<SortAsc className="h-3 w-3 mr-1" />
								ID順
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onSort("name", "asc")}
								className="h-9 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
							>
								<SortAsc className="h-3 w-3 mr-1" />
								名前順
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onSort("days_old", "desc")}
								className="h-9 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
							>
								<SortDesc className="h-3 w-3 mr-1" />
								日齢順
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onSort("days_open", "desc")}
								className="h-9 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
							>
								<SortDesc className="h-3 w-3 mr-1" />
								空胎日数順
							</Button>
						</div>
					</div>

					{/* ソートオプション */}
					<div className="grid grid-cols-2 gap-6">
						{/* ソート項目 */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span className="w-2 h-2 bg-blue-500 rounded-full" />
								ソート項目
							</Label>
							<RadioGroup
								value={currentSortBy}
								onValueChange={handleSortChange}
								className="space-y-2"
							>
								{sortOptions.map((option) => (
									<div
										key={option.id}
										className="flex items-center space-x-3 group"
									>
										<RadioGroupItem
											value={option.id}
											id={`sort-${option.id}`}
											className="text-blue-500 border-muted-foreground/30"
										/>
										<Label
											htmlFor={`sort-${option.id}`}
											className="text-sm font-normal cursor-pointer group-hover:text-blue-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						{/* ソート順序 */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span className="w-2 h-2 bg-green-500 rounded-full" />
								ソート順序
							</Label>
							<RadioGroup
								value={currentSortOrder}
								onValueChange={handleOrderChange}
								className="space-y-2"
							>
								{sortOrderOptions.map((option) => {
									const Icon = option.icon;
									return (
										<div
											key={option.value}
											className="flex items-center space-x-3 group"
										>
											<RadioGroupItem
												value={option.value}
												id={`order-${option.value}`}
												className="text-green-500 border-muted-foreground/30"
											/>
											<Label
												htmlFor={`order-${option.value}`}
												className="text-sm font-normal cursor-pointer group-hover:text-green-600 transition-colors flex items-center gap-2"
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
				</div>

				<DialogFooter className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="flex-1"
					>
						キャンセル
					</Button>
					<Button
						onClick={handleSubmit}
						className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
					>
						ソート適用
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
