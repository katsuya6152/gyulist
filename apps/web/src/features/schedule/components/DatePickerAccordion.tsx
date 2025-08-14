"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Search } from "lucide-react";
import { memo } from "react";

interface DatePickerAccordionProps {
	selectedDate: string;
	onDateChange: (date: string) => void;
	onSearchClick: () => void;
	onClearDate: () => void;
}

export const DatePickerAccordion = memo(
	({
		selectedDate,
		onDateChange,
		onSearchClick,
		onClearDate
	}: DatePickerAccordionProps) => (
		<div className="mb-6">
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem
					value="date-picker"
					className="border border-gray-200 rounded-lg border-b-0 last:border-b"
				>
					<AccordionTrigger className="px-4 py-3 hover:no-underline">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							<span className="text-sm font-medium">
								特定の日付のイベントを表示
							</span>
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-4 pb-4">
						<div className="space-y-3">
							<Label htmlFor="date-picker" className="text-sm">
								日付を選択してください
							</Label>
							<div className="flex gap-2 items-end flex-wrap">
								<div className="flex-1 min-w-[200px]">
									<Input
										id="date-picker"
										type="date"
										value={selectedDate}
										onChange={(e) => onDateChange(e.target.value)}
										className="w-full"
									/>
								</div>
								<Button
									onClick={onSearchClick}
									disabled={!selectedDate}
									className="flex items-center gap-2"
								>
									<Search className="h-4 w-4" />
									検索
								</Button>
								{selectedDate && (
									<Button variant="outline" onClick={onClearDate}>
										クリア
									</Button>
								)}
							</div>
							<p className="text-xs text-gray-500">
								日付を選択して「検索」ボタンをクリックすると、その日のイベントが表示されます
							</p>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	)
);

DatePickerAccordion.displayName = "DatePickerAccordion";
