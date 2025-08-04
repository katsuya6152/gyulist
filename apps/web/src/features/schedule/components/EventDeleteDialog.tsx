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
import type { SearchEventsResType } from "@/services/eventService";
import { format, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Event = SearchEventsResType["results"][0];

interface EventDeleteDialogProps {
	event: Event | null;
	isOpen: boolean;
	onClose: () => void;
	onDelete: (eventId: number) => Promise<void>;
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

export function EventDeleteDialog({
	event,
	isOpen,
	onClose,
	onDelete,
}: EventDeleteDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const dialogRef = useRef<HTMLDivElement>(null);

	// ダイアログが閉じられた時に状態をリセット
	useEffect(() => {
		if (!isOpen) {
			setIsLoading(false);
		}
	}, [isOpen]);

	// コンポーネントのアンマウント時にクリーンアップ
	useEffect(() => {
		return () => {
			setIsLoading(false);
		};
	}, []);

	const handleDelete = async () => {
		if (!event || isLoading) return;

		setIsLoading(true);
		try {
			await onDelete(event.eventId);
		} catch (error) {
			console.error("Failed to delete event:", error);
			toast.error("イベントの削除に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			// 確実にクリーンアップしてから閉じる
			setIsLoading(false);
			onClose();
		}
	};

	// ダイアログが開いていない、またはイベントがない場合は何も表示しない
	if (!isOpen || !event) {
		return null;
	}

	let eventDate: Date;
	try {
		eventDate = parseISO(event.eventDatetime);
	} catch (error) {
		console.error("Failed to parse event datetime:", error);
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
					<DialogTitle className="text-red-600">イベントを削除</DialogTitle>
					<DialogDescription>
						このイベントを削除しますか？この操作は取り消せません。
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="rounded-lg border p-4 bg-red-50 border-red-200">
						<h3 className="font-medium text-red-900 mb-3">
							削除対象のイベント
						</h3>
						<div className="space-y-2 text-sm text-red-700">
							<div>
								<span className="font-medium">牛の名前:</span>{" "}
								{event.cattleName}
							</div>
							{event.cattleEarTagNumber && (
								<div>
									<span className="font-medium">個体識別番号:</span>{" "}
									{event.cattleEarTagNumber}
								</div>
							)}
							<div>
								<span className="font-medium">イベント種別:</span>{" "}
								{eventTypeLabels[event.eventType] || event.eventType}
							</div>
							<div>
								<span className="font-medium">日時:</span>{" "}
								{format(eventDate, "yyyy年MM月dd日 HH:mm")}
							</div>
							{event.notes && (
								<div>
									<span className="font-medium">メモ:</span> {event.notes}
								</div>
							)}
						</div>
					</div>
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
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
								削除中...
							</>
						) : (
							"削除"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
