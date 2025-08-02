"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SearchEventsResType } from "@/services/eventService";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DateFilter } from "./actions";

type Event = SearchEventsResType["results"][0];

interface SchedulePresentationProps {
	events: Event[];
	currentFilter: DateFilter;
	error?: string;
}

// イベントタイプの日本語マッピング
const eventTypeLabels: Record<string, string> = {
	ESTRUS: "発情",
	INSEMINATION: "人工授精",
	CALVING: "分娩",
	VACCINATION: "ワクチン接種",
	SHIPMENT: "出荷",
	HOOF_TRIMMING: "削蹄",
	OTHER: "その他",
};

// イベントタイプの色マッピング
const eventTypeColors: Record<string, string> = {
	ESTRUS: "bg-pink-100 text-pink-800 border-pink-300",
	INSEMINATION: "bg-blue-100 text-blue-800 border-blue-300",
	CALVING: "bg-green-100 text-green-800 border-green-300",
	VACCINATION: "bg-purple-100 text-purple-800 border-purple-300",
	SHIPMENT: "bg-orange-100 text-orange-800 border-orange-300",
	HOOF_TRIMMING: "bg-yellow-100 text-yellow-800 border-yellow-300",
	OTHER: "bg-gray-100 text-gray-800 border-gray-300",
};

export function SchedulePresentation({
	events,
	currentFilter,
	error,
}: SchedulePresentationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// フィルターボタンの定義
	const filterButtons = [
		{ key: "today" as const, label: "今日", getDate: () => new Date() },
		{
			key: "tomorrow" as const,
			label: "明日",
			getDate: () => addDays(new Date(), 1),
		},
		{
			key: "dayAfterTomorrow" as const,
			label: "明後日",
			getDate: () => addDays(new Date(), 2),
		},
		{ key: "all" as const, label: "全て", getDate: () => null },
	];

	// フィルターボタンのクリックハンドラー
	const handleFilterClick = (filter: DateFilter) => {
		const params = new URLSearchParams(searchParams);
		if (filter === "all") {
			params.delete("filter");
		} else {
			params.set("filter", filter);
		}
		router.push(`/schedule?${params.toString()}`);
	};

	// イベントを日付順（新しい順）にソート
	const sortedEvents = [...events].sort((a, b) => {
		return (
			new Date(b.eventDatetime).getTime() - new Date(a.eventDatetime).getTime()
		);
	});

	const formatEventDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return format(date, "yyyy年MM月dd日", { locale: ja });
		} catch {
			return dateString;
		}
	};

	const formatEventTime = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return format(date, "HH:mm", { locale: ja });
		} catch {
			return "";
		}
	};

	// フィルター用の日付フォーマット
	const formatFilterDate = (date: Date) => {
		return format(date, "MM/dd", { locale: ja });
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Calendar className="h-6 w-6" />
					予定
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					イベントの履歴を日付の新しい順に表示しています
				</p>
			</div>

			{/* エラー表示 */}
			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}

			{/* 日付フィルターボタン */}
			<div className="mb-6">
				<div className="grid grid-cols-4 gap-2">
					{filterButtons.map((button) => {
						const date = button.getDate();

						return (
							<Button
								key={button.key}
								variant={currentFilter === button.key ? "default" : "outline"}
								onClick={() => handleFilterClick(button.key)}
								className="h-auto py-3 px-2 flex flex-col items-center gap-1"
							>
								<span className="text-xs font-medium">{button.label}</span>
								{date && (
									<span className="text-xs opacity-75">
										{formatFilterDate(date)}
									</span>
								)}
							</Button>
						);
					})}
				</div>
				{currentFilter !== "all" && (
					<p className="text-xs text-gray-500 mt-2">
						{sortedEvents.length}件のイベントが見つかりました
					</p>
				)}
			</div>

			<div className="space-y-4">
				{sortedEvents.length === 0 ? (
					<Card>
						<CardContent className="py-8">
							<div className="text-center text-gray-500">
								<Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
								<p>
									{currentFilter === "all"
										? "イベントが登録されていません"
										: "該当する日付のイベントがありません"}
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					sortedEvents.map((event) => (
						<Card
							key={event.eventId}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader>
								<CardTitle className="flex flex-col gap-2">
									<div className="flex items-center gap-3">
										<Badge
											variant="outline"
											className={
												eventTypeColors[event.eventType] ||
												eventTypeColors.OTHER
											}
										>
											{eventTypeLabels[event.eventType] || event.eventType}
										</Badge>
										<span className="text-lg font-medium">
											{event.cattleName}
										</span>
										{event.cattleEarTagNumber && (
											<span className="text-sm text-gray-500">
												({event.cattleEarTagNumber})
											</span>
										)}
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<Calendar className="h-4 w-4" />
										{formatEventDate(event.eventDatetime)}
										<Clock className="h-4 w-4 ml-2" />
										{formatEventTime(event.eventDatetime)}
									</div>
								</CardTitle>
							</CardHeader>
							{event.notes && (
								<>
									<Separator />
									<CardContent>
										<div className="text-sm text-gray-700">
											<span className="font-medium">メモ:</span>
											<p className="mt-1 whitespace-pre-wrap">{event.notes}</p>
										</div>
									</CardContent>
								</>
							)}
						</Card>
					))
				)}
			</div>
		</div>
	);
}
