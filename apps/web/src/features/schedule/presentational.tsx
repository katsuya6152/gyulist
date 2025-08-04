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
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
			// DropdownMenuを確実に閉じてからダイアログを開く
			setIsDropdownOpen(false);
			// 少し遅延させてDropdownMenuの閉じるアニメーションを完了させる
			setTimeout(() => {
				onEdit(event);
			}, 100);
		}, [event, onEdit]);

		const handleDelete = useCallback(() => {
			// DropdownMenuを確実に閉じてからダイアログを開く
			setIsDropdownOpen(false);
			// 少し遅延させてDropdownMenuの閉じるアニメーションを完了させる
			setTimeout(() => {
				onDelete(event);
			}, 100);
		}, [event, onDelete]);

		return (
			<Card
				key={event.eventId}
				data-testid="event-item"
				className="hover:shadow-md transition-shadow relative"
			>
				{/* アクションメニュー */}
				<div className="absolute top-2 right-2">
					<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
								<span className="sr-only">メニューを開く</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" side="bottom" sideOffset={5}>
							<DropdownMenuItem onClick={handleEdit}>
								<Edit className="h-4 w-4 mr-2" />
								編集
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleDelete}
								className="text-red-600 focus:text-red-600"
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
								className={
									eventTypeColors[event.eventType] || eventTypeColors.OTHER
								}
							>
								{eventTypeLabels[event.eventType] || event.eventType}
							</Badge>
							<span className="text-lg font-medium">{event.cattleName}</span>
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
					<Link href="/cattle" className="text-[#00C5CC]">
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

	// ダイアログ状態を完全にリセットする関数
	const resetDialogStates = useCallback(() => {
		setIsEditDialogOpen(false);
		setIsDeleteDialogOpen(false);
		setEditingEvent(null);
		setDeletingEvent(null);
	}, []);

	// コンポーネントのアンマウント時にダイアログ状態をクリーンアップ
	useEffect(() => {
		return () => {
			resetDialogStates();
		};
	}, [resetDialogStates]);

	// フィルターボタンの定義をメモ化
	const filterButtons = useMemo(
		() => [
			{
				key: "today" as const,
				label: "今日",
				getDate: () => new Date() as Date | null,
			},
			{
				key: "tomorrow" as const,
				label: "明日",
				getDate: () => addDays(new Date(), 1) as Date | null,
			},
			{
				key: "dayAfterTomorrow" as const,
				label: "明後日",
				getDate: () => addDays(new Date(), 2) as Date | null,
			},
			{
				key: "all" as const,
				label: "全て",
				getDate: () => null as Date | null,
			},
		],
		[],
	);

	// ソートされたイベントをメモ化
	const sortedEvents = useMemo(() => {
		return [...events].sort(
			(a, b) =>
				new Date(b.eventDatetime).getTime() -
				new Date(a.eventDatetime).getTime(),
		);
	}, [events]);

	// フィルターボタンのクリックハンドラー
	const handleFilterClick = useCallback(
		(filter: DateFilter) => {
			// ダイアログが開いている場合は閉じる
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

		// ダイアログが開いている場合は閉じる
		resetDialogStates();

		const params = new URLSearchParams(searchParams);
		params.set("filter", "custom");
		params.set("date", selectedDate);
		router.push(`/schedule?${params.toString()}`);
	}, [selectedDate, searchParams, router, resetDialogStates]);

	// 日付クリアのハンドラー
	const handleClearDate = useCallback(() => {
		setSelectedDate("");
		// ダイアログが開いている場合は閉じる
		resetDialogStates();

		const params = new URLSearchParams(searchParams);
		params.delete("filter");
		params.delete("date");
		router.push(`/schedule?${params.toString()}`);
	}, [searchParams, router, resetDialogStates]);

	// イベント編集ハンドラー
	const handleEditEvent = useCallback((event: Event) => {
		// 他のダイアログを確実に閉じる
		setIsDeleteDialogOpen(false);
		setDeletingEvent(null);

		// 編集ダイアログを開く
		setEditingEvent(event);
		setIsEditDialogOpen(true);
	}, []);

	// イベント削除ハンドラー
	const handleDeleteEvent = useCallback((event: Event) => {
		// 他のダイアログを確実に閉じる
		setIsEditDialogOpen(false);
		setEditingEvent(null);

		// 削除ダイアログを開く
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
					// ダイアログを段階的に閉じる
					setIsEditDialogOpen(false);
					setTimeout(() => {
						setEditingEvent(null);
						// ページをリフレッシュして最新データを取得
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
					// ダイアログを段階的に閉じる
					setIsDeleteDialogOpen(false);
					setTimeout(() => {
						setDeletingEvent(null);
						// ページをリフレッシュして最新データを取得
						router.refresh();
					}, 150);
				} else {
					toast.error(result.error || "イベントの削除に失敗しました");
				}
			} catch (error) {
				console.error("Failed to delete event:", error);
				toast.error("イベントの削除に失敗しました");
				throw error;
			}
		},
		[router],
	);

	// ダイアログを閉じるハンドラー
	const handleCloseEditDialog = useCallback(() => {
		setIsEditDialogOpen(false);
		// 少し遅延させてダイアログのクローズアニメーションを完了させてから状態をクリア
		setTimeout(() => {
			setEditingEvent(null);
		}, 150);
	}, []);

	const handleCloseDeleteDialog = useCallback(() => {
		setIsDeleteDialogOpen(false);
		// 少し遅延させてダイアログのクローズアニメーションを完了させてから状態をクリア
		setTimeout(() => {
			setDeletingEvent(null);
		}, 150);
	}, []);

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
					<Link href="/cattle" className="text-[#00C5CC]">
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
			<div className="mb-6">
				<fieldset className="grid grid-cols-4 gap-2 border-0 p-0 m-0">
					<legend className="sr-only">日付フィルター</legend>
					{filterButtons.map((button) => {
						const date = button.getDate();

						return (
							<Button
								key={button.key}
								variant={currentFilter === button.key ? "default" : "outline"}
								onClick={() => handleFilterClick(button.key)}
								className="h-auto py-3 px-2 flex flex-col items-center gap-1"
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
				{currentFilter !== "all" && currentFilter !== "custom" && (
					<output
						className="text-xs text-gray-500 mt-2 block"
						aria-live="polite"
					>
						{sortedEvents.length}件のイベントが見つかりました
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
									<Label
										htmlFor="date-picker"
										className="text-sm text-gray-600"
									>
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
					<div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
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
						{sortedEvents.length}件のイベントが見つかりました
					</p>
				</div>
			)}

			{/* イベント一覧 */}
			<div className="space-y-4">
				{sortedEvents.length === 0 ? (
					<EmptyState currentFilter={currentFilter} />
				) : (
					sortedEvents.map((event) => (
						<EventCard
							key={event.eventId}
							event={event}
							onEdit={handleEditEvent}
							onDelete={handleDeleteEvent}
						/>
					))
				)}
			</div>
		</div>
	);
}
