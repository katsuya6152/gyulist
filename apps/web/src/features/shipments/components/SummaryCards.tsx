"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ShipmentStatistics } from "@/services/shipmentService";

type Props = {
	summary: ShipmentStatistics;
};

export function SummaryCards({ summary }: Props) {
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	const formatRevenue = (revenue: number) => {
		return `¥${(revenue / 10000).toFixed(0)}万`;
	};

	const formatPrice = (price: number) => {
		return `¥${(price / 10000).toFixed(0)}万`;
	};

	// モバイル版: コンパクトなリスト表示
	if (!isDesktop) {
		return (
			<div className="bg-card border rounded-lg p-3">
				<div className="grid grid-cols-3 gap-3 text-center">
					<div>
						<div className="text-sm font-bold text-blue-600">
							{summary.totalShipments}頭
						</div>
						<div className="text-xs text-muted-foreground">出荷</div>
					</div>
					<div>
						<div className="text-sm font-bold text-green-600">
							{formatRevenue(summary.totalRevenue)}
						</div>
						<div className="text-xs text-muted-foreground">総収益</div>
					</div>
					<div>
						<div className="text-sm font-bold text-orange-600">
							{formatPrice(summary.averagePrice)}
						</div>
						<div className="text-xs text-muted-foreground">平均価格</div>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 text-center mt-2 pt-2 border-t border-border">
					<div>
						<div className="text-sm font-bold text-purple-600">
							{summary.averageWeight}kg
						</div>
						<div className="text-xs text-muted-foreground">平均体重</div>
					</div>
					<div>
						<div className="text-sm font-bold text-indigo-600">
							{summary.averageAge}日
						</div>
						<div className="text-xs text-muted-foreground">平均日齢</div>
					</div>
				</div>
			</div>
		);
	}

	// デスクトップ版: カード表示
	return (
		<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
			<Card>
				<CardContent className="p-3">
					<div className="text-lg font-bold">{summary.totalShipments}</div>
					<div className="text-xs text-muted-foreground">総出荷頭数</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-3">
					<div className="text-lg font-bold">
						{formatRevenue(summary.totalRevenue)}
					</div>
					<div className="text-xs text-muted-foreground">総収益</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-3">
					<div className="text-lg font-bold">
						{formatPrice(summary.averagePrice)}
					</div>
					<div className="text-xs text-muted-foreground">平均価格</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-3">
					<div className="text-lg font-bold">{summary.averageWeight}kg</div>
					<div className="text-xs text-muted-foreground">平均体重</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-3">
					<div className="text-lg font-bold">{summary.averageAge}日</div>
					<div className="text-xs text-muted-foreground">平均日齢</div>
				</CardContent>
			</Card>
		</div>
	);
}
