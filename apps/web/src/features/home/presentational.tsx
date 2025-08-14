"use client";

import { eventTypeColors } from "@/components/event/event-constants";
import { formatEventTime } from "@/components/event/event-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	Calendar,
	Clock,
	Heart,
	Repeat,
	Skull,
	Syringe,
	TrendingUp,
	Truck,
} from "lucide-react";
import type { ReactNode } from "react";

// 一時定数データ（API連携前）
const TODAY_EVENTS: Array<{ time: string; title: string }> = [
	{ time: "08:00", title: "給餌" },
	{ time: "10:30", title: "妊娠鑑定" },
	{ time: "15:00", title: "治療（#102）" },
];

const ALERT_CATTLE: Array<{ name: string; reason: string }> = [
	{ name: "#101 あかね", reason: "発情検知" },
	{ name: "#087 つばき", reason: "治療フォロー" },
];

const STATUS_COUNTS: Record<string, number> = {
	HEALTHY: 32,
	PREGNANT: 12,
	RESTING: 5,
	TREATING: 3,
	SHIPPED: 1,
	DEAD: 0,
};

const STATUS_ICON_MAP: Record<CattleStatus, ReactNode> = {
	HEALTHY: <Heart className="h-4 w-4 text-blue-500" />,
	PREGNANT: <Baby className="h-4 w-4 text-yellow-500" />,
	RESTING: <Bed className="h-4 w-4 text-green-500" />,
	TREATING: <Syringe className="h-4 w-4 text-red-500" />,
	SHIPPED: <Truck className="h-4 w-4 text-gray-500" />,
	DEAD: <Skull className="h-4 w-4 text-red-600" />,
};

const STATUS_TEXT_CLASS_MAP: Record<CattleStatus, string> = {
	HEALTHY: "text-blue-500",
	PREGNANT: "text-yellow-500",
	RESTING: "text-green-500",
	TREATING: "text-red-500",
	SHIPPED: "text-gray-500",
	DEAD: "text-red-600",
};

const STATUS_BORDER_CLASS_MAP: Record<CattleStatus, string> = {
	HEALTHY: "border-blue-500",
	PREGNANT: "border-yellow-500",
	RESTING: "border-green-500",
	TREATING: "border-red-500",
	SHIPPED: "border-gray-500",
	DEAD: "border-red-600",
};

const BREEDING_KPI: Array<{ label: string; value: string; sub?: string }> = [
	{ label: "受胎率", value: "58%" },
	{ label: "平均空胎日数", value: "110日" },
	{ label: "分娩間隔", value: "395日" },
	{ label: "AI回数/受胎", value: "1.6回" },
];

const KPI_TRENDS: Array<{
	label: string;
	delta: string;
	isUp: boolean;
}> = [
	{ label: "受胎率", delta: "+3.1%", isUp: true },
	{ label: "平均空胎日数", delta: "-5日", isUp: true },
	{ label: "分娩間隔", delta: "+2日", isUp: false },
	{ label: "AI回数/受胎", delta: "±0.0回", isUp: true },
];

type HomePresentationProps = {
	todayEvents: Array<{
		eventId: number;
		cattleId: number;
		eventType: string;
		eventDatetime: string;
		notes: string | null;
		cattleName: string;
		cattleEarTagNumber: string;
	}>;
	error?: string;
};

export function HomePresentation({
	todayEvents,
	error,
}: HomePresentationProps) {
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
						{ALERT_CATTLE.length}頭
					</span>
				</CardHeader>
				<CardContent>
					{ALERT_CATTLE.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							現在アラートはありません
						</p>
					) : (
						<ul className="space-y-2">
							{ALERT_CATTLE.map((cattle, idx) => (
								<li
									key={`${cattle.name}-${idx}`}
									className="flex items-center justify-between"
								>
									<span className="text-sm font-medium">{cattle.name}</span>
									<span className="text-xs text-muted-foreground">
										{cattle.reason}
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
									{STATUS_COUNTS[opt.value] ?? 0}
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
						繁殖KPI
					</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{BREEDING_KPI.map((kpi) => (
							<div key={kpi.label} className="rounded-md border p-3">
								<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
									{kpi.label === "受胎率" && <Activity className="h-4 w-4" />}
									{kpi.label === "平均空胎日数" && (
										<Clock className="h-4 w-4" />
									)}
									{kpi.label === "分娩間隔" && <Calendar className="h-4 w-4" />}
									{kpi.label === "AI回数/受胎" && (
										<Repeat className="h-4 w-4" />
									)}
									<span>{kpi.label}</span>
								</div>
								<div className="text-xl font-bold leading-tight">
									{kpi.value}
								</div>
								{kpi.sub && (
									<div className="text-xs text-muted-foreground">{kpi.sub}</div>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* KPIトレンド（最下部） */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<CardTitle className="text-lg font-semibold">KPIトレンド</CardTitle>
					<span className="text-xs text-muted-foreground">前月比</span>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{KPI_TRENDS.map((item) => (
							<div key={item.label} className="rounded-md border p-3">
								<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
									{item.label === "受胎率" && <Activity className="h-4 w-4" />}
									{item.label === "平均空胎日数" && (
										<Clock className="h-4 w-4" />
									)}
									{item.label === "分娩間隔" && (
										<Calendar className="h-4 w-4" />
									)}
									{item.label === "AI回数/受胎" && (
										<Repeat className="h-4 w-4" />
									)}
									<span>{item.label}</span>
								</div>
								<div className="flex items-center gap-1">
									{item.isUp ? (
										<ArrowUpRight className="h-4 w-4 text-emerald-600" />
									) : (
										<ArrowDownRight className="h-4 w-4 text-red-600" />
									)}
									<span
										className={
											item.isUp
												? "text-emerald-700 font-semibold"
												: "text-red-700 font-semibold"
										}
									>
										{item.delta}
									</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
