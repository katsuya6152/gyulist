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
import type { GetCattleListResType } from "@/services/cattleService";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import {
	ArrowDown01,
	ArrowDown10,
	ArrowDownUp,
	ChevronRight,
	Filter,
	Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
		id: "male",
		label: "オス",
	},
	{
		id: "female",
		label: "メス",
	},
] as const;

const FormSchema = z.object({
	items: z.array(z.string()),
});

export const getGrowthStage = (
	growthStage:
		| "CALF"
		| "GROWING"
		| "FATTENING"
		| "FIRST_CALVED"
		| "MULTI_PAROUS"
		| null,
) => {
	switch (growthStage) {
		case "CALF":
			return "仔牛";
		case "GROWING":
			return "育成牛";
		case "FATTENING":
			return "肥育牛";
		case "FIRST_CALVED":
			return "初産牛";
		case "MULTI_PAROUS":
			return "経産牛";
		default:
			return "不明";
	}
};

export function CattleListPresentation({
	cattleList,
}: { cattleList: GetCattleListResType }) {
	const router = useRouter();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			items: [],
		},
	});

	const onSubmit = (data: z.infer<typeof FormSchema>) => {
		console.log("submit:", data);
	};

	const handleItemClick = (cattleId: number) => {
		router.push(`/cattle/${cattleId}`);
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
								<RadioGroup defaultValue="option-0">
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="option-0" id="option-0" />
										<Label htmlFor="option-0">全て表示</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="option-1" id="option-1" />
										<Label htmlFor="option-1">名前</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="option-2" id="option-2" />
										<Label htmlFor="option-2">ID</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="option-3" id="option-3" />
										<Label htmlFor="option-3">日齢</Label>
									</div>
								</RadioGroup>

								<div className="flex justify-center w-full gap-2">
									<Button variant="outline">
										<ArrowDown01 />
										昇順
									</Button>
									<Button variant="outline">
										<ArrowDown10 />
										降順
									</Button>
								</div>
							</div>

							<SheetFooter>
								<SheetClose asChild>
									<Button type="submit">並び替える</Button>
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
										<FormField
											control={form.control}
											name="items"
											render={() => (
												<FormItem>
													{filterOptions.map((item) => (
														<FormField
															key={item.id}
															control={form.control}
															name="items"
															render={({ field }) => {
																return (
																	<FormItem
																		key={item.id}
																		className="flex flex-row items-start space-x-3 space-y-0"
																	>
																		<FormControl>
																			<Checkbox
																				checked={field.value?.includes(item.id)}
																				onCheckedChange={(checked) => {
																					return checked
																						? field.onChange([
																								...field.value,
																								item.id,
																							])
																						: field.onChange(
																								field.value?.filter(
																									(value) => value !== item.id,
																								),
																							);
																				}}
																			/>
																		</FormControl>
																		<FormLabel className="text-sm font-normal">
																			{item.label}
																		</FormLabel>
																	</FormItem>
																);
															}}
														/>
													))}
													<FormMessage />
												</FormItem>
											)}
										/>
										<SheetClose asChild>
											<Button type="submit">絞り込む</Button>
										</SheetClose>
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
								</div>
								<div className="flex items-center h-3 gap-2 text-xs">
									<div>耳標番号：{cattle.earTagNumber}</div>
									<Separator orientation="vertical" />
									<div>日齢：{cattle.daysOld}</div>
									<Separator orientation="vertical" />
									<div>
										ステータス：
										<span
											className={classNames("font-semibold", {
												"text-blue-500": cattle.healthStatus === "健康",
												"text-yellow-500": cattle.healthStatus === "妊娠中",
												"text-green-500": cattle.healthStatus === "休息中",
												"text-red-500": cattle.healthStatus === "治療中",
											})}
										>
											{cattle.healthStatus}
										</span>
									</div>
								</div>
							</div>
							<ChevronRight />
						</div>
						<Separator />
					</div>
				))}
			</div>
		</div>
	);
}
