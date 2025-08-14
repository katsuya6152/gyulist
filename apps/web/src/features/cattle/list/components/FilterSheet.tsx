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
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@/components/ui/popover";
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
	onSubmit: (data: FilterFormData) => void;
	onClear: () => void;
}

export const FilterSheet = memo(
	({
		initialGrowthStage,
		initialGender,
		initialStatus,
		onSubmit,
		onClear
	}: FilterSheetProps) => {
		const [growthStageOpen, setGrowthStageOpen] = useState(false);
		const [genderOpen, setGenderOpen] = useState(false);
		const [statusOpen, setStatusOpen] = useState(false);

		const form = useForm<FilterFormData>({
			resolver: zodResolver(FormSchema),
			defaultValues: {
				growth_stage: initialGrowthStage,
				gender: initialGender,
				status: initialStatus
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
				status: []
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
					<Button variant="ghost" className="">
						<Filter />
						絞り込み
					</Button>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>絞り込み</SheetTitle>
						<SheetDescription className="text-left">
							絞り込みたい項目を選択してください
						</SheetDescription>
					</SheetHeader>
					<div className="p-4">
						<Form {...form}>
							<form
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
																	(item) => !["オス", "メス"].includes(item.id)
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
																	["オス", "メス"].includes(item.id)
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
								</div>

								<div className="flex gap-2">
									<SheetClose asChild>
										<Button type="submit" className="flex-1 h-12 text-base">
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
							</form>
						</Form>
					</div>
				</SheetContent>
			</Sheet>
		);
	}
);

FilterSheet.displayName = "FilterSheet";
