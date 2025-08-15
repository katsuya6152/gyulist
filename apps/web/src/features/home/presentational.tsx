"use client";

import { formatEventTime } from "@/components/event/event-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@/components/ui/popover";
import { eventTypeColors } from "@/constants/events";
import { statusLabelMap, statusOptions } from "@/features/cattle/constants";
import type { CattleStatus } from "@/features/cattle/constants";
import { EVENT_TYPE_LABELS } from "@repo/api";
import {
	Activity,
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Baby,
	Bed,
	Bell,
	Calendar,
	Clock,
	Heart,
	Info,
	Repeat,
	Skull,
	Syringe,
	TrendingUp,
	Truck
} from "lucide-react";
import type { ReactNode } from "react";

const STATUS_ICON_MAP: Record<CattleStatus, ReactNode> = {
	HEALTHY: <Heart className="h-4 w-4 text-blue-500" />,
	PREGNANT: <Baby className="h-4 w-4 text-yellow-500" />,
	RESTING: <Bed className="h-4 w-4 text-green-500" />,
	TREATING: <Syringe className="h-4 w-4 text-red-500" />,
	SHIPPED: <Truck className="h-4 w-4 text-gray-500" />,
	DEAD: <Skull className="h-4 w-4 text-red-600" />
};

const STATUS_TEXT_CLASS_MAP: Record<CattleStatus, string> = {
	HEALTHY: "text-blue-500",
	PREGNANT: "text-yellow-500",
	RESTING: "text-green-500",
	TREATING: "text-red-500",
	SHIPPED: "text-gray-500",
	DEAD: "text-red-600"
};

const STATUS_BORDER_CLASS_MAP: Record<CattleStatus, string> = {
	HEALTHY: "border-blue-500",
	PREGNANT: "border-yellow-500",
	RESTING: "border-green-500",
	TREATING: "border-red-500",
	SHIPPED: "border-gray-500",
	DEAD: "border-red-600"
};

//

type HomePresentationProps = {
	todayEvents: Array<{
		eventId: number;
		cattleId: number;
		eventType: string;
		eventDatetime: string;
		notes: string | null;
		cattleName?: string | null;
		cattleEarTagNumber?: number | null;
	}>;
	statusCounts: Record<
		"HEALTHY" | "PREGNANT" | "RESTING" | "TREATING" | "SHIPPED" | "DEAD",
		number
	>;
	alerts: Array<{
		alertId: string;
		type: string;
		severity: "high" | "medium" | "low";
		cattleId: number;
		cattleName: string | null;
		cattleEarTagNumber: string | null;
		dueAt: string | null;
		message: string;
	}>;
	breedingKpi: {
		conceptionRate: number | null;
		avgDaysOpen: number | null;
		avgCalvingInterval: number | null;
		aiPerConception: number | null;
	};
	kpiTrendDeltas?: Array<{
		month: string;
		metrics: {
			conceptionRate: number | null;
			avgDaysOpen: number | null;
			avgCalvingInterval: number | null;
			aiPerConception: number | null;
		};
	}>;
	error?: string;
};

