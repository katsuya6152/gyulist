"use client";

import { Button } from "@/components/ui/button";
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
	SheetTrigger
} from "@/components/ui/sheet";
import { ArrowDown01, ArrowDown10, ArrowDownUp } from "lucide-react";
import { memo } from "react";
import { sortOptions } from "../constants";

interface SortSheetProps {
	currentSortBy: string;
	currentSortOrder: string;
	onSort: (sortBy: string, sortOrder: string) => void;
}

export const SortSheet = memo(
	({ currentSortBy, currentSortOrder, onSort }: SortSheetProps) => {
		return (
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
							defaultValue={currentSortBy || "id"}
							onValueChange={(value) =>
								onSort(value, currentSortOrder || "desc")
							}
						>
							{sortOptions.map((option) => (
								<div
									key={option.id}
									className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors w-full text-left"
									onClick={() => onSort(option.id, currentSortOrder || "desc")}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onSort(option.id, currentSortOrder || "desc");
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
								variant={currentSortOrder === "asc" ? "default" : "outline"}
								className="flex-1 text-base"
								onClick={() => onSort(currentSortBy || "id", "asc")}
							>
								<ArrowDown01 />
								昇順
							</Button>
							<Button
								variant={currentSortOrder === "desc" ? "default" : "outline"}
								className="flex-1 text-base"
								onClick={() => onSort(currentSortBy || "id", "desc")}
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
		);
	}
);

SortSheet.displayName = "SortSheet";
