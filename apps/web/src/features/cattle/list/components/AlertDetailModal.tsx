"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { GetAlertsRes } from "@/services/alertsService";
import {
	ALERT_SEVERITY_LABELS,
	ALERT_STATUS_LABELS,
	ALERT_TYPE_LABELS,
	STATUS_UPDATE_MESSAGES
} from "@repo/api";
import {
	AlertTriangle,
	Bell,
	Calendar,
	Edit3,
	Info,
	MessageSquare,
	Save,
	X,
	X as XIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateAlertMemoAction, updateAlertStatusAction } from "../actions";

interface AlertDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	alerts: GetAlertsRes["results"];
	cattleName: string;
}

const SEVERITY_CONFIG = {
	high: {
		label: ALERT_SEVERITY_LABELS.high,
		variant: "destructive" as const,
		icon: AlertTriangle
	},
	medium: {
		label: ALERT_SEVERITY_LABELS.medium,
		variant: "default" as const,
		icon: Bell
	},
	low: {
		label: ALERT_SEVERITY_LABELS.low,
		variant: "secondary" as const,
		icon: Info
	}
} as const;

const STATUS_CONFIG = {
	active: { label: ALERT_STATUS_LABELS.active, variant: "default" as const },
	acknowledged: {
		label: ALERT_STATUS_LABELS.acknowledged,
		variant: "secondary" as const
	},
	resolved: {
		label: ALERT_STATUS_LABELS.resolved,
		variant: "outline" as const
	},
	dismissed: {
		label: ALERT_STATUS_LABELS.dismissed,
		variant: "outline" as const
	}
} as const;

export function AlertDetailModal({
	isOpen,
	onClose,
	alerts,
	cattleName
}: AlertDetailModalProps) {
	const router = useRouter();

	// アラートステータス更新ハンドラー
	const handleStatusUpdate = async (
		alertId: string,
		status: "acknowledged" | "resolved" | "dismissed",
		successMessage: string
	) => {
		try {
			const result = await updateAlertStatusAction(alertId, status);

			if (result.success) {
				if (result.message === "demo") {
					toast.info(successMessage, {
						description: "デモアカウントのため、実際に更新はされていません"
					});
				} else {
					toast.success(successMessage);
					router.refresh();
				}
			} else {
				toast.error(`ステータス更新に失敗しました: ${result.error}`);
			}
		} catch (error) {
			console.error("Alert status update error:", error);
			toast.error("アラートステータスの更新で予期しないエラーが発生しました");
		}
	};

	const handleAcknowledge = (alertId: string) =>
		handleStatusUpdate(
			alertId,
			"acknowledged",
			STATUS_UPDATE_MESSAGES.acknowledged
		);

	const handleResolve = (alertId: string) =>
		handleStatusUpdate(alertId, "resolved", STATUS_UPDATE_MESSAGES.resolved);

	const handleDismiss = (alertId: string) =>
		handleStatusUpdate(alertId, "dismissed", STATUS_UPDATE_MESSAGES.dismissed);

	if (alerts.length === 0) return null;

	const sortedAlerts = [...alerts].sort((a, b) => {
		const severityOrder = { high: 3, medium: 2, low: 1 };
		return (
			severityOrder[b.severity as keyof typeof severityOrder] -
			severityOrder[a.severity as keyof typeof severityOrder]
		);
	});

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-[90vw] w-full max-h-[90vh] sm:max-w-2xl sm:max-h-[80vh] overflow-hidden p-2">
				<DialogHeader className="px-1 sm:px-6 py-1 sm:py-6">
					<DialogTitle className="flex items-center gap-1 text-lg sm:text-xl">
						<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
						アラート詳細
					</DialogTitle>
					<DialogDescription className="text-sm sm:text-base">
						{cattleName}のアラート情報（{alerts.length}件）
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto px-2 sm:px-6 pb-2 sm:pb-6">
					<div className="space-y-3 sm:space-y-4">
						{sortedAlerts.map((alert, index) => {
							const severity =
								SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG];
							const status =
								STATUS_CONFIG[alert.status as keyof typeof STATUS_CONFIG];
							const SeverityIcon = severity.icon;

							return (
								<div
									key={alert.id}
									className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4"
								>
									{/* ヘッダー */}
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
										<div className="flex flex-wrap items-center gap-2">
											<Badge
												variant={severity.variant}
												className="text-xs sm:text-sm"
											>
												<SeverityIcon className="h-3 w-3 mr-1" />
												{severity.label}優先度
											</Badge>
											<Badge
												variant={status.variant}
												className="text-xs sm:text-sm"
											>
												{status.label}
											</Badge>
										</div>
									</div>

									<Separator />

									{/* アラートタイプ */}
									<div className="space-y-2">
										<h4 className="font-medium text-sm sm:text-base">
											アラートタイプ
										</h4>
										<div className="text-sm text-muted-foreground">
											{ALERT_TYPE_LABELS[
												alert.type as keyof typeof ALERT_TYPE_LABELS
											] || alert.type}
										</div>
									</div>

									{/* メモ */}
									<MemoField alertId={alert.id} initialMemo={alert.memo} />

									{/* 期限日時 */}
									{alert.dueAt && (
										<div className="space-y-2">
											<h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												期限日時
											</h4>
											<div className="text-sm text-muted-foreground">
												{formatDate(alert.dueAt)}
											</div>
										</div>
									)}

									{/* アクションボタン */}
									<div className="flex flex-col sm:flex-row gap-2 pt-2">
										<Button
											variant="outline"
											size="sm"
											className="flex-1 sm:flex-none min-h-[44px] text-sm"
											onClick={() => handleAcknowledge(alert.id)}
											disabled={alert.status !== "active"}
										>
											確認済みにする
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="flex-1 sm:flex-none min-h-[44px] text-sm"
											onClick={() => handleResolve(alert.id)}
											disabled={alert.status === "resolved"}
										>
											解決済みにする
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="flex-1 sm:flex-none min-h-[44px] text-sm"
											onClick={() => handleDismiss(alert.id)}
											disabled={alert.status === "dismissed"}
										>
											却下する
										</Button>
									</div>

									{index < sortedAlerts.length - 1 && <Separator />}
								</div>
							);
						})}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// メモフィールドコンポーネント