export function HomePresentation({
	todayEvents,
	statusCounts,
	alerts,
	breedingKpi,
	kpiTrendDeltas,
	error
}: HomePresentationProps) {
	const SEVERITY_ICON_MAP: Record<"high" | "medium" | "low", ReactNode> = {
		high: <AlertTriangle className="h-4 w-4" />,
		medium: <Bell className="h-4 w-4" />,
		low: <Info className="h-4 w-4" />
	};

	const SEVERITY_TEXT_CLASS_MAP: Record<"high" | "medium" | "low", string> = {
		high: "text-red-600",
		medium: "text-amber-600",
		low: "text-blue-600"
	};

	// KPIトレンド（前月比のみ表示）
	const latest = (
		arr?: Array<{
			metrics: {
				conceptionRate: number | null;
				avgDaysOpen: number | null;
				avgCalvingInterval: number | null;
				aiPerConception: number | null;
			};
		}>
	) => (Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined);
	const latestDelta = latest(kpiTrendDeltas);
	const rateDelta: number | null = latestDelta?.metrics?.conceptionRate ?? null;
	const daysOpenDelta: number | null =
		latestDelta?.metrics?.avgDaysOpen ?? null;
	const calvingIntervalDelta: number | null =
		latestDelta?.metrics?.avgCalvingInterval ?? null;
	const aiPerDelta: number | null =
		latestDelta?.metrics?.aiPerConception ?? null;

	const formatDelta = (d: number | null, unit: string) => {
		if (d == null) return "-";
		const v = Math.round(d * 10) / 10;
		const prefix = v > 0 ? "+" : v < 0 ? "" : "±";
		return `${prefix}${Math.abs(v)}${unit}`;
	};
	return (
		<div className="container mx-auto px-4 py-4 space-y-3">
			{/* 今日のイベント */}
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

			{/* アラートのある牛 */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-600" />
						アラートのある牛
					</CardTitle>
					<span className="text-sm text-muted-foreground">
						{alerts.length}頭
					</span>
				</CardHeader>
				<CardContent>
					{alerts.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							現在アラートはありません
						</p>
					) : (
						<ul className="space-y-2">
							{alerts.map((a) => (
								<li
									key={a.alertId}
									className="flex items-start justify-between gap-3"
								>
									<span className="text-sm font-medium shrink-0">
										{a.cattleName}（{a.cattleEarTagNumber}）
									</span>
									<span
										className={`text-xs flex-1 break-words whitespace-normal inline-flex items-start gap-1 ${SEVERITY_TEXT_CLASS_MAP[a.severity]}`}
									>
										{SEVERITY_ICON_MAP[a.severity]}
										<span
											className={a.severity === "high" ? "font-semibold" : ""}
										>
											{a.message}
										</span>
									</span>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			{/* 各ステータスの牛の数 */}
			<Card>
				<CardHeader className="space-y-2 pb-4">
					<CardTitle className="text-lg font-semibold">
						各ステータスの牛の数
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{statusOptions.map((opt) => (
							<div
								key={opt.value}
								className="flex items-center justify-between rounded-md border p-3"
							>
								<div className="flex items-center gap-2 min-w-0">
									{STATUS_ICON_MAP[opt.value as CattleStatus]}
									<Badge
										variant="outline"
										className={`truncate max-w-[70%] ${STATUS_TEXT_CLASS_MAP[opt.value as CattleStatus]} ${STATUS_BORDER_CLASS_MAP[opt.value as CattleStatus]}`}
									>
										{statusLabelMap[opt.value]}
									</Badge>
								</div>
								<span className="text-base font-semibold">
									{statusCounts[opt.value as keyof typeof statusCounts] ?? 0}
								</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* 繁殖KPI */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						<Activity className="h-5 w-5" />
						繁殖KPI（当月）
					</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[
							{
								key: "受胎率",
								value:
									breedingKpi.conceptionRate != null
										? `${breedingKpi.conceptionRate}%`
										: "-",
								tip: "今月のAI本数に対する、今月に分娩で受胎確定できた割合"
							},
							{
								key: "平均空胎日数",
								value:
									breedingKpi.avgDaysOpen != null
										? `${breedingKpi.avgDaysOpen}日`
										: "-",
								tip: "前回分娩から受胎AIまでの日数の平均（今月に受胎AIがあったケース）"
							},
							{
								key: "分娩間隔",
								value:
									breedingKpi.avgCalvingInterval != null
										? `${breedingKpi.avgCalvingInterval}日`
										: "-",
								tip: "同一個体の連続分娩の間隔の平均（後側分娩が今月のもの）"
							},
							{
								key: "AI回数/受胎",
								value:
									breedingKpi.aiPerConception != null
										? `${breedingKpi.aiPerConception}回`
										: "-",
								tip: "受胎成立までに要したAI本数の平均（今月に受胎成立したケース）"
							}
						].map((kpi) => (
							<div key={kpi.key} className="rounded-md border p-3">
								<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
									{kpi.key === "受胎率" && <Activity className="h-4 w-4" />}
									{kpi.key === "平均空胎日数" && <Clock className="h-4 w-4" />}
									{kpi.key === "分娩間隔" && <Calendar className="h-4 w-4" />}
									{kpi.key === "AI回数/受胎" && <Repeat className="h-4 w-4" />}
									<span className="inline-flex items-center gap-1">
										{kpi.key}
										<Popover>
											<PopoverTrigger asChild>
												<button
													type="button"
													aria-label={kpi.tip}
													className="p-0.5"
												>
													<Info className="h-3 w-3 text-muted-foreground" />
												</button>
											</PopoverTrigger>
											<PopoverContent
												side="top"
												align="start"
												className="max-w-[220px] text-xs leading-relaxed"
											>
												{kpi.tip}
											</PopoverContent>
										</Popover>
									</span>
								</div>
								<div className="text-xl font-bold leading-tight">
									{kpi.value}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* KPIトレンド（前月比のみ） */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<CardTitle className="text-lg font-semibold">KPIトレンド</CardTitle>
					<span className="text-xs text-muted-foreground">前月比</span>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						<div className="rounded-md border p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								<Activity className="h-4 w-4" />
								<span>受胎率</span>
							</div>
							<div className="flex items-center gap-1">
								{rateDelta != null && rateDelta > 0 ? (
									<ArrowUpRight className="h-4 w-4 text-emerald-600" />
								) : (
									<ArrowDownRight className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm font-semibold">
									{formatDelta(rateDelta, "%")}
								</span>
							</div>
						</div>
						<div className="rounded-md border p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								<Clock className="h-4 w-4" />
								<span>平均空胎日数</span>
							</div>
							<div className="flex items-center gap-1">
								{daysOpenDelta != null && daysOpenDelta < 0 ? (
									<ArrowUpRight className="h-4 w-4 text-emerald-600" />
								) : (
									<ArrowDownRight className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm font-semibold">
									{formatDelta(daysOpenDelta, "日")}
								</span>
							</div>
						</div>
						<div className="rounded-md border p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								<Calendar className="h-4 w-4" />
								<span>分娩間隔</span>
							</div>
							<div className="flex items-center gap-1">
								{calvingIntervalDelta != null && calvingIntervalDelta < 0 ? (
									<ArrowUpRight className="h-4 w-4 text-emerald-600" />
								) : (
									<ArrowDownRight className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm font-semibold">
									{formatDelta(calvingIntervalDelta, "日")}
								</span>
							</div>
						</div>
						<div className="rounded-md border p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								<Repeat className="h-4 w-4" />
								<span>AI回数/受胎</span>
							</div>
							<div className="flex items-center gap-1">
								{aiPerDelta != null && aiPerDelta < 0 ? (
									<ArrowUpRight className="h-4 w-4 text-emerald-600" />
								) : (
									<ArrowDownRight className="h-4 w-4 text-red-600" />
								)}
								<span className="text-sm font-semibold">
									{formatDelta(aiPerDelta, "回")}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
