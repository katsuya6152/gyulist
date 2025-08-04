"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
	SearchEventsResType,
	UpdateEventInput,
} from "@/services/eventService";
import { format, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Event = SearchEventsResType["results"][0];

interface EventEditDialogProps {
	event: Event | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (eventId: number, data: UpdateEventInput) => Promise<void>;
}

const eventTypeOptions = [
	{ value: "ESTRUS", label: "発情" },
	{ value: "INSEMINATION", label: "人工授精" },
	{ value: "CALVING", label: "分娩" },
	{ value: "VACCINATION", label: "ワクチン接種" },
	{ value: "SHIPMENT", label: "出荷" },
	{ value: "HOOF_TRIMMING", label: "削蹄" },
	{ value: "OTHER", label: "その他" },
];

export function EventEditDialog({
	event,
	isOpen,
	onClose,
	onSave,
}: EventEditDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		eventType: "OTHER" as UpdateEventInput["eventType"],
		eventDatetime: "",
		notes: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const dialogRef = useRef<HTMLDivElement>(null);

	// イベントデータが変更された時にフォームを初期化
	useEffect(() => {
		if (event && isOpen) {
			try {
				// ISO日時をdatetime-local形式に変換
				const eventDate = parseISO(event.eventDatetime);
				const localDatetime = format(eventDate, "yyyy-MM-dd'T'HH:mm");

				setFormData({
					eventType: event.eventType as UpdateEventInput["eventType"],
					eventDatetime: localDatetime,
					notes: event.notes || "",
				});
				setErrors({});
			} catch (error) {
				console.error("Failed to parse event datetime:", error);
				toast.error("イベントデータの読み込みに失敗しました");
			}
		}
	}, [event, isOpen]);

	// ダイアログが閉じられた時にフォームを完全にリセット
	useEffect(() => {
		if (!isOpen) {
			// 状態を完全にリセット
			setFormData({
				eventType: "OTHER",
				eventDatetime: "",
				notes: "",
			});
			setErrors({});
			setIsLoading(false);
		}
	}, [isOpen]);

	// コンポーネントのアンマウント時にクリーンアップ
	useEffect(() => {
		return () => {
			setIsLoading(false);
			setErrors({});
		};
	}, []);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.eventDatetime) {
			newErrors.eventDatetime = "日時は必須です";
		}

		if (formData.notes && formData.notes.length > 1000) {
			newErrors.notes = "メモは1000文字以内で入力してください";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!event || !validateForm() || isLoading) {
			return;
		}

		setIsLoading(true);
		try {
			// datetime-local形式をISO形式に変換
			const isoDatetime = new Date(formData.eventDatetime).toISOString();

			await onSave(event.eventId, {
				eventType: formData.eventType,
				eventDatetime: isoDatetime,
				notes: formData.notes || undefined,
			});
		} catch (error) {
			console.error("Failed to update event:", error);
			toast.error("イベントの更新に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			// 確実にクリーンアップしてから閉じる
			setIsLoading(false);
			setErrors({});
			onClose();
		}
	};

	const handleFieldChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// エラーをクリア
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	// ダイアログが開いていない、またはイベントがない場合は何も表示しない
	if (!isOpen || !event) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				ref={dialogRef}
				className="sm:max-w-[500px]"
				onPointerDownOutside={(e) => {
					if (!isLoading) {
						handleClose();
					} else {
						e.preventDefault();
					}
				}}
				onEscapeKeyDown={(e) => {
					if (!isLoading) {
						handleClose();
					} else {
						e.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>イベントを編集</DialogTitle>
					<DialogDescription>
						{event.cattleName}のイベント情報を編集してください。
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* イベント種別 */}
					<div className="space-y-2">
						<Label htmlFor="eventType">イベント種別</Label>
						<Select
							value={formData.eventType}
							onValueChange={(value) => handleFieldChange("eventType", value)}
							disabled={isLoading}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{eventTypeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* 日時 */}
					<div className="space-y-2">
						<Label htmlFor="eventDatetime">
							日時 <span className="text-red-500">*</span>
						</Label>
						<Input
							id="eventDatetime"
							type="datetime-local"
							value={formData.eventDatetime}
							onChange={(e) =>
								handleFieldChange("eventDatetime", e.target.value)
							}
							className={errors.eventDatetime ? "border-red-500" : ""}
							disabled={isLoading}
							required
						/>
						{errors.eventDatetime && (
							<p className="text-sm text-red-500">{errors.eventDatetime}</p>
						)}
					</div>

					{/* メモ */}
					<div className="space-y-2">
						<Label htmlFor="notes">メモ</Label>
						<Textarea
							id="notes"
							value={formData.notes}
							onChange={(e) => handleFieldChange("notes", e.target.value)}
							className={errors.notes ? "border-red-500" : ""}
							placeholder="メモを入力してください（1000文字以内）"
							rows={4}
							maxLength={1000}
							disabled={isLoading}
						/>
						{errors.notes && (
							<p className="text-sm text-red-500">{errors.notes}</p>
						)}
						<p className="text-xs text-gray-500">
							{formData.notes.length}/1000文字
						</p>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
						>
							キャンセル
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
									保存中...
								</>
							) : (
								"保存"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
