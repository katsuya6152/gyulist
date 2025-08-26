"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getGrowthStage } from "@/lib/utils";
import type { GetAlertsRes } from "@/services/alertsService";
import { ALERT_TYPE_LABELS } from "@repo/api";
import classNames from "classnames";
import { clsx } from "clsx";
import {
	AlertTriangle,
	Bell,
	CalendarPlus,
	ChevronRight,
	Info
} from "lucide-react";
import { memo, useState } from "react";
import { type Status, statusLabelMap } from "../../../constants";
import type { CattleListItem } from "../../constants";
import { AlertDetailModal } from "../AlertDetailModal";

interface CattleItemProps {
	cattle: CattleListItem;
	index: number;
	alerts: GetAlertsRes["results"];
	onItemClick: (cattleId: number) => void;
	onAddEvent: (cattleId: number) => void;
	sortBy?: string;
}

export const CattleItem = memo(
	({
		cattle,
		index,
		alerts,
		onItemClick,
		onAddEvent,
		sortBy
	}: CattleItemProps) => {
		const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

		const handleItemClick = () => {
			onItemClick(cattle.cattleId);
		};

		const handleAddEvent = (e: React.MouseEvent) => {
			e.stopPropagation();
			onAddEvent(cattle.cattleId);
		};

		const handleAlertClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			setIsAlertModalOpen(true);
		};

		const handleAlertKeyDown = (e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				e.stopPropagation();
				setIsAlertModalOpen(true);
			}
		};

		// この牛のアラートを取得
		const cattleAlerts = alerts.filter(
			(alert) => alert.cattleId === cattle.cattleId
		);

		// アラート表示用のヘルパー関数
		const getAlertDisplay = () => {
			if (cattleAlerts.length === 0) return null;

			const highPriority = cattleAlerts.filter((a) => a.severity === "high");
			const mediumPriority = cattleAlerts.filter(
				(a) => a.severity === "medium"
			);
			const lowPriority = cattleAlerts.filter((a) => a.severity === "low");

			const highLabel =
				highPriority.length > 0
					? ALERT_TYPE_LABELS[
							highPriority[0].type as keyof typeof ALERT_TYPE_LABELS
						] || highPriority[0].type
					: null;
			const mediumLabel =
				mediumPriority.length > 0
					? ALERT_TYPE_LABELS[
							mediumPriority[0].type as keyof typeof ALERT_TYPE_LABELS
						] || mediumPriority[0].type
					: null;
			const lowLabel =
				lowPriority.length > 0
					? ALERT_TYPE_LABELS[
							lowPriority[0].type as keyof typeof ALERT_TYPE_LABELS
						] || lowPriority[0].type
					: null;

			return (
				<div className="flex items-center gap-1">
					{highPriority.length > 0 && (
						<>
							<button
								type="button"
								className="inline-flex items-center rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white ring-offset-background transition-all hover:bg-red-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 cursor-pointer shadow-md"
								onClick={handleAlertClick}
								onKeyDown={handleAlertKeyDown}
								aria-label={`高優先度アラート${highPriority.length}件を表示`}
							>
								<AlertTriangle className="h-3 w-3 mr-1" />
								{/* <span className="mr-1">{highPriority.length}</span> */}
							</button>
							{highLabel && (
								<span className="text-xs font-semibold text-red-600 ml-1 truncate max-w-[10rem]">
									{highLabel}
								</span>
							)}
						</>
					)}
					{mediumPriority.length > 0 && (
						<>
							<button
								type="button"
								className="inline-flex items-center rounded-md bg-yellow-500 px-2 py-1 text-xs font-medium text-white ring-offset-background transition-all hover:bg-yellow-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 cursor-pointer shadow-md"
								onClick={handleAlertClick}
								onKeyDown={handleAlertKeyDown}
								aria-label={`中優先度アラート${mediumPriority.length}件を表示`}
							>
								<Bell className="h-3 w-3 mr-1" />
								{/* <span className="mr-1">{mediumPriority.length}</span> */}
							</button>
							{mediumLabel && (
								<span className="text-xs font-semibold text-amber-600 ml-1 truncate max-w-[10rem]">
									{mediumLabel}
								</span>
							)}
						</>
					)}
					{lowPriority.length > 0 && (
						<>
							<button
								type="button"
								className="inline-flex items-center rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white ring-offset-background transition-all hover:bg-blue-600 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer shadow-md"
								onClick={handleAlertClick}
								onKeyDown={handleAlertKeyDown}
								aria-label={`低優先度アラート${lowPriority.length}件を表示`}
							>
								<Info className="h-3 w-3 mr-1" />
								{/* <span className="mr-1">{lowPriority.length}</span> */}
							</button>
							{lowLabel && (
								<span className="text-xs font-semibold text-blue-600 ml-1 truncate max-w-[10rem]">
									{lowLabel}
								</span>
							)}
						</>
					)}
				</div>
			);
		};

		// アラートの有無に基づいてスタイルを決定
		const hasAlerts = cattleAlerts.length > 0;
		const alertCount = cattleAlerts.length;
		const isHighPriority = cattleAlerts.some((a) => a.severity === "high");

		// アラートの重要度に基づいて背景色を決定
		const getBackgroundStyle = () => {
			if (isHighPriority) {
				return "bg-red-50 border-l-red-500 hover:bg-red-100";
			}
			if (hasAlerts) {
				return "bg-yellow-50 border-l-yellow-500 hover:bg-yellow-100";
			}
			return "hover:bg-muted/50";
		};

		return (
			<div
				key={cattle.cattleId}
				className={"animate-fade-in-up hover-lift"}
				style={{ animationDelay: `${index * 0.05}s` }}
			>
				<div
					className={`w-full flex items-center justify-between p-3 transition-all duration-200 cursor-pointer tap-feedback border-l-4 ${getBackgroundStyle()}`}
					onClick={handleItemClick}
					onKeyDown={handleItemClick}
				>
					<div className="flex flex-col gap-4">
						{/* アラート表示 */}
						{getAlertDisplay()}
						<div className="flex gap-2">
							<p className="font-bold transition-colors duration-200">
								{cattle.name}
							</p>
							<Badge
								variant="outline"
								className="transition-all duration-200 hover:shadow-sm"
							>
								<span
									className={clsx(
										"text-sm font-medium",
										cattle.gender === "雄" && "text-blue-500",
										cattle.gender === "去勢" && "text-gray-500",
										cattle.gender === "雌" && "text-red-500"
									)}
								>
									{cattle.gender}
								</span>
							</Badge>
							<Badge
								variant="default"
								className="transition-all duration-200 hover:shadow-sm"
							>
								{getGrowthStage(cattle.growthStage)}
							</Badge>
							{cattle.status && (
								<Badge
									variant="outline"
									className={classNames(
										"transition-all duration-200 hover:shadow-sm",
										{
											"border-blue-500 text-blue-500":
												cattle.status === "HEALTHY",
											"border-yellow-500 text-yellow-500":
												cattle.status === "PREGNANT",
											"border-green-500 text-green-500":
												cattle.status === "RESTING",
											"border-red-500 text-red-500":
												cattle.status === "TREATING",
											"border-orange-500 text-orange-500":
												cattle.status === "SCHEDULED_FOR_SHIPMENT",
											"border-gray-500 text-gray-500":
												cattle.status === "SHIPPED",
											"border-red-600 text-red-600": cattle.status === "DEAD"
										}
									)}
								>
									{statusLabelMap[cattle.status as Status]}
								</Badge>
							)}
						</div>
						<div className="flex items-center h-3 gap-2 text-xs text-muted-foreground">
							<div>耳標番号：{cattle.earTagNumber}</div>
							<Separator orientation="vertical" />
							<div>日齢：{cattle.daysOld ? `${cattle.daysOld}日` : "-"}</div>
							<Separator orientation="vertical" />
							<div>体重：{cattle.weight ? `${cattle.weight}kg` : "-"}</div>
						</div>
						{/* 空胎日数表示（空胎日数順で並び替えている場合のみ） */}
						{sortBy === "days_open" && (
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<div className="font-medium text-blue-600">
									空胎日数：
									{cattle.breedingStatus?.daysOpen
										? `${cattle.breedingStatus.daysOpen}日`
										: "-"}
								</div>
							</div>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="text-primary tap-feedback hover:scale-110 transition-all duration-200"
							onClick={handleAddEvent}
						>
							<CalendarPlus className="transition-transform duration-200" />
						</Button>
						<ChevronRight className="transition-transform duration-200 hover:translate-x-1" />
					</div>
				</div>
				<Separator className="opacity-50" />

				{/* アラート詳細モーダル */}
				<AlertDetailModal
					isOpen={isAlertModalOpen}
					onClose={() => setIsAlertModalOpen(false)}
					alerts={cattleAlerts}
					cattleName={cattle.name || "名前なし"}
				/>
			</div>
		);
	}
);

CattleItem.displayName = "CattleItem";
