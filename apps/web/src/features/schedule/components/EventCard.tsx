"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Edit, MoreHorizontal, Trash } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { type Event, eventTypeColors, eventTypeLabels } from "../constants";
import { formatEventDate, formatEventTime } from "../utils";

interface EventCardProps {
	event: Event;
	onEdit: (event: Event) => void;
	onDelete: (event: Event) => void;
}

// イベントカードコンポーネントをメモ化
export const EventCard = memo(({ event, onEdit, onDelete }: EventCardProps) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const handleEdit = useCallback(() => {
		setIsDropdownOpen(false);
		setTimeout(() => {
			onEdit(event);
		}, 100);
	}, [event, onEdit]);

	const handleDelete = useCallback(() => {
		setIsDropdownOpen(false);
		setTimeout(() => {
			onDelete(event);
		}, 100);
	}, [event, onDelete]);

	return (
		<Card
			key={event.eventId}
			data-testid="event-item"
			className="hover:shadow-lg transition-all duration-200 relative hover-lift"
		>
			{/* アクションメニュー */}
			<div className="absolute top-2 right-2">
				<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 tap-feedback hover:scale-110 transition-all duration-200"
						>
							<MoreHorizontal className="h-4 w-4 transition-transform duration-200" />
							<span className="sr-only">メニューを開く</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						side="bottom"
						sideOffset={5}
						className="animate-scale-in"
					>
						<DropdownMenuItem
							onClick={handleEdit}
							className="transition-colors duration-200"
						>
							<Edit className="h-4 w-4 mr-2" />
							編集
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleDelete}
							className="text-red-600 focus:text-red-600 transition-colors duration-200"
						>
							<Trash className="h-4 w-4 mr-2" />
							削除
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<CardHeader>
				<CardTitle className="flex flex-col gap-2">
					<div className="flex items-center gap-3 flex-wrap">
						<Badge
							variant="outline"
							className={`transition-all duration-200 hover:shadow-sm ${
								eventTypeColors[event.eventType] || eventTypeColors.OTHER
							}`}
						>
							{eventTypeLabels[event.eventType] || event.eventType}
						</Badge>
						<span className="text-lg font-medium transition-colors duration-200">
							{event.cattleName}
						</span>
						{event.cattleEarTagNumber && (
							<span className="text-sm text-gray-500 transition-colors duration-200">
								({event.cattleEarTagNumber})
							</span>
						)}
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4 transition-transform duration-200" />
						{formatEventDate(event.eventDatetime)}
						<Clock className="h-4 w-4 ml-2 transition-transform duration-200" />
						{formatEventTime(event.eventDatetime)}
					</div>
				</CardTitle>
			</CardHeader>
			{event.notes && (
				<>
					<Separator />
					<CardContent>
						<div className="text-sm">
							<span className="font-medium">メモ:</span>
							<p className="mt-1 whitespace-pre-wrap">{event.notes}</p>
						</div>
					</CardContent>
				</>
			)}
		</Card>
	);
});

EventCard.displayName = "EventCard";
