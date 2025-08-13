"use client";

import { EventCard } from "@/components/event/event-card";
import { Button } from "@/components/ui/button";
import type { UpdateEventInput } from "@/services/eventService";
import useEmblaCarousel from "embla-carousel-react";
import { Calendar, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteEventAction, updateEventAction } from "./actions";
import { DateFilterButtons } from "./components/DateFilterButtons";
import { DatePickerAccordion } from "./components/DatePickerAccordion";
import { EmptyState } from "./components/EmptyState";
import { type DateFilter, type Event, FILTER_BUTTONS } from "./constants";
import {
	formatEventDate,
	prepareFilterEventData,
	sortAllEvents,
} from "./utils";

interface SchedulePresentationProps {
	events: Event[];
	currentFilter: DateFilter;
	customDate?: string;
	error?: string;
}

export function SchedulePresentation({
	events,
	currentFilter,
	customDate,
	error,
}: SchedulePresentationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [selectedDate, setSelectedDate] = useState(customDate || "");

	// Embla Carouselの設定
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		skipSnaps: false,
	});

	// プログラム的な同期フラグ（スワイプ時のURL更新を一時的に無効化）
	const isSwipingRef = useRef(false);

	// 外部ダイアログは内蔵化により不要

	// 各フィルターに対応するイベントデータを準備（メモ化のみ）
	const filterEventData = useMemo(
		() => prepareFilterEventData(events),
		[events],
	);

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
		[searchParams, router],
	);

	// 日付選択のハンドラー（即座に検索しない）
	const handleDateChange = useCallback((newDate: string) => {
		setSelectedDate(newDate);
	}, []);

	// 検索ボタンのクリックハンドラー
	const handleSearchClick = useCallback(() => {
		if (!selectedDate) return;
		const params = new URLSearchParams(searchParams);
		params.set("filter", "custom");
		params.set("date", selectedDate);
		router.push(`/schedule?${params.toString()}`);
	}, [selectedDate, searchParams, router]);

	// 日付クリアのハンドラー
	const handleClearDate = useCallback(() => {
		setSelectedDate("");
		const params = new URLSearchParams(searchParams);
		params.delete("filter");
		params.delete("date");
		router.push(`/schedule?${params.toString()}`);
	}, [searchParams, router]);

	// イベント保存ハンドラー
	const handleSaveEvent = useCallback(
		async (eventId: number, data: UpdateEventInput) => {
			try {
				const result = await updateEventAction(eventId, data);

				if (result.success) {
					if ("message" in result && result.message === "demo") {
						toast.info("イベントを更新しました", {
							description: "デモアカウントのため、実際に更新はされていません",
						});
					} else {
						toast.success("イベントを更新しました");
					}
					router.refresh();
				} else {
					toast.error(
						("error" in result && result.error) ||
							"イベントの更新に失敗しました",
					);
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
					if ("message" in result && result.message === "demo") {
						toast.info("イベントを削除しました", {
							description: "デモアカウントのため、実際に削除はされていません",
						});
					} else {
						toast.success("イベントを削除しました");
					}
					router.refresh();
				} else {
					toast.error(
						("error" in result && result.error) ||
							"イベントの削除に失敗しました",
					);
				}
			} catch (error) {
				console.error("Failed to delete event:", error);
				toast.error("削除中にエラーが発生しました");
				throw error;
			}
		},
		[router],
	);

	// 現在表示するイベントを決定（条件分岐をシンプルに）
	const currentEvents = useMemo(() => {
		if (currentFilter === "custom") {
			return sortAllEvents(events);
		}
		return filterEventData[currentFilter as keyof typeof filterEventData] || [];
	}, [currentFilter, events, filterEventData]);

	return (
		<div className="container mx-auto px-4 py-6 max-w-4xl">
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
			<DateFilterButtons
				currentFilter={currentFilter}
				currentEvents={currentEvents}
				onFilterClick={handleFilterClick}
			/>

			{/* 日付選択アコーディオン（全てフィルター選択時のみ表示） */}
			{currentFilter === "all" && (
				<DatePickerAccordion
					selectedDate={selectedDate}
					onDateChange={handleDateChange}
					onSearchClick={handleSearchClick}
					onClearDate={handleClearDate}
				/>
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
									event={{
										eventId: event.eventId,
										eventType: event.eventType,
										eventDatetime: event.eventDatetime,
										notes: event.notes,
										cattleName: event.cattleName,
										cattleEarTagNumber: event.cattleEarTagNumber,
									}}
									onSave={async (id, data) => {
										await handleSaveEvent(id, data as UpdateEventInput);
									}}
									onConfirmDelete={async (id) => {
										await handleConfirmDelete(id);
									}}
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
										<div className="space-y-2 px-1">
											{/* 現在のフィルターのみ表示 */}
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
																event={{
																	eventId: event.eventId,
																	eventType: event.eventType,
																	eventDatetime: event.eventDatetime,
																	notes: event.notes,
																	cattleName: event.cattleName,
																	cattleEarTagNumber: event.cattleEarTagNumber,
																}}
																onSave={async (id, data) => {
																	await handleSaveEvent(
																		id,
																		data as UpdateEventInput,
																	);
																}}
																onConfirmDelete={async (id) => {
																	await handleConfirmDelete(id);
																}}
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
