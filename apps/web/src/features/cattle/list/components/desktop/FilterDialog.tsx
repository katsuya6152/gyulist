"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { statusOptions } from "@/features/cattle/constants";
import { getGrowthStage } from "@/lib/utils";
import classNames from "classnames";
import { clsx } from "clsx";
import { Filter, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type { FilterFormData } from "../../constants";

interface FilterDialogProps {
	initialGrowthStage: string[];
	initialGender: string[];
	initialStatus: string[];
	initialHasAlert: string;
	onSubmit: (data: FilterFormData) => void;
	onClear: () => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function FilterDialog({
	initialGrowthStage,
	initialGender,
	initialStatus,
	initialHasAlert,
	onSubmit,
	onClear,
	open,
	onOpenChange
}: FilterDialogProps) {
	const [growthStage, setGrowthStage] = useState<string[]>(initialGrowthStage);
	const [gender, setGender] = useState<string[]>(initialGender);
	const [status, setStatus] = useState<string[]>(initialStatus);
	const [hasAlert, setHasAlert] = useState<"all" | "true" | "false">(
		initialHasAlert as "all" | "true" | "false"
	);

	const growthStageOptions = [
		{ value: "CALF", label: "繁殖・哺乳期" },
		{ value: "GROWING", label: "育成期" },
		{ value: "FATTENING", label: "肥育期" },
		{ value: "FIRST_CALVED", label: "初産牛" },
		{ value: "MULTI_PAROUS", label: "経産牛" }
	];

	const genderOptions = [
		{ value: "雄", label: "雄" },
		{ value: "去勢", label: "去勢" },
		{ value: "雌", label: "雌" }
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
		onOpenChange(false);
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5 text-primary" />
						フィルター設定
						{activeFilterCount > 0 && (
							<Badge variant="secondary" className="ml-2">
								{activeFilterCount}件
							</Badge>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* 現在のフィルター状態表示 */}
					{hasActiveFilters && (
						<div className="p-4 bg-muted/30 rounded-lg border">
							<div className="flex items-center gap-2 mb-3">
								<span className="text-sm font-medium text-foreground">
									現在の絞り込み条件
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClear}
									className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
								>
									<RotateCcw className="h-3 w-3 mr-1" />
									クリア
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{growthStage.map((stage) => (
									<Badge
										key={`growth-${stage}`}
										variant="default"
										className="text-xs transition-all duration-200 hover:shadow-sm"
									>
										{getGrowthStage(stage as import("@repo/api").GrowthStage)}
									</Badge>
								))}
								{gender.map((g) => (
									<Badge
										key={`gender-${g}`}
										variant="outline"
										className="text-xs transition-all duration-200 hover:shadow-sm"
									>
										<span
											className={clsx(
												"text-sm font-medium",
												g === "雄" && "text-blue-500",
												g === "去勢" && "text-gray-500",
												g === "雌" && "text-red-500"
											)}
										>
											{g}
										</span>
									</Badge>
								))}
								{status.map((s) => (
									<Badge
										key={`status-${s}`}
										variant="outline"
										className={classNames(
											"text-xs transition-all duration-200 hover:shadow-sm",
											{
												"border-blue-500 text-blue-500": s === "HEALTHY",
												"border-yellow-500 text-yellow-500": s === "PREGNANT",
												"border-green-500 text-green-500": s === "RESTING",
												"border-red-500 text-red-500": s === "TREATING",
												"border-orange-500 text-orange-500":
													s === "SCHEDULED_FOR_SHIPMENT",
												"border-gray-500 text-gray-500": s === "SHIPPED",
												"border-red-600 text-red-600": s === "DEAD"
											}
										)}
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

					{/* フィルターオプション */}
					<div className="grid grid-cols-2 gap-6">
						{/* 成長段階 */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span className="w-2 h-2 bg-blue-500 rounded-full" />
								成長段階
							</Label>
							<div className="space-y-2">
								{growthStageOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-3 group"
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
											className="text-sm font-normal cursor-pointer group-hover:text-blue-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</div>
						</div>

						{/* 性別 */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span className="w-2 h-2 bg-green-500 rounded-full" />
								性別
							</Label>
							<div className="space-y-2">
								{genderOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-3 group"
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
											className="text-sm font-normal cursor-pointer group-hover:text-green-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</div>
						</div>

						{/* ステータス */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span className="w-2 h-2 bg-orange-500 rounded-full" />
								ステータス
							</Label>
							<div className="space-y-2">
								{statusOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-3 group"
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
											className="text-sm font-normal cursor-pointer group-hover:text-orange-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
							</div>
						</div>

						{/* アラート */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold text-foreground flex items-center gap-2">
								<span className="w-2 h-2 bg-red-500 rounded-full" />
								アラート
							</Label>
							<RadioGroup
								value={hasAlert}
								onValueChange={(value) =>
									setHasAlert(value as "all" | "true" | "false")
								}
								className="space-y-2"
							>
								{hasAlertOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-3 group"
									>
										<RadioGroupItem
											value={option.value}
											id={`alert-${option.value}`}
											className="text-red-500 border-muted-foreground/30"
										/>
										<Label
											htmlFor={`alert-${option.value}`}
											className="text-sm font-normal cursor-pointer group-hover:text-red-600 transition-colors"
										>
											{option.label}
										</Label>
									</div>
								))}
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
						フィルター適用
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
