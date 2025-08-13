"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPE_LABELS } from "@repo/api";
import { Calendar, Clock, Edit, MoreHorizontal, Trash } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { eventTypeColors } from "./event-constants";
import { formatEventDate, formatEventTime } from "./event-utils";

export type EventLike = {
	eventId: number;
	eventType: string;
	eventDatetime: string;
	notes?: string | null;
	cattleName?: string | null;
	cattleEarTagNumber?: string | number | null;
};

interface EventCardProps {
	event: EventLike;
	onEdit?: (event: EventLike) => void;
	onDelete?: (event: EventLike) => void;
	titleOverride?: string;
	subtitleOverride?: string;
	// When true, hides cattle name/ear-tag and emphasizes the event label instead
	hideCattleInfo?: boolean;
	// When true, reduce paddings for a smaller card footprint
	compact?: boolean;
	// Optional inline dialogs
	onSave?: (
		eventId: number,
		data: { eventType: string; eventDatetime: string; notes?: string },
	) => Promise<void>;
	onConfirmDelete?: (eventId: number) => Promise<void>;
}

export const EventCard = memo(
	({
		event,
		onEdit,
		onDelete,
		titleOverride,
		subtitleOverride,
		hideCattleInfo,
		compact,
		onSave,
		onConfirmDelete,
	}: EventCardProps) => {
		const [isDropdownOpen, setIsDropdownOpen] = useState(false);
		const [isEditOpen, setIsEditOpen] = useState(false);
		const [isDeleteOpen, setIsDeleteOpen] = useState(false);
		const [isSubmitting, setIsSubmitting] = useState(false);
		const [isNotesOpen, setIsNotesOpen] = useState(false);
		const [localEventType, setLocalEventType] = useState<string>(
			event.eventType,
		);
		const [localDatetime, setLocalDatetime] = useState<string>("");
		const [localNotes, setLocalNotes] = useState<string>(event.notes || "");

		const handleEdit = useCallback(() => {
			setIsDropdownOpen(false);
			if (onEdit) {
				setTimeout(() => onEdit(event), 100);
			} else if (onSave) {
				try {
					const d = new Date(event.eventDatetime);
					const dt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
					setLocalDatetime(dt);
				} catch {
					setLocalDatetime("");
				}
				setLocalEventType(event.eventType);
				setLocalNotes(event.notes || "");
				setIsEditOpen(true);
			}
		}, [event, onEdit, onSave]);

		const handleDelete = useCallback(() => {
			setIsDropdownOpen(false);
			if (onDelete) {
				setTimeout(() => onDelete(event), 100);
			} else if (onConfirmDelete) {
				setIsDeleteOpen(true);
			}
		}, [event, onDelete, onConfirmDelete]);

		return (
			<>
				<Card
					key={event.eventId}
					data-testid="event-item"
					className={`hover:shadow-lg transition-all duration-200 relative hover-lift ${
						event.notes ? "cursor-pointer" : ""
					}`}
					onClick={() => {
						if (event.notes) setIsNotesOpen((v) => !v);
					}}
				>
					{onEdit || onDelete || onSave || onConfirmDelete ? (
						<div className="absolute top-2 right-2">
							<DropdownMenu
								open={isDropdownOpen}
								onOpenChange={setIsDropdownOpen}
							>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 tap-feedback hover:scale-110 transition-all duration-200"
										onClick={(e) => e.stopPropagation()}
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
									{(onEdit || onSave) && (
										<DropdownMenuItem
											onClick={handleEdit}
											className="transition-colors duration-200"
										>
											<Edit className="h-4 w-4 mr-2" />
											編集
										</DropdownMenuItem>
									)}
									{(onDelete || onConfirmDelete) && (
										<DropdownMenuItem
											onClick={handleDelete}
											className="text-red-600 focus:text-red-600 transition-colors duration-200"
										>
											<Trash className="h-4 w-4 mr-2" />
											削除
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : null}

					<CardHeader className={compact ? "px-4 py-3" : undefined}>
						<CardTitle className="flex flex-col gap-2">
							{hideCattleInfo ? (
								<div className="flex items-center gap-3 flex-wrap">
									<Badge
										variant="outline"
										className={`transition-all duration-200 hover:shadow-sm ${
											eventTypeColors[event.eventType] || eventTypeColors.OTHER
										}`}
									>
										{EVENT_TYPE_LABELS[
											event.eventType as keyof typeof EVENT_TYPE_LABELS
										] || event.eventType}
									</Badge>
									{event.notes && (
										<Badge
											variant="secondary"
											className="text-[10px] px-2 py-0.5"
										>
											メモあり
										</Badge>
									)}
								</div>
							) : (
								<div className="flex items-center gap-3 flex-wrap">
									<Badge
										variant="outline"
										className={`transition-all duration-200 hover:shadow-sm ${eventTypeColors[event.eventType] || eventTypeColors.OTHER}`}
									>
										{EVENT_TYPE_LABELS[
											event.eventType as keyof typeof EVENT_TYPE_LABELS
										] || event.eventType}
									</Badge>
									<span className="text-lg font-medium transition-colors duration-200">
										{titleOverride ?? event.cattleName}
									</span>
									{(subtitleOverride ?? event.cattleEarTagNumber) && (
										<span className="text-sm text-gray-500 transition-colors duration-200">
											({subtitleOverride ?? event.cattleEarTagNumber})
										</span>
									)}
									{event.notes && (
										<Badge
											variant="secondary"
											className="text-[10px] px-2 py-0.5"
										>
											メモあり
										</Badge>
									)}
								</div>
							)}
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Calendar className="h-4 w-4 transition-transform duration-200" />
								{formatEventDate(event.eventDatetime)}
								<Clock className="h-4 w-4 ml-2 transition-transform duration-200" />
								{formatEventTime(event.eventDatetime)}
							</div>
						</CardTitle>
					</CardHeader>
					{event.notes && isNotesOpen && (
						<>
							<Separator />
							<CardContent className={compact ? "px-4 py-3" : undefined}>
								<div className="text-sm">
									<p className="mt-1 whitespace-pre-wrap">{event.notes}</p>
								</div>
							</CardContent>
						</>
					)}
				</Card>

				{/* Inline Edit Dialog */}
				{onSave && (
					<Dialog
						open={isEditOpen}
						onOpenChange={(open) => !isSubmitting && setIsEditOpen(open)}
					>
						<DialogContent className="sm:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>イベントを編集</DialogTitle>
								<DialogDescription>
									イベント情報を編集します。
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="eventType">イベント種別</Label>
									<Select
										value={localEventType}
										onValueChange={setLocalEventType}
										disabled={isSubmitting}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.keys(EVENT_TYPE_LABELS).map((v) => (
												<SelectItem key={v} value={v}>
													{
														EVENT_TYPE_LABELS[
															v as keyof typeof EVENT_TYPE_LABELS
														]
													}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="eventDatetime">日時</Label>
									<Input
										id="eventDatetime"
										type="datetime-local"
										value={localDatetime}
										onChange={(e) => setLocalDatetime(e.target.value)}
										disabled={isSubmitting}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="notes">メモ</Label>
									<Textarea
										id="notes"
										value={localNotes}
										onChange={(e) => setLocalNotes(e.target.value)}
										rows={4}
										maxLength={1000}
										disabled={isSubmitting}
									/>
									<p className="text-xs text-gray-500">
										{localNotes.length}/1000文字
									</p>
								</div>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => !isSubmitting && setIsEditOpen(false)}
									disabled={isSubmitting}
								>
									キャンセル
								</Button>
								<Button
									type="button"
									disabled={isSubmitting}
									onClick={async () => {
										if (!onSave) return;
										setIsSubmitting(true);
										try {
											const iso = localDatetime
												? new Date(localDatetime).toISOString()
												: event.eventDatetime;
											await onSave(event.eventId, {
												eventType: localEventType,
												eventDatetime: iso,
												notes: localNotes || undefined,
											});
											setIsEditOpen(false);
										} finally {
											setIsSubmitting(false);
										}
									}}
								>
									保存
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}

				{/* Inline Delete Dialog */}
				{onConfirmDelete && (
					<Dialog
						open={isDeleteOpen}
						onOpenChange={(open) => !isSubmitting && setIsDeleteOpen(open)}
					>
						<DialogContent className="sm:max-w-[420px]">
							<DialogHeader>
								<DialogTitle>イベントを削除</DialogTitle>
								<DialogDescription>
									この操作は取り消せません。本当に削除しますか？
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => !isSubmitting && setIsDeleteOpen(false)}
									disabled={isSubmitting}
								>
									キャンセル
								</Button>
								<Button
									type="button"
									variant="destructive"
									disabled={isSubmitting}
									onClick={async () => {
										if (!onConfirmDelete) return;
										setIsSubmitting(true);
										try {
											await onConfirmDelete(event.eventId);
											setIsDeleteOpen(false);
										} finally {
											setIsSubmitting(false);
										}
									}}
								>
									削除する
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</>
		);
	},
);

EventCard.displayName = "EventCard";
