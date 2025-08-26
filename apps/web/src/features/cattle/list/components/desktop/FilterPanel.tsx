"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Filter, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { FilterFormData } from "../../constants";

interface FilterPanelProps {
	initialGrowthStage: string[];
	initialGender: string[];
	initialStatus: string[];
	initialHasAlert: string;
	onSubmit: (data: FilterFormData) => void;
	onClear: () => void;
}

export function FilterPanel({
	initialGrowthStage,
	initialGender,
	initialStatus,
	initialHasAlert,
	onSubmit,
	onClear
}: FilterPanelProps) {
	const [growthStage, setGrowthStage] = useState<string[]>(initialGrowthStage);
	const [gender, setGender] = useState<string[]>(initialGender);
	const [status, setStatus] = useState<string[]>(initialStatus);
	const [hasAlert, setHasAlert] = useState<"all" | "true" | "false">(
		initialHasAlert as "all" | "true" | "false"
	);
	const [isExpanded, setIsExpanded] = useState(false);

	const growthStageOptions = [
		{ value: "calf", label: "子牛" },
		{ value: "heifer", label: "育成牛" },
		{ value: "cow", label: "成牛" }
	];

	const genderOptions = [
		{ value: "male", label: "雄" },
		{ value: "female", label: "雌" }
	];

	const statusOptions = [
		{ value: "active", label: "活動中" },
		{ value: "inactive", label: "非活動" },
		{ value: "sold", label: "売却済" }
	];

	const hasAlertOptions = [
		{ value: "all", label: "すべて" },
		{ value: "true", label: "アラートあり" },
		{ value: "false", label: "アラートなし" }
	];

	const handleGrowthStageChange = (value: string, checked: boolean) => {
		if (checked) {
			setGrowthStage([...growthStage, value]);
		} else {
			setGrowthStage(growthStage.filter((item) => item !== value));
		}
	};

	const handleGenderChange = (value: string, checked: boolean) => {
		if (checked) {
			setGender([...gender, value]);
		} else {
			setGender(gender.filter((item) => item !== value));
		}
	};

	const handleStatusChange = (value: string, checked: boolean) => {
		if (checked) {
			setStatus([...status, value]);
		} else {
			setStatus(status.filter((item) => item !== value));
		}
	};

	const handleSubmit = () => {
		onSubmit({
			growth_stage: growthStage,
			gender,
			status,
			has_alert: hasAlert
		});
	};

	const handleClear = () => {
		setGrowthStage([]);
		setGender([]);
		setStatus([]);
		setHasAlert("all");
		onClear();
	};

	const hasActiveFilters =
		growthStage.length > 0 ||
		gender.length > 0 ||
		status.length > 0 ||
		hasAlert !== "all";

	const activeFilterCount = [
		growthStage.length,
		gender.length,
		status.length,
		hasAlert !== "all" ? 1 : 0
	].reduce((sum, count) => sum + count, 0);

	return (
		<div className="hidden lg:block w-full">
			{/* コンパクトなフィルターヘッダー */}
			<div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">フィルター</span>
						{activeFilterCount > 0 && (
							<Badge variant="secondary" className="text-xs">
								{activeFilterCount}
							</Badge>
						)}
					</div>

					{/* アクティブフィルターのプレビュー */}
					{hasActiveFilters && (
						<div className="flex items-center gap-2">
							<Separator orientation="vertical" className="h-4" />
							<div className="flex flex-wrap gap-1">
								{growthStage.map((stage) => (
									<Badge
										key={`growth-${stage}`}
										variant="secondary"
										className="text-xs bg-blue-50 text-blue-700 border-blue-200"
									>
										{growthStageOptions.find((o) => o.value === stage)?.label}
									</Badge>
								))}
								{gender.map((g) => (
									<Badge
										key={`gender-${g}`}
										variant="secondary"
										className="text-xs bg-green-50 text-green-700 border-green-200"
									>
										{genderOptions.find((o) => o.value === g)?.label}
									</Badge>
								))}
								{status.map((s) => (
									<Badge
										key={`status-${s}`}
										variant="secondary"
										className="text-xs bg-orange-50 text-orange-700 border-orange-200"
									>
										{statusOptions.find((o) => o.value === s)?.label}
									</Badge>
								))}
								{hasAlert !== "all" && (
									<Badge
										variant="secondary"
										className="text-xs bg-red-50 text-red-700 border-red-200"
									>
										{hasAlertOptions.find((o) => o.value === hasAlert)?.label}
									</Badge>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClear}
							className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
						>
							<RotateCcw className="h-3 w-3 mr-1" />
							クリア
						</Button>
					)}
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

			{/* 展開時のフィルターオプション */}
			{isExpanded && (
				<div className="mt-3 p-4 bg-background border rounded-lg shadow-sm">
					<div className="grid grid-cols-2 gap-6">
						{/* 成長段階 */}
						<div className="space-y-2">
							<Label className="text-xs font-semibold text-foreground flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
								成長段階
							</Label>
							<div className="space-y-1">
								{growthStageOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2 group"
									>
										<Checkbox
											id={`growth-${option.value}`}
											checked={growthStage.includes(option.value)}
											onCheckedChange={(checked) =>
												handleGrowthStageChange(
													option.value,
													checked as boolean
												)
											}
											className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
										/>
										<Label
											htmlFor={`growth-${option.value}`}
											className="text-xs font-normal cursor-pointer group-hover:text-blue-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</div>
						</div>

						{/* 性別 */}
						<div className="space-y-2">
							<Label className="text-xs font-semibold text-foreground flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
								性別
							</Label>
							<div className="space-y-1">
								{genderOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2 group"
									>
										<Checkbox
											id={`gender-${option.value}`}
											checked={gender.includes(option.value)}
											onCheckedChange={(checked) =>
												handleGenderChange(option.value, checked as boolean)
											}
											className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
										/>
										<Label
											htmlFor={`gender-${option.value}`}
											className="text-xs font-normal cursor-pointer group-hover:text-green-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</div>
						</div>

						{/* ステータス */}
						<div className="space-y-2">
							<Label className="text-xs font-semibold text-foreground flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
								ステータス
							</Label>
							<div className="space-y-1">
								{statusOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2 group"
									>
										<Checkbox
											id={`status-${option.value}`}
											checked={status.includes(option.value)}
											onCheckedChange={(checked) =>
												handleStatusChange(option.value, checked as boolean)
											}
											className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
										/>
										<Label
											htmlFor={`status-${option.value}`}
											className="text-xs font-normal cursor-pointer group-hover:text-orange-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</div>
						</div>

						{/* アラート */}
						<div className="space-y-2">
							<Label className="text-xs font-semibold text-foreground flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
								アラート
							</Label>
							<RadioGroup
								value={hasAlert}
								onValueChange={(value) =>
									setHasAlert(value as "all" | "true" | "false")
								}
								className="space-y-1"
							>
								{hasAlertOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2 group"
									>
										<RadioGroupItem
											value={option.value}
											id={`alert-${option.value}`}
											className="text-red-500 border-muted-foreground/30"
										/>
										<Label
											htmlFor={`alert-${option.value}`}
											className="text-xs font-normal cursor-pointer group-hover:text-red-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>
					</div>

					{/* 適用ボタン */}
					<div className="mt-4 pt-3 border-t">
						<Button
							onClick={handleSubmit}
							className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
						>
							フィルター適用
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
