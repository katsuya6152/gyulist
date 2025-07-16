"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
	ChevronRight,
	Filter,
	Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
											className="flex items-center space-x-2"
										>
											<RadioGroupItem value={option.id} id={option.id} />
											<Label htmlFor={option.id}>{option.label}</Label>
										</div>
									))}
								</RadioGroup>

								<div className="flex justify-center w-full gap-2">
									<Button
										variant="outline"
										onClick={() =>
											handleSort(searchParams.get("sort_by") || "id", "asc")
										}
									>
										<ArrowDown01 />
										昇順
									</Button>
									<Button
										variant="outline"
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
										className="space-y-8"
									>
										<div className="space-y-4">
											<h3 className="font-medium">成長段階</h3>
											<FormField
												control={form.control}
												name="growth_stage"
												render={() => (
													<FormItem>
														{filterOptions
															.filter(
																(item) => !["オス", "メス"].includes(item.id),
															)
															.map((item) => (
																<FormField
																	key={item.id}
																	control={form.control}
																	name="growth_stage"
																	render={({ field }) => (
																		<FormItem
																			key={item.id}
																			className="flex flex-row items-start space-x-3 space-y-0"
																		>
																			<FormControl>
																				<Checkbox
																					checked={field.value?.includes(
																						item.id,
																					)}
																					onCheckedChange={(checked) => {
																						return checked
																							? field.onChange([
																									...field.value,
																									item.id,
																								])
																							: field.onChange(
																									field.value?.filter(
																										(value) =>
																											value !== item.id,
																									),
																								);
																					}}
																				/>
																			</FormControl>
																			<FormLabel className="text-sm font-normal">
																				{item.label}
																			</FormLabel>
																		</FormItem>
																	)}
																/>
															))}
														<FormMessage />
													</FormItem>
												)}
											/>

											<h3 className="font-medium">性別</h3>
											<FormField
												control={form.control}
												name="gender"
												render={() => (
													<FormItem>
														{filterOptions
															.filter((item) =>
																["オス", "メス"].includes(item.id),
															)
															.map((item) => (
																<FormField
																	key={item.id}
																	control={form.control}
																	name="gender"
																	render={({ field }) => (
																		<FormItem
																			key={item.id}
																			className="flex flex-row items-start space-x-3 space-y-0"
																		>
																			<FormControl>
																				<Checkbox
																					checked={field.value?.includes(
																						item.id,
																					)}
																					onCheckedChange={(checked) => {
																						return checked
																							? field.onChange([
																									...field.value,
																									item.id,
																								])
																							: field.onChange(
																									field.value?.filter(
																										(value) =>
																											value !== item.id,
																									),
																								);
																					}}
																				/>
																			</FormControl>
																			<FormLabel className="text-sm font-normal">
																				{item.label}
																			</FormLabel>
																		</FormItem>
																	)}
																/>
															))}
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="flex gap-2">
											<SheetClose asChild>
												<Button type="submit">絞り込む</Button>
											</SheetClose>
											<Button
												type="button"
												variant="outline"
												onClick={() => {
													form.reset({
														growth_stage: [],
														gender: [],
													});
													const params = new URLSearchParams(
														searchParams.toString(),
													);
													params.delete("growth_stage");
													params.delete("gender");
													router.push(`/cattle?${params.toString()}`);
												}}
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
									<div>日齢：{cattle.daysOld}</div>
									<Separator orientation="vertical" />
									<div>体重：{cattle.weight ? `${cattle.weight}kg` : "-"}</div>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="text-green-600"
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
