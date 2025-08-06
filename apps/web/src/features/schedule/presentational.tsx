"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type {
	SearchEventsResType,
	UpdateEventInput,
} from "@/services/eventService";
import { addDays, format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import useEmblaCarousel from "embla-carousel-react";
import {
	Calendar,
	CalendarPlus,
	Clock,
	Edit,
	MoreHorizontal,
	Plus,
	Search,
	Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteEventAction, updateEventAction } from "./actions";
import { EventDeleteDialog } from "./components/EventDeleteDialog";
import { EventEditDialog } from "./components/EventEditDialog";

type Event = SearchEventsResType["results"][0];
type DateFilter = "all" | "today" | "tomorrow" | "dayAfterTomorrow" | "custom";

interface SchedulePresentationProps {
	events: Event[];
	currentFilter: DateFilter;
	customDate?: string;
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

// 日付フォーマット関数をメモ化
const formatEventDate = (dateString: string) => {
	return format(parseISO(dateString), "M月d日 (E)", { locale: ja });
};

const formatEventTime = (dateString: string) => {
	return format(parseISO(dateString), "HH:mm");
};

const formatFilterDate = (date: Date) => {
	return format(date, "M/d", { locale: ja });
};

// フィルターボタンの定義（静的）
const FILTER_BUTTONS = [
	{
		key: "today" as const,
		label: "今日",
		getDate: () => new Date(),
	},
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
	{
		key: "all" as const,
		label: "全て",
		getDate: () => null,
	},
];

// イベントカードコンポーネントをメモ化
const EventCard = memo(
	({
		event,
		onEdit,
		onDelete,
	}: {
		event: Event;
		onEdit: (event: Event) => void;
		onDelete: (event: Event) => void;
	}) => {
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
	},
);

EventCard.displayName = "EventCard";

// 空状態コンポーネント
const EmptyState = memo(({ currentFilter }: { currentFilter: DateFilter }) => (
	<Card>
		<CardContent className="py-12">
			<div className="text-center text-gray-500">
				<Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
				<h3 className="text-xl font-medium mb-2">
					{currentFilter === "all"
						? "イベントが登録されていません"
						: "該当する日付のイベントがありません"}
				</h3>
				<Button asChild variant="outline" size="sm">
					<Link href="/cattle" className="text-primary">
						<CalendarPlus className="h-4 w-4 mr-1" />
						牛を選択してイベント追加
					</Link>
				</Button>
			</div>
		</CardContent>
	</Card>
));

EmptyState.displayName = "EmptyState";

export function SchedulePresentation({
	events,
	currentFilter,
	customDate,
	error,
}: SchedulePresentationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [selectedDate, setSelectedDate] = useState(customDate || "");
	const [editingEvent, setEditingEvent] = useState<Event | null>(null);
	const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// mbla Carouselの設定
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		skipSnaps: false,
	});

	// プログラム的な同期フラグ（スワイプ時のURL更新を一時的に無効化）
	const isSwipingRef = useRef(false);

	// ダイアログ状態を完全にリセットする関数
	const resetDialogStates = useCallback(() => {
		setIsEditDialogOpen(false);
		setIsDeleteDialogOpen(false);
		setEditingEvent(null);
		setDeletingEvent(null);
	}, []);

	// 各フィルターに対応するイベントデータを準備（メモ化のみ）
	const filterEventData = useMemo(() => {
		const today = new Date();
		const tomorrow = addDays(today, 1);
		const dayAfterTomorrow = addDays(today, 2);

		const filterByDate = (targetDate: Date) => {
			return events
				.filter((event) => {
					const eventDate = new Date(event.eventDatetime);
					return (
						eventDate.getFullYear() === targetDate.getFullYear() &&
						eventDate.getMonth() === targetDate.getMonth() &&
						eventDate.getDate() === targetDate.getDate()
					);
				})
				.sort(
					(a, b) =>
						new Date(b.eventDatetime).getTime() -
						new Date(a.eventDatetime).getTime(),
				);
		};

		return {
			today: filterByDate(today),
			tomorrow: filterByDate(tomorrow),
			dayAfterTomorrow: filterByDate(dayAfterTomorrow),
			all: [...events].sort(
				(a, b) =>
					new Date(b.eventDatetime).getTime() -
					new Date(a.eventDatetime).getTime(),
			),
		};
	}, [events]);

	// スワイプ時のURL更新（デバウンス付き）
	const handleSwipeChange = useCallback(() => {
		if (!emblaApi || currentFilter === "custom" || isSwipingRef.current) return;

		const selectedIndex = emblaApi.selectedScrollSnap();
		const slideKey = FILTER_BUTTONS[selectedIndex]?.key;

		if (slideKey && slideKey !== currentFilter) {
			isSwipingRef.current = true;

			const params = new URLSearchParams(searchParams);
			if (slideKey === "all") {
				params.delete("filter");
				params.delete("date");
			} else {
				params.set("filter", slideKey);
				params.delete("date");
			}

			router.push(`/schedule?${params.toString()}`);

			// 短いタイムアウトでフラグをリセット
			setTimeout(() => {
				isSwipingRef.current = false;
			}, 50);
		}
	}, [emblaApi, currentFilter, searchParams, router]);

	// Emblaイベントリスナー（スワイプのみ）
	useEffect(() => {
		if (!emblaApi || currentFilter === "custom") return;

		emblaApi.on("select", handleSwipeChange);
		return () => {
			emblaApi.off("select", handleSwipeChange);
		};
	}, [emblaApi, handleSwipeChange, currentFilter]);

	// URLが変更されたときのスライド同期（一方向のみ）
	useEffect(() => {
		if (!emblaApi || currentFilter === "custom" || isSwipingRef.current) return;

		const targetIndex = FILTER_BUTTONS.findIndex(
			(button) => button.key === currentFilter,
		);

		if (targetIndex !== -1) {
			emblaApi.scrollTo(targetIndex);
		}
	}, [emblaApi, currentFilter]);

	// フィルターボタンクリック（URLのみ更新）
	const handleFilterClick = useCallback(
		(filter: DateFilter) => {
			resetDialogStates();

			const params = new URLSearchParams(searchParams);
			if (filter === "all") {
				params.delete("filter");
				params.delete("date");
			} else {
				params.set("filter", filter);
				params.delete("date");
			}
			router.push(`/schedule?${params.toString()}`);
		},
		[searchParams, router, resetDialogStates],
	);

	// 日付選択のハンドラー（即座に検索しない）
	const handleDateChange = useCallback((newDate: string) => {
		setSelectedDate(newDate);
	}, []);

	// 検索ボタンのクリックハンドラー
	const handleSearchClick = useCallback(() => {
		if (!selectedDate) return;

		resetDialogStates();

		const params = new URLSearchParams(searchParams);
		params.set("filter", "custom");
		params.set("date", selectedDate);
		router.push(`/schedule?${params.toString()}`);
	}, [selectedDate, searchParams, router, resetDialogStates]);

	// 日付クリアのハンドラー
	const handleClearDate = useCallback(() => {
		setSelectedDate("");
		resetDialogStates();

		const params = new URLSearchParams(searchParams);
		params.delete("filter");
		params.delete("date");
		router.push(`/schedule?${params.toString()}`);
	}, [searchParams, router, resetDialogStates]);

	// イベント編集ハンドラー
	const handleEditEvent = useCallback((event: Event) => {
		setIsDeleteDialogOpen(false);
		setDeletingEvent(null);
		setEditingEvent(event);
		setIsEditDialogOpen(true);
	}, []);

	// イベント削除ハンドラー
	const handleDeleteEvent = useCallback((event: Event) => {
		setIsEditDialogOpen(false);
		setEditingEvent(null);
		setDeletingEvent(event);
		setIsDeleteDialogOpen(true);
	}, []);

	// イベント保存ハンドラー
	const handleSaveEvent = useCallback(
		async (eventId: number, data: UpdateEventInput) => {
			try {
				const result = await updateEventAction(eventId, data);

				if (result.success) {
					toast.success("イベントを更新しました");
					setIsEditDialogOpen(false);
					setTimeout(() => {
						setEditingEvent(null);
						router.refresh();
					}, 150);
				} else {
					toast.error(result.error || "イベントの更新に失敗しました");
				}
			} catch (error) {
				console.error("Failed to update event:", error);
				toast.error("イベントの更新に失敗しました");
				throw error;
			}
		},
		[router],
	);

	// イベント削除実行ハンドラー
	const handleConfirmDelete = useCallback(
		async (eventId: number) => {
			try {
				const result = await deleteEventAction(eventId);

				if (result.success) {
					toast.success("イベントを削除しました");
					setIsDeleteDialogOpen(false);
					setTimeout(() => {
						setDeletingEvent(null);
						router.refresh();
					}, 150);
				} else {
					toast.error(result.error || "イベントの削除に失敗しました");
				}
			} catch (error) {
				console.error("Failed to delete event:", error);
				toast.error("削除中にエラーが発生しました");
				throw error;
			}
		},
		[router],
	);

	// ダイアログを閉じるハンドラー
	const handleCloseEditDialog = useCallback(() => {
		setIsEditDialogOpen(false);
		setTimeout(() => {
			setEditingEvent(null);
		}, 150);
	}, []);

	const handleCloseDeleteDialog = useCallback(() => {
		setIsDeleteDialogOpen(false);
		setTimeout(() => {
			setDeletingEvent(null);
		}, 150);
	}, []);

	// 現在表示するイベントを決定（条件分岐をシンプルに）
	const currentEvents = useMemo(() => {
		if (currentFilter === "custom") {
			return events.sort(
				(a, b) =>
					new Date(b.eventDatetime).getTime() -
					new Date(a.eventDatetime).getTime(),
			);
		}
		return filterEventData[currentFilter as keyof typeof filterEventData] || [];
	}, [currentFilter, events, filterEventData]);

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
			{/* 編集・削除ダイアログ */}
			<EventEditDialog
				event={editingEvent}
				isOpen={isEditDialogOpen}
				onClose={handleCloseEditDialog}
				onSave={handleSaveEvent}
			/>
			<EventDeleteDialog
				event={deletingEvent}
				isOpen={isDeleteDialogOpen}
				onClose={handleCloseDeleteDialog}
				onDelete={handleConfirmDelete}
			/>

			{/* ヘッダー */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Calendar className="h-6 w-6" />
					予定
				</h1>
				<Button asChild variant="outline" size="sm">
					<Link href="/cattle" className="text-primary">
						<CalendarPlus className="h-4 w-4 mr-1" />
						イベント追加
					</Link>
				</Button>
			</div>

			{/* エラー表示 */}
			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}

			{/* 日付フィルターボタン */}
			<div className="mb-6 animate-fade-in-up">
				<fieldset className="grid grid-cols-4 gap-2 border-0 p-0 m-0">
					<legend className="sr-only">日付フィルター</legend>
					{FILTER_BUTTONS.map((button, index) => {
						const date = button.getDate();

						return (
							<Button
								key={button.key}
								variant={currentFilter === button.key ? "default" : "outline"}
								onClick={() => handleFilterClick(button.key)}
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

			{/* 日付選択アコーディオン（全てフィルター選択時のみ表示） */}
			{currentFilter === "all" && (
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
												onChange={(e) => handleDateChange(e.target.value)}
												className="w-full"
											/>
										</div>
										<Button
											onClick={handleSearchClick}
											disabled={!selectedDate}
											className="flex items-center gap-2"
										>
											<Search className="h-4 w-4" />
											検索
										</Button>
										{selectedDate && (
											<Button variant="outline" onClick={handleClearDate}>
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
			)}

			{/* カスタム日付選択時の表示 */}
			{currentFilter === "custom" && customDate && (
				<div className="mb-6">
					<div className="flex items-center gap-2 text-sm flex-wrap">
						<Calendar className="h-4 w-4" />
						<span>選択日: {formatEventDate(customDate)}</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleFilterClick("all")}
							className="ml-2"
						>
							クリア
						</Button>
					</div>
					<p className="text-xs text-gray-500 mt-2">
						{currentEvents.length}件のイベントが見つかりました
					</p>
				</div>
			)}

			{/* イベント一覧（カスタム時は通常表示、それ以外はスライド対応） */}
			{currentFilter === "custom" ? (
				<div className="space-y-4">
					{currentEvents.length === 0 ? (
						<EmptyState currentFilter={currentFilter} />
					) : (
						currentEvents.map((event, index) => (
							<div
								key={event.eventId}
								className="animate-fade-in-up"
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<EventCard
									event={event}
									onEdit={handleEditEvent}
									onDelete={handleDeleteEvent}
								/>
							</div>
						))
					)}
				</div>
			) : (
				<>
					{/* スライド対応イベント一覧 */}
					<div className="overflow-hidden" ref={emblaRef}>
						<div className="flex">
							{FILTER_BUTTONS.map((button) => {
								const filterEvents =
									filterEventData[button.key as keyof typeof filterEventData];
								const isCurrentFilter = currentFilter === button.key;

								return (
									<div key={button.key} className="flex-[0_0_100%] min-w-0">
										<div className="space-y-4 px-1">
											{/*　 現在のフィルターのみ表示 */}
											{isCurrentFilter &&
												(filterEvents.length === 0 ? (
													<EmptyState
														currentFilter={button.key as DateFilter}
													/>
												) : (
													filterEvents.map((event, index) => (
														<div
															key={event.eventId}
															className="animate-fade-in-up"
															style={{ animationDelay: `${index * 0.1}s` }}
														>
															<EventCard
																event={event}
																onEdit={handleEditEvent}
																onDelete={handleDeleteEvent}
															/>
														</div>
													))
												))}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
