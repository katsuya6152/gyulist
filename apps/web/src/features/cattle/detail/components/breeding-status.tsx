import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GetCattleDetailResType } from "@/services/cattleService";
import {
	AlertTriangle,
	Baby,
	Calendar,
	CheckCircle,
	Clock,
	Syringe
} from "lucide-react";

type BreedingStatusProps = {
	cattle: GetCattleDetailResType;
};

export function BreedingStatus({ cattle }: BreedingStatusProps) {
	if (!cattle.breedingStatus) return null;

	const {
		parity = 0,
		expectedCalvingDate,
		scheduledPregnancyCheckDate,
		daysAfterCalving = 0,
		daysOpen = 0,
		pregnancyDays = 0,
		daysAfterInsemination = 0,
		inseminationCount = 0,
		isDifficultBirth,
		breedingMemo
	} = cattle.breedingStatus;

	// 空胎日数の状態判定
	const getDaysOpenStatus = (days: number) => {
		if (days <= 60)
			return {
				status: "理想範囲",
				color: "bg-green-100 text-green-800",
				icon: CheckCircle
			};
		if (days <= 90)
			return {
				status: "良好",
				color: "bg-blue-100 text-blue-800",
				icon: CheckCircle
			};
		if (days <= 120)
			return {
				status: "要注意",
				color: "bg-yellow-100 text-yellow-800",
				icon: AlertTriangle
			};
		return {
			status: "問題",
			color: "bg-red-100 text-red-800",
			icon: AlertTriangle
		};
	};

	// 妊娠日数の状態判定
	const getPregnancyStatus = (days: number) => {
		if (days <= 90)
			return { status: "妊娠初期", color: "bg-green-100 text-green-800" };
		if (days <= 180)
			return { status: "妊娠中期", color: "bg-yellow-100 text-yellow-800" };
		return { status: "妊娠後期", color: "bg-red-100 text-red-800" };
	};

	// 種付回数の状態判定
	const getInseminationStatus = (count: number) => {
		if (count <= 2)
			return { status: "良好", color: "bg-green-100 text-green-800" };
		if (count <= 4)
			return { status: "要注意", color: "bg-yellow-100 text-yellow-800" };
		return { status: "問題", color: "bg-red-100 text-red-800" };
	};

	const daysOpenStatus = getDaysOpenStatus(daysOpen ?? 0);
	const pregnancyStatus = getPregnancyStatus(pregnancyDays ?? 0);
	const inseminationStatus = getInseminationStatus(inseminationCount ?? 0);

	return (
		<Card className="py-4 gap-2">
			<CardHeader className="px-4">
				<CardTitle className="flex items-center gap-2">
					<Baby className="h-5 w-5" />
					繁殖状態（現在）
				</CardTitle>
			</CardHeader>
			<CardContent className="px-4 pb-2 pt-0 space-y-4">
				{/* 産次 */}
				<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-blue-500" />
						<span className="text-sm font-medium">産次</span>
					</div>
					<Badge variant="outline" className="text-lg font-semibold">
						{parity}産
					</Badge>
				</div>

				{/* 空胎日数 */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-orange-500" />
							<span className="text-sm font-medium">空胎日数</span>
						</div>
						<Badge className={daysOpenStatus.color}>
							{daysOpenStatus.status}
						</Badge>
					</div>
					<div className="space-y-2">
						<Progress
							value={Math.min(((daysOpen ?? 0) / 120) * 100, 100)}
							className="h-2"
							style={
								{
									"--progress-background":
										(daysOpen ?? 0) <= 90
											? "#10b981"
											: (daysOpen ?? 0) <= 120
												? "#f59e0b"
												: "#ef4444"
								} as React.CSSProperties
							}
						/>
						<div className="flex justify-between text-xs text-gray-500">
							<span>0日</span>
							<span className="text-orange-600 font-medium">{daysOpen}日</span>
							<span>120日</span>
						</div>
					</div>
				</div>

				{/* 妊娠日数 */}
				{(pregnancyDays ?? 0) > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Baby className="h-4 w-4 text-purple-500" />
								<span className="text-sm font-medium">妊娠日数</span>
							</div>
							<Badge className={pregnancyStatus.color}>
								{pregnancyStatus.status}
							</Badge>
						</div>
						<div className="space-y-2">
							<Progress
								value={((pregnancyDays ?? 0) / 282) * 100}
								className="h-2"
								style={
									{
										"--progress-background":
											(pregnancyDays ?? 0) <= 90
												? "#10b981"
												: (pregnancyDays ?? 0) <= 180
													? "#f59e0b"
													: "#ef4444"
									} as React.CSSProperties
								}
							/>
							<div className="flex justify-between text-xs text-gray-500">
								<span>0日</span>
								<span className="text-purple-600 font-medium">
									{pregnancyDays}日
								</span>
								<span>282日</span>
							</div>
						</div>
					</div>
				)}

				{/* 種付回数 */}
				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<div className="flex items-center gap-2">
						<Syringe className="h-4 w-4 text-indigo-500" />
						<span className="text-sm font-medium">種付回数</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="font-semibold">{inseminationCount}回</span>
						<Badge className={inseminationStatus.color}>
							{inseminationStatus.status}
						</Badge>
					</div>
				</div>

				{/* その他の情報 */}
				<div className="grid grid-cols-1 gap-3">
					{expectedCalvingDate && (
						<div className="flex items-center justify-between p-2 bg-red-50 rounded">
							<span className="text-sm text-gray-600">分娩予定日</span>
							<span className="font-medium text-red-600">
								{expectedCalvingDate}
							</span>
						</div>
					)}

					{scheduledPregnancyCheckDate && (
						<div className="flex items-center justify-between p-2 bg-blue-50 rounded">
							<span className="text-sm text-gray-600">妊娠鑑定予定日</span>
							<span className="font-medium text-blue-600">
								{scheduledPregnancyCheckDate}
							</span>
						</div>
					)}

					{(daysAfterCalving ?? 0) > 0 && (
						<div className="flex items-center justify-between p-2 bg-green-50 rounded">
							<span className="text-sm text-gray-600">分娩後経過日数</span>
							<span className="font-medium text-green-600">
								{daysAfterCalving}日
							</span>
						</div>
					)}

					{(daysAfterInsemination ?? 0) > 0 && (
						<div className="flex items-center justify-between p-2 bg-purple-50 rounded">
							<span className="text-sm text-gray-600">受精後経過日数</span>
							<span className="font-medium text-purple-600">
								{daysAfterInsemination}日
							</span>
						</div>
					)}
				</div>

				{/* 前回の出産 */}
				{isDifficultBirth !== null && (
					<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<span className="text-sm font-medium">前回の出産</span>
						<Badge
							variant={isDifficultBirth ? "destructive" : "default"}
							className={
								isDifficultBirth
									? "bg-red-100 text-red-800"
									: "bg-green-100 text-green-800"
							}
						>
							{isDifficultBirth ? "難産" : "安産"}
						</Badge>
					</div>
				)}

				{/* 繁殖メモ */}
				{breedingMemo && (
					<div className="p-3 bg-yellow-50 rounded-lg">
						<div className="text-sm font-medium text-gray-700 mb-2">
							繁殖メモ
						</div>
						<div className="text-sm text-gray-600">{breedingMemo}</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
