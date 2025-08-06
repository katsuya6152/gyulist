"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { getGrowthStage } from "@/lib/utils";
import type { GetCattleListResType } from "@/services/cattleService";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import {
	ArrowDown01,
	ArrowDown10,
	ArrowDownUp,
	CalendarPlus,
	Check,
	ChevronRight,
	ChevronsUpDown,
	Filter,
	Search,
	X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const filterOptions = [
	{
		id: "CALF",
		label: "仔牛",
	},
	{
		id: "GROWING",
		label: "育成牛",
	},
	{
		id: "FATTENING",
		label: "肥育牛",
	},
	{
		id: "FIRST_CALVED",
		label: "初産牛",
	},
	{
		id: "MULTI_PAROUS",
		label: "経産牛",
	},
	{
		id: "オス",
		label: "オス",
	},
	{
		id: "メス",
		label: "メス",
	},
] as const;

const sortOptions = [
	{ id: "id", label: "ID" },
	{ id: "name", label: "名前" },
	{ id: "days_old", label: "日齢" },
] as const;

const FormSchema = z.object({
	growth_stage: z.array(z.string()),
	gender: z.array(z.string()),
});

export function CattleListPresentation({
	cattleList,
}: {
	cattleList: GetCattleListResType["results"];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [growthStageOpen, setGrowthStageOpen] = useState(false);
	const [genderOpen, setGenderOpen] = useState(false);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			growth_stage: searchParams.get("growth_stage")?.split(",") || [],
			gender: searchParams.get("gender")?.split(",") || [],
		},
	});

	const handleSearch = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set("search", value);
		} else {
			params.delete("search");
		}
		router.push(`/cattle?${params.toString()}`);
	};

	const handleSort = (sortBy: string, sortOrder: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("sort_by", sortBy);
		params.set("sort_order", sortOrder);
		router.push(`/cattle?${params.toString()}`);
	};

	const onSubmit = (data: z.infer<typeof FormSchema>) => {
		const params = new URLSearchParams(searchParams.toString());

		if (data.growth_stage.length > 0) {
			params.set("growth_stage", data.growth_stage.join(","));
		} else {
			params.delete("growth_stage");
		}

		if (data.gender.length > 0) {
			params.set("gender", data.gender.join(","));
		} else {
			params.delete("gender");
		}

		router.push(`/cattle?${params.toString()}`);
	};

	const handleItemClick = (cattleId: number) => {
		router.push(`/cattle/${cattleId}`);
	};

	const handleAddEvent = (cattleId: number) => {
		router.push(`/events/new/${cattleId}`);
	};

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
			currentValues.filter((s) => s !== stage),
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
			currentValues.filter((g) => g !== gender),
		);
	};

	const clearAllFilters = () => {
		form.reset({
			growth_stage: [],
			gender: [],
		});
		const params = new URLSearchParams(searchParams.toString());
		params.delete("growth_stage");
		params.delete("gender");
		router.push(`/cattle?${params.toString()}`);
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

	return (
		<div className="flex flex-col items-center">
			<div className="w-full py-6">
				<div className="relative flex w-full">
					<Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						type="search"
						placeholder="検索..."
						className="pl-10 mx-6 bg-gray-100 dark:bg-gray-800 border-none"
						defaultValue={searchParams.get("search") || ""}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>

				<div className="flex items-center justify-center h-5 mt-4">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" className="">
								<ArrowDownUp />
								並び替え
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>並び替え</SheetTitle>
								<SheetDescription className="text-left">
									並び替えたい項目と順序を選択してください
								</SheetDescription>
							</SheetHeader>

							<div className="flex flex-col gap-4 p-4 pb-12">
								<RadioGroup
									defaultValue={searchParams.get("sort_by") || "id"}
									onValueChange={(value) =>
										handleSort(value, searchParams.get("sort_order") || "desc")
									}
								>
									{sortOptions.map((option) => (
										<div
											key={option.id}
											className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors w-full text-left"
											onClick={() =>
												handleSort(
													option.id,
													searchParams.get("sort_order") || "desc",
												)
											}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													handleSort(
														option.id,
														searchParams.get("sort_order") || "desc",
													);
												}
											}}
											aria-label={`${option.label}で並び替え`}
										>
											<RadioGroupItem value={option.id} id={option.id} />
											<Label
												htmlFor={option.id}
												className="flex-1 cursor-pointer text-base"
											>
												{option.label}
											</Label>
										</div>
									))}
								</RadioGroup>

								<Separator />
								<div className="flex justify-center w-full gap-2">
									<Button
										variant={
											searchParams.get("sort_order") === "asc"
												? "default"
												: "outline"
										}
										className="flex-1 text-base"
										onClick={() =>
											handleSort(searchParams.get("sort_by") || "id", "asc")
										}
									>
										<ArrowDown01 />
										昇順
									</Button>
									<Button
										variant={
											searchParams.get("sort_order") === "desc"
												? "default"
												: "outline"
										}
										className="flex-1 text-base"
										onClick={() =>
											handleSort(searchParams.get("sort_by") || "id", "desc")
										}
									>
										<ArrowDown10 />
										降順
									</Button>
								</div>
							</div>

							<SheetFooter>
								<SheetClose asChild>
									<Button>閉じる</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>

					<Separator orientation="vertical" className="mx-5" />

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
																			(item) =>
																				!["オス", "メス"].includes(item.id),
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
																								: "opacity-0",
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
																(opt) => opt.id === stage,
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
																			["オス", "メス"].includes(item.id),
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
																								: "opacity-0",
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
																(opt) => opt.id === gender,
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
												onClick={clearAllFilters}
											>
												クリア
											</Button>
										</div>
									</form>
								</Form>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			<Separator />

			<div className="grid gap-4 w-full">
				{cattleList.map((cattle) => (
					<div key={cattle.cattleId}>
						<div
							className="w-full flex items-center justify-between p-3"
							onClick={() => handleItemClick(cattle.cattleId)}
							onKeyDown={() => handleItemClick(cattle.cattleId)}
						>
							<div className="flex flex-col gap-4">
								<div className="flex gap-2">
									<p className="font-bold">{cattle.name}</p>
									<Badge variant="outline">
										<span
											className={classNames("font-semibold", {
												"text-blue-500": cattle.gender === "オス",
												"text-red-500": cattle.gender === "メス",
											})}
										>
											{cattle.gender}
										</span>
									</Badge>
									<Badge variant="default">
										{getGrowthStage(cattle.growthStage)}
									</Badge>
									{cattle.healthStatus && (
										<Badge
											variant="outline"
											className={classNames({
												"border-blue-500 text-blue-500":
													cattle.healthStatus === "健康",
												"border-yellow-500 text-yellow-500":
													cattle.healthStatus === "妊娠中",
												"border-green-500 text-green-500":
													cattle.healthStatus === "休息中",
												"border-red-500 text-red-500":
													cattle.healthStatus === "治療中",
											})}
										>
											{cattle.healthStatus}
										</Badge>
									)}
								</div>
								<div className="flex items-center h-3 gap-2 text-xs">
									<div>耳標番号：{cattle.earTagNumber}</div>
									<Separator orientation="vertical" />
									<div>
										日齢：{cattle.daysOld ? `${cattle.daysOld}日` : "-"}
									</div>
									<Separator orientation="vertical" />
									<div>体重：{cattle.weight ? `${cattle.weight}kg` : "-"}</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="text-primary"
									onClick={(e) => {
										e.stopPropagation();
										handleAddEvent(cattle.cattleId);
									}}
								>
									<CalendarPlus />
								</Button>
								<ChevronRight />
							</div>
						</div>
						<Separator />
					</div>
				))}
			</div>
		</div>
	);
}
