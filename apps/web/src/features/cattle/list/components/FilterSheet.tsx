"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { GENDERS, type Gender } from "@repo/api";
import classNames from "classnames";
import { Check, ChevronsUpDown, Filter, X } from "lucide-react";
import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import {
	type FilterFormData,
	FormSchema,
	filterOptions,
	statusOptions
} from "../constants";

interface FilterSheetProps {
	initialGrowthStage: string[];
	initialGender: string[];
	initialStatus: string[];
	initialHasAlert?: string;
	onSubmit: (data: FilterFormData) => void;
	onClear: () => void;
}

export const FilterSheet = memo(
	({
		initialGrowthStage,
		initialGender,
		initialStatus,
		initialHasAlert,
		onSubmit,
		onClear
	}: FilterSheetProps) => {
		const [growthStageOpen, setGrowthStageOpen] = useState(false);
		const [genderOpen, setGenderOpen] = useState(false);
		const [statusOpen, setStatusOpen] = useState(false);

		// 選択されている絞り込み条件の総数を計算
		const getTotalFilterCount = () => {
			const growthStageCount = form.watch("growth_stage").length;
			const genderCount = form.watch("gender").length;
			const statusCount = form.watch("status").length;
			const hasAlertCount =
				form.watch("has_alert") && form.watch("has_alert") !== "all" ? 1 : 0;
			return growthStageCount + genderCount + statusCount + hasAlertCount;
		};

		const form = useForm<FilterFormData>({
			resolver: zodResolver(FormSchema),
			defaultValues: {
				growth_stage: initialGrowthStage,
				gender: initialGender,
				status: initialStatus,
				has_alert: (initialHasAlert || "all") as "all" | "true" | "false"
			}
		});

		const addGrowthStage = (stage: string) => {
			const currentValues = form.getValues("growth_stage");
			if (!currentValues.includes(stage)) {
				form.setValue("growth_stage", [...currentValues, stage]);
			}
		};

		const removeGrowthStage = (stage: string) => {
			const currentValues = form.getValues("growth_stage");
			form.setValue(
				"growth_stage",
				currentValues.filter((s) => s !== stage)
			);
		};

		const addGender = (gender: string) => {
			const currentValues = form.getValues("gender");
			if (!currentValues.includes(gender)) {
				form.setValue("gender", [...currentValues, gender]);
			}
		};

		const removeGender = (gender: string) => {
			const currentValues = form.getValues("gender");
			form.setValue(
				"gender",
				currentValues.filter((g) => g !== gender)
			);
		};

		const addStatus = (status: string) => {
			const currentValues = form.getValues("status");
			if (!currentValues.includes(status)) {
				form.setValue("status", [...currentValues, status]);
			}
		};

		const removeStatus = (status: string) => {
			const currentValues = form.getValues("status");
			form.setValue(
				"status",
				currentValues.filter((s) => s !== status)
			);
		};

		const handleClear = () => {
			form.reset({
				growth_stage: [],
				gender: [],
				status: [],
				has_alert: "all"
			});
			onClear();
		};

		const getSelectedGrowthStages = () => {
			const selected = form.watch("growth_stage");
			if (selected.length === 0) return "成長段階を選択";
			if (selected.length === 1) {
				const option = filterOptions.find((opt) => opt.id === selected[0]);
				return option?.label || selected[0];
			}
			return `${selected.length}個選択中`;
		};

		const getSelectedGenders = () => {
			const selected = form.watch("gender");
			if (selected.length === 0) return "性別を選択";
			if (selected.length === 1) {
				const option = filterOptions.find((opt) => opt.id === selected[0]);
				return option?.label || selected[0];
			}
			return `${selected.length}個選択中`;
		};

		const getSelectedStatuses = () => {
			const selected = form.watch("status");
			if (selected.length === 0) return "ステータスを選択";
			if (selected.length === 1) {
				const option = statusOptions.find((opt) => opt.value === selected[0]);
				return option?.label || selected[0];
			}
			return `${selected.length}個選択中`;
		};

		return (
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="ghost" className="relative">
						<Filter />
						絞り込み
						{getTotalFilterCount() > 0 && (
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
								{getTotalFilterCount()}
							</div>
						)}
					</Button>
				</SheetTrigger>
				<SheetContent className="flex flex-col h-full">
					<SheetHeader>
						<SheetTitle>絞り込み</SheetTitle>
						<SheetDescription className="text-left">
							絞り込みたい項目を選択してください
						</SheetDescription>
					</SheetHeader>
					<div className="flex-1 overflow-y-auto p-4">
						<Form {...form}>
							<form
								id="cattle-filter-form"
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<div className="space-y-4">
									<div className="space-y-3">
										<h3 className="font-medium text-lg">成長段階</h3>
										<Popover
											open={growthStageOpen}
											onOpenChange={setGrowthStageOpen}
										>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													aria-expanded={growthStageOpen}
													className="w-full justify-between"
												>
													{getSelectedGrowthStages()}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-full p-0">
												<Command>
													<CommandInput placeholder="成長段階を検索..." />
													<CommandList>
														<CommandEmpty>
															該当する成長段階が見つかりません。
														</CommandEmpty>
														<CommandGroup>
															{filterOptions
																.filter(
																	(item) => !GENDERS.includes(item.id as Gender)
																)
																.map((item) => {
																	const isSelected = form
																		.watch("growth_stage")
																		.includes(item.id);
																	return (
																		<CommandItem
																			key={item.id}
																			value={item.id}
																			onSelect={() => {
																				if (isSelected) {
																					removeGrowthStage(item.id);
																				} else {
																					addGrowthStage(item.id);
																				}
																			}}
																		>
																			<Check
																				className={classNames(
																					"mr-2 h-4 w-4",
																					isSelected
																						? "opacity-100"
																						: "opacity-0"
																				)}
																			/>
																			{item.label}
																		</CommandItem>
																	);
																})}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>

										{form.watch("growth_stage").length > 0 && (
											<div className="flex flex-wrap gap-2">
												{form.watch("growth_stage").map((stage) => {
													const option = filterOptions.find(
														(opt) => opt.id === stage
													);
													return (
														<Badge
															key={stage}
															variant="secondary"
															className="text-sm"
														>
															{option?.label}
															<button
																type="button"
																onClick={() => removeGrowthStage(stage)}
																className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
															>
																<X className="h-3 w-3" />
															</button>
														</Badge>
													);
												})}
											</div>
										)}
									</div>

									<div className="space-y-3">
										<h3 className="font-medium text-lg">性別</h3>
										<Popover open={genderOpen} onOpenChange={setGenderOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													aria-expanded={genderOpen}
													className="w-full justify-between"
												>
													{getSelectedGenders()}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-full p-0">
												<Command>
													<CommandInput placeholder="性別を検索..." />
													<CommandList>
														<CommandEmpty>
															該当する性別が見つかりません。
														</CommandEmpty>
														<CommandGroup>
															{filterOptions
																.filter((item) =>
																	GENDERS.includes(item.id as Gender)
																)
																.map((item) => {
																	const isSelected = form
																		.watch("gender")
																		.includes(item.id);
																	return (
																		<CommandItem
																			key={item.id}
																			value={item.id}
																			onSelect={() => {
																				if (isSelected) {
																					removeGender(item.id);
																				} else {
																					addGender(item.id);
																				}
																			}}
																		>
																			<Check
																				className={classNames(
																					"mr-2 h-4 w-4",
																					isSelected
																						? "opacity-100"
																						: "opacity-0"
																				)}
																			/>
																			{item.label}
																		</CommandItem>
																	);
																})}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>

										{form.watch("gender").length > 0 && (
											<div className="flex flex-wrap gap-2">
												{form.watch("gender").map((gender) => {
													const option = filterOptions.find(
														(opt) => opt.id === gender
													);
													return (
														<Badge
															key={gender}
															variant="secondary"
															className="text-sm"
														>
															{option?.label}
															<button
																type="button"
																onClick={() => removeGender(gender)}
																className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
															>
																<X className="h-3 w-3" />
															</button>
														</Badge>
													);
												})}
											</div>
										)}
									</div>

									<div className="space-y-3">
										<h3 className="font-medium text-lg">ステータス</h3>
										<Popover open={statusOpen} onOpenChange={setStatusOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													aria-expanded={statusOpen}
													className="w-full justify-between"
												>
													{getSelectedStatuses()}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-full p-0">
												<Command>
													<CommandInput placeholder="ステータスを検索..." />
													<CommandList>
														<CommandEmpty>
															該当するステータスが見つかりません。
														</CommandEmpty>
														<CommandGroup>
															{statusOptions.map((item) => {
																const isSelected = form
																	.watch("status")
																	.includes(item.value);
																return (
																	<CommandItem
																		key={item.value}
																		value={item.value}
																		onSelect={() => {
																			if (isSelected) {
																				removeStatus(item.value);
																			} else {
																				addStatus(item.value);
																			}
																		}}
																	>
																		<Check
																			className={classNames(
																				"mr-2 h-4 w-4",
																				isSelected ? "opacity-100" : "opacity-0"
																			)}
																		/>
																		{item.label}
																	</CommandItem>
																);
															})}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>

										{form.watch("status").length > 0 && (
											<div className="flex flex-wrap gap-2">
												{form.watch("status").map((status) => {
													const option = statusOptions.find(
														(opt) => opt.value === status
													);
													return (
														<Badge
															key={status}
															variant="secondary"
															className="text-sm"
														>
															{option?.label}
															<button
																type="button"
																onClick={() => removeStatus(status)}
																className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
															>
																<X className="h-3 w-3" />
															</button>
														</Badge>
													);
												})}
											</div>
										)}
									</div>

									<div className="space-y-3">
										<h3 className="font-medium text-lg">アラートの有無</h3>
										<RadioGroup
											value={form.watch("has_alert") || "all"}
											onValueChange={(value) => {
												form.setValue(
													"has_alert",
													value as "all" | "true" | "false"
												);
											}}
											className="space-y-2"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="all" id="alert-all" />
												<Label htmlFor="alert-all">すべて</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="true" id="alert-true" />
												<Label htmlFor="alert-true">アラートあり</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="false" id="alert-false" />
												<Label htmlFor="alert-false">アラートなし</Label>
											</div>
										</RadioGroup>
									</div>
								</div>
							</form>
						</Form>
					</div>

					{/* 固定フッター */}
					<div className="flex-shrink-0 p-4 bg-background border-t">
						<div className="flex gap-2">
							<SheetClose asChild>
								<Button
									type="submit"
									form="cattle-filter-form"
									className="flex-1 h-12 text-base"
								>
									絞り込む
								</Button>
							</SheetClose>
							<Button
								type="button"
								variant="outline"
								className="flex-1 h-12 text-base"
								onClick={handleClear}
							>
								クリア
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		);
	}
);

FilterSheet.displayName = "FilterSheet";