function MemoField({
	alertId,
	initialMemo
}: { alertId: string; initialMemo: string | null }) {
	const [isEditing, setIsEditing] = useState(false);
	const [memo, setMemo] = useState(initialMemo || "");
	const [tempMemo, setTempMemo] = useState(initialMemo || "");
	const [isLoading, setIsLoading] = useState(false);

	// 初期メモが変更された場合の更新
	useEffect(() => {
		setMemo(initialMemo || "");
		setTempMemo(initialMemo || "");
	}, [initialMemo]);

	const handleEdit = () => {
		setTempMemo(memo);
		setIsEditing(true);
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const response = await updateAlertMemoAction(alertId, tempMemo);

			if (response.success) {
				setMemo(tempMemo);
				setIsEditing(false);

				if (response.message === "demo") {
					toast.info("メモが正常に更新されました", {
						description: "デモアカウントのため、実際に更新はされていません"
					});
				} else {
					toast.success("メモが正常に更新されました");
				}
			} else {
				toast.error(
					`メモ更新に失敗しました: ${response.error || response.message}`
				);
			}
		} catch (error) {
			console.error("Memo update error:", error);
			toast.error("メモ更新で予期しないエラーが発生しました");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setTempMemo(memo);
		setIsEditing(false);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
					<MessageSquare className="h-4 w-4" />
					メモ
				</h4>
				{!isEditing && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleEdit}
						className="h-8 w-8 p-0"
					>
						<Edit3 className="h-4 w-4" />
					</Button>
				)}
			</div>

			{isEditing ? (
				<div className="space-y-2">
					<Textarea
						value={tempMemo}
						onChange={(e) => setTempMemo(e.target.value)}
						placeholder="メモを入力してください..."
						className="min-h-[80px] text-sm"
						disabled={isLoading}
					/>
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={handleSave}
							className="flex-1 sm:flex-none min-h-[36px] text-sm"
							disabled={isLoading}
						>
							<Save className="h-4 w-4 mr-1" />
							{isLoading ? "保存中..." : "保存"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleCancel}
							className="flex-1 sm:flex-none min-h-[36px] text-sm"
							disabled={isLoading}
						>
							<XIcon className="h-4 w-4 mr-1" />
							キャンセル
						</Button>
					</div>
				</div>
			) : (
				<div className="min-h-[80px] p-3 bg-muted/50 rounded-md">
					{memo ? (
						<div className="text-sm whitespace-pre-wrap">{memo}</div>
					) : (
						<div className="text-sm text-muted-foreground italic">
							メモがありません。編集ボタンをクリックしてメモを追加してください。
						</div>
					)}
				</div>
			)}
		</div>
	);
}

const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	} catch {
		return dateString;
	}
};
