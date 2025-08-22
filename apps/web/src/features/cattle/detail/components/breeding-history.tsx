import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetCattleDetailResType } from "@/services/cattleService";
import {
	Activity,
	Minus,
	Target,
	TrendingDown,
	TrendingUp
} from "lucide-react";
import {
	Bar,
	BarChart,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from "recharts";

type BreedingHistoryProps = {
	cattle: GetCattleDetailResType;
};

export function BreedingHistory({ cattle }: BreedingHistoryProps) {
	if (!cattle.breedingSummary) return null;

	const {
		totalInseminationCount = 0,
		averageDaysOpen = 0,
		averagePregnancyPeriod = 0,
		averageCalvingInterval = 0,
		difficultBirthCount = 0,
		pregnancyHeadCount = 0,
		pregnancySuccessRate = 0
	} = cattle.breedingSummary;

	// 受胎率の円グラフデータ
	const conceptionData = [
		{ name: "成功", value: pregnancySuccessRate ?? 0, color: "#10b981" },
		{ name: "失敗", value: 100 - (pregnancySuccessRate ?? 0), color: "#ef4444" }
	];

	// 平均値の棒グラフデータ
	const averageData = [
		{ name: "空胎日数", value: averageDaysOpen, target: 75, color: "#3b82f6" },
		{
			name: "妊娠期間",
			value: averagePregnancyPeriod,
			target: 282,
			color: "#8b5cf6"
		},
		{
			name: "分娩間隔",
			value: averageCalvingInterval,
			target: 365,
			color: "#f59e0b"
		}
	];

	// パフォーマンス評価
	const getPerformanceRating = (
		value: number,
		target: number,
		lowerIsBetter = false
	) => {
		const ratio = lowerIsBetter ? target / value : value / target;
		if (ratio >= 1.2)
			return {
				rating: "優秀",
				color: "bg-green-100 text-green-800",
				icon: TrendingUp
			};
		if (ratio >= 0.9)
			return {
				rating: "良好",
				color: "bg-blue-100 text-blue-800",
				icon: Minus
			};
		return {
			rating: "要改善",
			color: "bg-red-100 text-red-800",
			icon: TrendingDown
		};
	};

	// 空胎日数の評価
	const daysOpenRating = getPerformanceRating(averageDaysOpen ?? 0, 75, true);
	const DaysOpenIcon = daysOpenRating.icon;

	// 分娩間隔の評価
	const calvingIntervalRating = getPerformanceRating(
		averageCalvingInterval ?? 0,
		365,
		true
	);
	const CalvingIntervalIcon = calvingIntervalRating.icon;

	return (
		<Card className="py-4 gap-2">
			<CardHeader className="px-4">
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5" />
					繁殖履歴・パフォーマンス
				</CardTitle>
			</CardHeader>
			<CardContent className="px-4 pb-2 pt-0 space-y-6">
				{/* 受胎率の円グラフ */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">受胎率</span>
						<Badge variant="outline" className="text-lg font-semibold">
							{pregnancySuccessRate}%
						</Badge>
					</div>
					<div className="h-48">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={conceptionData}
									cx="50%"
									cy="50%"
									innerRadius={40}
									outerRadius={80}
									paddingAngle={5}
									dataKey="value"
								>
									{conceptionData.map((entry) => (
										<Cell key={`cell-${entry.name}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip formatter={(value) => `${value}%`} />
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="flex justify-center gap-4 text-xs">
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded-full bg-green-500" />
							<span>成功</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded-full bg-red-500" />
							<span>失敗</span>
						</div>
					</div>
				</div>

				{/* 平均値の棒グラフ */}
				<div className="space-y-3">
					<span className="text-sm font-medium">主要指標の平均値</span>
					<div className="h-48">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={averageData}
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
							>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip formatter={(value) => `${value}日`} />
								<Bar dataKey="value" fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* パフォーマンス評価 */}
				<div className="space-y-3">
					<span className="text-sm font-medium">パフォーマンス評価</span>
					<div className="grid grid-cols-1 gap-3">
						{/* 空胎日数 */}
						<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center gap-2">
								<Target className="h-4 w-4 text-blue-500" />
								<span className="text-sm">平均空胎日数</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="font-semibold">{averageDaysOpen}日</span>
								<Badge className={daysOpenRating.color}>
									<DaysOpenIcon className="h-3 w-3 mr-1" />
									{daysOpenRating.rating}
								</Badge>
							</div>
						</div>

						{/* 分娩間隔 */}
						<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
							<div className="flex items-center gap-2">
								<Target className="h-4 w-4 text-orange-500" />
								<span className="text-sm">平均分娩間隔</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="font-semibold">
									{averageCalvingInterval}日
								</span>
								<Badge className={calvingIntervalRating.color}>
									<CalvingIntervalIcon className="h-3 w-3 mr-1" />
									{calvingIntervalRating.rating}
								</Badge>
							</div>
						</div>
					</div>
				</div>

				{/* 統計サマリー */}
				<div className="grid grid-cols-2 gap-4 pt-2 border-t">
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">
							{totalInseminationCount}
						</div>
						<div className="text-sm text-gray-500">累計種付回数</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">
							{pregnancyHeadCount}
						</div>
						<div className="text-sm text-gray-500">受胎頭数</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-purple-600">
							{averagePregnancyPeriod}
						</div>
						<div className="text-sm text-gray-500">平均妊娠期間</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600">
							{difficultBirthCount}
						</div>
						<div className="text-sm text-gray-500">難産回数</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
