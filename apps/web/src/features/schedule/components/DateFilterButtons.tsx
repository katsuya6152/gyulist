"use client";

import { Button } from "@/components/ui/button";
import { memo } from "react";
import { type DateFilter, type Event, FILTER_BUTTONS } from "../constants";
import { formatFilterDate } from "../utils";

interface DateFilterButtonsProps {
	currentFilter: DateFilter;
	currentEvents: Event[];
	onFilterClick: (filter: DateFilter) => void;
}

export const DateFilterButtons = memo(
	({ currentFilter, currentEvents, onFilterClick }: DateFilterButtonsProps) => (
		<div className="mb-6 animate-fade-in-up">
			<fieldset className="grid grid-cols-4 gap-2 border-0 p-0 m-0">
				<legend className="sr-only">日付フィルター</legend>
				{FILTER_BUTTONS.map((button, index) => {
					const date = button.getDate();

					return (
						<Button
							key={button.key}
							variant={currentFilter === button.key ? "default" : "outline"}
							onClick={() => onFilterClick(button.key)}
							className="h-auto py-3 px-2 flex flex-col items-center gap-1 tap-feedback hover:scale-105 transition-all duration-200 animate-fade-in"
							style={{ animationDelay: `${index * 0.1}s` }}
							aria-pressed={currentFilter === button.key}
							aria-label={`${button.label}のイベントを表示${date ? ` (${formatFilterDate(date)})` : ""}`}
						>
							<span className="text-xs font-medium">{button.label}</span>
							{date && (
								<span className="text-xs opacity-75" aria-hidden="true">
									{formatFilterDate(date)}
								</span>
							)}
						</Button>
					);
				})}
			</fieldset>
			{currentFilter !== "custom" && (
				<output
					className="text-xs text-gray-500 mt-2 block animate-fade-in"
					aria-live="polite"
				>
					{`${currentEvents.length}件のイベントが見つかりました`}
				</output>
			)}
		</div>
	),
);

DateFilterButtons.displayName = "DateFilterButtons";
