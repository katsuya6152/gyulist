import { formatEventTime } from "@/components/event/event-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventTypeColors } from "@/constants/events";
import { EVENT_TYPE_LABELS } from "@repo/api";
import { Calendar } from "lucide-react";
import type { TodayEvent } from "../types";

interface TodayEventsCardProps {
	todayEvents: TodayEvent[];
	error?: string;
}

export function TodayEventsCard({ todayEvents, error }: TodayEventsCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-lg font-semibold flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					今日のイベント
				</CardTitle>
				<span className="text-sm text-muted-foreground">
					{todayEvents.length}件
				</span>
			</CardHeader>
			<CardContent>
				{error ? (
					<p className="text-sm text-red-600">{error}</p>
				) : todayEvents.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						本日の予定はありません
					</p>
				) : (
					<div className="h-[124px] overflow-y-auto pr-1">
						<ul className="space-y-2">
							{todayEvents.map((e) => (
								<li
									key={e.eventId}
									className="h-7 flex items-center justify-between"
								>
									<div className="flex items-center gap-3 min-w-0">
										<span className="text-xs font-medium text-muted-foreground w-12">
											{formatEventTime(e.eventDatetime)}
										</span>
										<span className="text-xs truncate">
											{e.cattleName}（{e.cattleEarTagNumber}）
										</span>
										<span
											className={`text-[10px] px-1.5 py-0.5 rounded border ${eventTypeColors[e.eventType] || eventTypeColors.OTHER}`}
										>
											{EVENT_TYPE_LABELS[
												e.eventType as keyof typeof EVENT_TYPE_LABELS
											] || e.eventType}
										</span>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
