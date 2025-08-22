import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { Calendar, Clock, Target } from "lucide-react";

type BreedingScheduleProps = {
	cattle: GetCattleDetailResType;
};

export function BreedingSchedule({ cattle }: BreedingScheduleProps) {
	if (!cattle.breedingStatus) return null;

	const {
		pregnancyDays = 0,
		expectedCalvingDate,
		scheduledPregnancyCheckDate,
		parity = 0
	} = cattle.breedingStatus;

	// 妊娠期間の計算（通常は282日）
	const PREGNANCY_DURATION = 282;
	const pregnancyProgress = Math.min(
		((pregnancyDays ?? 0) / PREGNANCY_DURATION) * 100,
		100
	);

	// 妊娠段階の判定
	const getPregnancyStage = (days: number) => {
		if (days <= 90)
			return {
				stage: "妊娠初期",
				color: "bg-green-500",
				textColor: "text-green-700"
			};
		if (days <= 180)
			return {
				stage: "妊娠中期",
				color: "bg-yellow-500",
				textColor: "text-yellow-700"
			};
		return {
			stage: "妊娠後期",
			color: "bg-red-500",
			textColor: "text-red-700"
		};
	};

	// 分娩予定日までの残り日数
	const getDaysUntilCalving = () => {
		if (!expectedCalvingDate) return null;
		const today = new Date();
		const calvingDate = new Date(expectedCalvingDate);
		const diffTime = calvingDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const daysUntilCalving = getDaysUntilCalving();
	const pregnancyStage = getPregnancyStage(pregnancyDays ?? 0);

	return (
		<Card className="py-4 gap-2">
			<CardHeader className="px-4">
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					妊娠・分娩スケジュール
				</CardTitle>
			</CardHeader>
			<CardContent className="px-4 pb-2 pt-0 space-y-4">
				{/* 妊娠進行状況 */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">妊娠進行状況</span>
						<Badge variant="outline" className={pregnancyStage.textColor}>
							{pregnancyStage.stage}
						</Badge>
					</div>
					<div className="space-y-2">
						<Progress value={pregnancyProgress} className="h-3" />
						<div className="flex justify-between text-xs text-gray-500">
							<span>{pregnancyDays}日</span>
							<span>{PREGNANCY_DURATION}日</span>
						</div>
					</div>
					<div className="text-center text-sm">
						<span className="font-medium">{pregnancyProgress.toFixed(1)}%</span>{" "}
						完了
					</div>
				</div>

				{/* 分娩予定日カウントダウン */}
				{expectedCalvingDate && (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Target className="h-4 w-4 text-red-500" />
							<span className="text-sm font-medium">分娩予定日</span>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-red-600">
								{expectedCalvingDate}
							</div>
							{daysUntilCalving !== null && (
								<div className="text-sm text-gray-600">
									{daysUntilCalving > 0 ? (
										<span>
											あと{" "}
											<span className="font-semibold text-red-600">
												{daysUntilCalving}
											</span>{" "}
											日
										</span>
									) : daysUntilCalving === 0 ? (
										<span className="font-semibold text-red-600">
											本日が予定日です！
										</span>
									) : (
										<span className="font-semibold text-gray-500">
											予定日を過ぎています
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				{/* 妊娠鑑定予定日 */}
				{scheduledPregnancyCheckDate && (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">妊娠鑑定予定日</span>
						</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-blue-600">
								{scheduledPregnancyCheckDate}
							</div>
						</div>
					</div>
				)}

				{/* 産次情報 */}
				<div className="pt-2 border-t">
					<div className="text-center">
						<span className="text-sm text-gray-500">産次: </span>
						<span className="text-lg font-semibold text-gray-700">
							{parity}産
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
